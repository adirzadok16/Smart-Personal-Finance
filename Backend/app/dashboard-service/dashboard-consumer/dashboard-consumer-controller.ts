import { MoreThan, Repository } from 'typeorm';
import { getServiceDatabase } from '../../db/database';
import RedisService from '../../utilities/redis_service';
import { TransactionCreatedEvent, TransactionUpdatedEvent, TransactionDeletedEvent, TransactionType } from '../dashboard_models';
import { DashboardMonthlySummary, DashboardCategorySummary, DashboardRecentTransaction } from '../dashboard_schemas';

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
    await updateDashboardCache(data.userId);

    console.log(`[SUMMARIES] Summaries and cache updated for user: ${data.userId}`);
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
        transactionData = data as any;
        switch (action) {
            case 'create':
                if (transactionData.type === TransactionType.INCOME) {
                    monthlySummary.totalIncome += transactionData.amount;
                } else {
                    monthlySummary.totalExpense += transactionData.amount;
                }
                monthlySummary.balance = monthlySummary.totalIncome - monthlySummary.totalExpense;
                console.log(`[MONTHLY] Monthly summary updated for create.`);
                break;
            case 'update':
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

    await repo.save(monthlySummary);
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
                categorySummary.amount += transactionData.amount;
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
            transactionData = data as TransactionCreatedEvent;
            await repo.upsert({
                transactionId: transactionData.transactionId,
                userId: transactionData.userId,
                title: transactionData.description,
                category: transactionData.category,
                type: transactionData.type,
                amount: transactionData.amount,
            }, { conflictPaths: ['transactionId'], skipUpdateIfNoValuesChanged: true });
            break;

        case 'update':
            transactionData = data as TransactionUpdatedEvent;
            await repo.upsert({
                transactionId: transactionData.transactionId,
                userId: transactionData.userId,
                title: transactionData.newDescription,
                category: transactionData.newCategory,
                type: transactionData.type,
                amount: transactionData.newAmount,
            }, { conflictPaths: ['transactionId'], skipUpdateIfNoValuesChanged: true });
            break;

        case 'delete':
            transactionData = data as TransactionDeletedEvent;
            await repo.delete({ transactionId: transactionData.transactionId });
            break;
    }
    console.log(`[RECENT] Recent transaction update completed.`);
}

// ------------------ DASHBOARD CACHE ------------------
async function updateDashboardCache(userId: string) {
    console.log(`[CACHE] Updating dashboard cache for user: ${userId}`);

    try {
        const db = getServiceDatabase('dashboard');
        const monthlyRepo = db.getRepository(DashboardMonthlySummary);
        const categoryRepo = db.getRepository(DashboardCategorySummary);
        const transactionRepo = db.getRepository(DashboardRecentTransaction);

        const now = new Date();
        const currentYear = now.getFullYear();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);

        // Fetch all monthly summaries for the current year
        const monthlySummary = await monthlyRepo.find({
            where: { userId, year: currentYear },
            order: { month: 'ASC' }
        });

        // Fetch all category summaries for the current year
        const categorySummary = await categoryRepo.find({
            where: { userId, year: currentYear },
        });

        // Fetch recent transactions from the last 6 months
        const recentTransactions = await transactionRepo.find({
            where: {
                userId,
                date: MoreThan(sixMonthsAgo.toISOString())
            },
            order: { date: 'DESC' }
        });

        const dashboardData = {
            monthlySummary,
            categorySummary,
            recentTransactions
        };

        const cacheKey = `dashboard:${userId}`;
        await RedisService.set(cacheKey, JSON.stringify(dashboardData), 604800); //1 week TTL
        console.log(`[CACHE] Dashboard cache updated successfully for user: ${userId}`);
    } catch (error) {
        console.error(`[CACHE] Failed to update dashboard cache for user: ${userId}`, error);
    }
}
