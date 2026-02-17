import 'reflect-metadata';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

/* ===================== DB MANAGER ===================== */
import { getServiceDatabase } from './database';

/* ===================== ENTITIES ===================== */
import { User_Table } from '../auth-service/auth_schemas';
import { Transaction_Table } from '../transaction-service/transaction_schemas';
import {
  DashboardMonthlySummary,
  DashboardCategorySummary,
  DashboardRecentTransaction,
} from '../dashboard-service/dashboard_schemas';

/* ===================== CONFIG ===================== */
const MONTHS_BACK = 14; // Matches the long-term dashboard views
const DEMO_EMAIL = 'demo@test.com';

/* ===================== SEED FUNCTION ===================== */
export async function seedAllDatabases() {
  if (process.env.SEED_DATA !== 'true') {
    console.log('ℹ️ SEED_DATA=false, skipping seed');
    return;
  }

  console.log(`🌱 Starting HIGH-QUALITY uniform seed (${MONTHS_BACK} months)...`);

  // 1. AUTH SERVICE - Setup Demo User
  const authDB = getServiceDatabase('auth');
  const authRepo = authDB.getRepository(User_Table);
  let user = await authRepo.findOne({ where: { email: DEMO_EMAIL } });

  if (!user) {
    user = await authRepo.save(
      authRepo.create({
        first_name: 'Demo',
        last_name: 'User',
        email: DEMO_EMAIL,
        password: await bcrypt.hash('123456', 10),
      })
    );
    console.log('✅ Auth DB: user created');
  }
  const userId = user.id;

  // 2. PREPARE REPOSITORIES
  const transactionDB = getServiceDatabase('transaction');
  const txRepo = transactionDB.getRepository(Transaction_Table);

  const dashboardDB = getServiceDatabase('dashboard');
  const monthlyRepo = dashboardDB.getRepository(DashboardMonthlySummary);
  const categoryRepo = dashboardDB.getRepository(DashboardCategorySummary);
  const recentRepo = dashboardDB.getRepository(DashboardRecentTransaction);

  // 3. CLEAN START
  console.log('🧹 Cleaning existing mock data for demo user...');
  await txRepo.delete({ user_id: userId });
  await monthlyRepo.delete({ userId });
  await categoryRepo.delete({ userId });
  await recentRepo.clear();

  // 4. GENERATE MASTER DATA (Single Source of Truth)
  const categories = ['Food', 'Rent', 'Fun', 'Transport'];
  const masterTransactions: any[] = [];

  for (let m = 0; m < MONTHS_BACK; m++) {
    const baseDate = new Date();
    baseDate.setDate(15); // Prevent rollover bug
    baseDate.setMonth(baseDate.getMonth() - m);

    // Monthly Salary
    const salaryDate = new Date(baseDate);
    salaryDate.setDate(1);
    masterTransactions.push({
      transaction_id: uuid(),
      user_id: userId,
      amount: 8000.00,
      category: 'Salary',
      type: 'income',
      title: 'Monthly Salary',
      date: salaryDate.toISOString(),
    });

    // Random Monthly Expenses
    for (let i = 0; i < 7; i++) {
      const expenseDate = new Date(baseDate);
      expenseDate.setDate(Math.floor(Math.random() * 28) + 1);

      masterTransactions.push({
        transaction_id: uuid(),
        user_id: userId,
        amount: +(Math.random() * 400 + 50).toFixed(2),
        category: categories[Math.floor(Math.random() * categories.length)],
        type: 'expense',
        title: 'Mock Expense',
        date: expenseDate.toISOString(),
      });
    }
  }

  // Sort chronologically
  masterTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 5. SEED TRANSACTION SERVICE
  await txRepo.insert(masterTransactions);
  
  console.log('✅ Transaction DB seeded');

  // 6. SEED DASHBOARD SERVICE (Derived from Master Data)
  console.log('📊 Calculating and seeding Dashboard views...');

  const monthlyGroups = new Map<string, any[]>();
  masterTransactions.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getMonth() + 1}-${d.getFullYear()}`;
    if (!monthlyGroups.has(key)) monthlyGroups.set(key, []);
    monthlyGroups.get(key)!.push(t);
  });

  for (const [key, txs] of monthlyGroups) {
    const [month, year] = key.split('-').map(Number);

    // Monthly Summary
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    await monthlyRepo.save({
      userId, month, year,
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    });

    // Category Summary
    const catMap = new Map<string, number>();
    txs.filter(t => t.type === 'expense').forEach(t => {
      catMap.set(t.category, (catMap.get(t.category) || 0) + Number(t.amount));
    });

    for (const [category, amount] of catMap) {
      await categoryRepo.save({ userId, month, year, category, amount });
    }
  }

  // Top 20 Recent Transactions (across all time)
  const top20 = [...masterTransactions].reverse().slice(0, 20);
  await recentRepo.save(top20.map(t => ({
    transactionId: t.transaction_id,
    userId: t.user_id,
    title: t.title,
    category: t.category,
    type: t.type,
    amount: Number(t.amount),
    date: t.date,
  })));

  console.log('✅ Dashboard DB seeded uniformly');
  console.log('🎉 High-quality seed completed successfully');
}
