import { MoreThan, Repository } from 'typeorm';
import { getServiceDatabase } from '../../db/database';
import RedisService from '../../utilities/redis_service';
import { TransactionCreatedEvent, TransactionUpdatedEvent, TransactionDeletedEvent, TransactionType } from '../dashboard_models';
import { DashboardMonthlySummary, DashboardCategorySummary, DashboardRecentTransaction } from '../dashboard_schemas';
import DashboardService from '../dashboard_service';

// ------------------ CORE LOGIC ------------------

/**
 * processTransaction
 * @param data - Transaction event data (created, updated, or deleted)
 * @param action - The action type: 'create', 'update', or 'delete'
 * 
 * What it does:
 *  - Starts a DB transaction
 *  - Calls updateSummaries to update monthly summary, category summary, recent transactions
 *  - Updates Redis cache after DB changes
 */
export async function processTransaction(
    data: TransactionCreatedEvent | TransactionUpdatedEvent | TransactionDeletedEvent,
    action: 'create' | 'update' | 'delete'
) {
    console.log(`[PROCESS] Starting transaction process. Action: ${action}, User: ${data.userId}`);

    try {
        const db = getServiceDatabase('dashboard');
        console.log('[PROCESS] Starting DB transaction...');
        await db.transaction(async manager => {
            const monthlyRepo = manager.getRepository(DashboardMonthlySummary);
            const categoryRepo = manager.getRepository(DashboardCategorySummary);
            const recentTransactionRepo = manager.getRepository(DashboardRecentTransaction);

            console.log('[PROCESS] Updating summaries...');
            switch (action) {
                case 'create':
                    await updateSummaries(monthlyRepo, categoryRepo, recentTransactionRepo, data as TransactionCreatedEvent, 'create');
                    break;
                case 'update':
                    await updateSummaries(monthlyRepo, categoryRepo, recentTransactionRepo, data as TransactionUpdatedEvent, 'update');
                    break;
                case 'delete':
                    await updateSummaries(monthlyRepo, categoryRepo, recentTransactionRepo, data as TransactionDeletedEvent, 'delete');
                    break;
            }
        });

        console.log('[PROCESS] Updating cache...');
        await updateDashboardCache(data.userId);

        console.log(`[PROCESS] Transaction process completed for user: ${data.userId}`);
    } catch (error) {
        console.error(`[PROCESS] Failed to handle transaction for user: ${data.userId}`, error);
        throw error;
    }
}

/**
 * updateSummaries
 * @param monthlyRepo - Repository for monthly summary
 * @param categoryRepo - Repository for category summary
 * @param recentTransactionRepo - Repository for recent transactions
 * @param data - Transaction event data
 * @param action - Action type
 * 
 * What it does:
 *  - Updates monthly summary
 *  - Updates category summary
 *  - Updates recent transactions
 *  - Updates dashboard cache in Redis
 */
export async function updateSummaries(
    monthlyRepo: Repository<DashboardMonthlySummary>,
    categoryRepo: Repository<DashboardCategorySummary>,
    recentTransactionRepo: Repository<DashboardRecentTransaction>,
    data: any,
    action: 'create' | 'update' | 'delete'
) {
    console.log(`[SUMMARIES] Updating summaries for user: ${data.userId}, Action: ${action}`);

    await updateMonthlySummary(monthlyRepo, data, action);
    await updateCategorySummary(categoryRepo, data, action);
    await updateRecentTransaction(recentTransactionRepo, data, action);

    console.log(`[SUMMARIES] DB Tables updated for user: ${data.userId}`);
}

// ------------------ MONTHLY SUMMARY ------------------
async function updateMonthlySummary(
    repo: Repository<DashboardMonthlySummary>,
    data: TransactionCreatedEvent | TransactionUpdatedEvent | TransactionDeletedEvent,
    action: 'create' | 'update' | 'delete'
) {
    console.log(`[MONTHLY] Updating monthly summary for user: ${data.userId}, Action: ${action}`);
    const filter = { userId: data.userId, month: data.month, year: data.year };
    let monthlySummary = await repo.findOne({ where: filter });
    let transactionData;

    if (!monthlySummary) {
        if (action === 'delete' || action === 'update') {
            console.log(`[MONTHLY] No existing monthly summary to update/delete.`);
            return;
        }
        transactionData = data as TransactionCreatedEvent;
        monthlySummary = repo.create({
            ...filter,
            totalIncome: transactionData.type === TransactionType.INCOME ? transactionData.amount : 0,
            totalExpense: transactionData.type === TransactionType.EXPENSE ? transactionData.amount : 0,
            balance: transactionData.type === TransactionType.INCOME ? transactionData.amount : -transactionData.amount,
        });
        console.log(`[MONTHLY] Created new monthly summary.`);
    } else {
        switch (action) {
            case 'create':
                transactionData = data as TransactionCreatedEvent;
                if (transactionData.type === TransactionType.INCOME) {
                    monthlySummary.totalIncome = Number(monthlySummary.totalIncome) + transactionData.amount;
                    console.log(`[MONTHLY] New Total Income: ${monthlySummary.totalIncome}`);
                } else {
                    monthlySummary.totalExpense = Number(monthlySummary.totalExpense) + transactionData.amount;
                    console.log(`[MONTHLY] New Total Expense: ${monthlySummary.totalExpense}`);
                }
                monthlySummary.balance = monthlySummary.totalIncome - monthlySummary.totalExpense;
                console.log(`[MONTHLY] Monthly summary updated for create.`);
                break;
            case 'update':
                transactionData = data as TransactionUpdatedEvent;
                if (transactionData.oldAmount === transactionData.newAmount) return;
                if (transactionData.type === TransactionType.INCOME) {
                    monthlySummary.totalIncome -= transactionData.oldAmount;
                    monthlySummary.totalIncome += transactionData.newAmount;
                } else {
                    monthlySummary.totalExpense -= transactionData.oldAmount;
                    monthlySummary.totalExpense += transactionData.newAmount;
                }
                monthlySummary.balance = monthlySummary.totalIncome - monthlySummary.totalExpense;
                console.log(`[MONTHLY] Monthly summary updated for update.`);
                break;
            case 'delete':
                transactionData = data as TransactionDeletedEvent;
                if (transactionData.type === TransactionType.INCOME) {
                    monthlySummary.totalIncome -= transactionData.amount;
                } else {
                    monthlySummary.totalExpense -= transactionData.amount;
                }
                monthlySummary.balance = monthlySummary.totalIncome - monthlySummary.totalExpense;
                console.log(`[MONTHLY] Monthly summary updated for delete.`);
                break;
        }
    }

    const s = await repo.save(monthlySummary);
    console.log(s);
    console.log(`[MONTHLY] Monthly summary saved.`);
}

// ------------------ CATEGORY SUMMARY ------------------
async function updateCategorySummary(
    repo: Repository<DashboardCategorySummary>,
    data: TransactionCreatedEvent | TransactionUpdatedEvent | TransactionDeletedEvent,
    action: 'create' | 'update' | 'delete'
) {
    console.log(`[CATEGORY] Updating category summary for user: ${data.userId}, Action: ${action}`);
    let transactionData: any;
    let categorySummary: any;
    let filter: any;

    switch (action) {
        case 'create':
            transactionData = data as TransactionCreatedEvent;
            filter = { userId: transactionData.userId, month: transactionData.month, year: transactionData.year, category: transactionData.category };
            categorySummary = await repo.findOne({ where: filter });
            if (!categorySummary) {
                categorySummary = repo.create({ ...filter, amount: transactionData.amount });
            } else {
                categorySummary.amount = Number(categorySummary.amount) + transactionData.amount;
            }
            await repo.save(categorySummary);
            console.log(`[CATEGORY] Category summary updated for create.`);
            break;

        case 'update':
            transactionData = data as TransactionUpdatedEvent;
            // If category unchanged
            if (transactionData.oldCategory === transactionData.newCategory) {
                if (transactionData.oldAmount === transactionData.newAmount) return;
                filter = { userId: transactionData.userId, month: transactionData.month, year: transactionData.year, category: transactionData.oldCategory };
                categorySummary = await repo.findOne({ where: filter });
                if (categorySummary) {
                    categorySummary.amount += (transactionData.newAmount - transactionData.oldAmount);
                    await repo.save(categorySummary);
                    console.log(`[CATEGORY] Category summary updated for amount change.`);
                }
            } else { // category changed
                const oldFilter = { userId: transactionData.userId, month: transactionData.month, year: transactionData.year, category: transactionData.oldCategory };
                const oldCategorySummary = await repo.findOne({ where: oldFilter });
                if (oldCategorySummary) {
                    oldCategorySummary.amount -= transactionData.oldAmount;
                    await repo.save(oldCategorySummary);
                }

                const newFilter = { userId: transactionData.userId, month: transactionData.month, year: transactionData.year, category: transactionData.newCategory };
                const newCategorySummary = await repo.findOne({ where: newFilter });
                if (newCategorySummary) {
                    newCategorySummary.amount += transactionData.newAmount;
                    await repo.save(newCategorySummary);
                }
                console.log(`[CATEGORY] Category summary updated for category change.`);
            }
            break;

        case 'delete':
            transactionData = data as TransactionDeletedEvent;
            filter = { userId: transactionData.userId, month: transactionData.month, year: transactionData.year, category: transactionData.category };
            categorySummary = await repo.findOne({ where: filter });
            if (!categorySummary) return;
            categorySummary.amount -= transactionData.amount;
            await repo.save(categorySummary);
            console.log(`[CATEGORY] Category summary updated for delete.`);
            break;
    }
}

// ------------------ RECENT TRANSACTION ------------------
async function updateRecentTransaction(
    repo: Repository<DashboardRecentTransaction>,
    data: TransactionCreatedEvent | TransactionUpdatedEvent | TransactionDeletedEvent,
    action: 'create' | 'update' | 'delete'
) {
    console.log(`[RECENT] Updating recent transactions for user: ${data.userId}, Action: ${action}`);
    let transactionData: any;

      switch (action) {
        case 'create':
            console.log('[RECENT] Create recent transactions');
            transactionData = data as TransactionCreatedEvent;
            const createRecentTransaction = await repo.save({
                transactionId: transactionData.transactionId,
                userId: transactionData.userId,
                title: transactionData.title || transactionData.description,
                category: transactionData.category,
                type: transactionData.type,
                date: convertDate(transactionData.date), // ✅ CHANGED
                amount: transactionData.amount,
            });
            console.log('[RECENT] Create recent transactions', createRecentTransaction);
            break;

        case 'update':
            console.log('[RECENT] Update recent transactions');
            transactionData = data as TransactionUpdatedEvent;
            await repo.upsert({
                transactionId: transactionData.transactionId,
                userId: transactionData.userId,
                title: transactionData.newTitle || transactionData.newDescription,
                category: transactionData.newCategory,
                type: transactionData.type,
                date: convertDate(transactionData.date), // ✅ CHANGED
                amount: transactionData.newAmount,
            }, { conflictPaths: ['transactionId'], skipUpdateIfNoValuesChanged: true });
            break;

        case 'delete':
            console.log('[RECENT] Delete recent transactions');
            transactionData = data as TransactionDeletedEvent;
            await repo.delete({ transactionId: transactionData.transactionId });
            break;
    }
    console.log(`[RECENT] Recent transaction update completed.`);
}

// ------------------ DASHBOARD CACHE ------------------
async function updateDashboardCache(userId: string) {
    console.log(`[CACHE] Updating dashboard cache for user: ${userId}`);
    const cacheKey = `dashboard:${userId}`;
    const CACHE_TTL = 60 * 60 * 24; // 24 hours
    try {
        // DO NOT rebuild the logic here. 
        // Simply call the Service's getDashboard method.
        // It already handles fetching from DB with the correct filters/sorting 
        // and saving the result to Redis.
        await DashboardService.fetchAndCacheDashboardData(userId, cacheKey, CACHE_TTL);

        console.log(`[CACHE] Dashboard cache updated successfully via DashboardService.`);
    } catch (error) {
        console.error(`[CACHE] Failed to update dashboard cache for user: ${userId}`, error);
    }
}

function convertDate(date: string): string {
    if (date.includes('T')) return date; // already ISO
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`;
}
