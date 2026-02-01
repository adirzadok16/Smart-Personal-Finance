import 'reflect-metadata';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

/* ===================== DB MANAGER ===================== */
import { getServiceDatabase } from '../db/database';

/* ===================== ENTITIES ===================== */
import { User_Table } from '../auth-service/auth_schemas';
import { Transaction_Table } from '../transaction-service/transaction_schemas';
import {
  DashboardMonthlySummary,
  DashboardCategorySummary,
  DashboardRecentTransaction,
} from '../dashboard-service/dashboard_schemas';

/* ===================== CONFIG ===================== */
const MONTHS_BACK = 6;
const DEMO_EMAIL = 'demo@test.com';

/* ===================== SEED FUNCTION ===================== */
export async function seedAllDatabases() {
  if (process.env.SEED_DATA !== 'true') {
    console.log('ℹ️ SEED_DATA=false, skipping seed');
    return;
  }

  console.log('🌱 Starting seed (single user, multi-month data)...');

  /* ====================================================
     AUTH SERVICE
  ==================================================== */
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
    console.log('✅ Auth DB: demo user created');
  } else {
    console.log('ℹ️ Auth DB: demo user already exists');
  }

  const userId = user.id;

  /* ====================================================
     TRANSACTION SERVICE
  ==================================================== */
  const transactionDB = getServiceDatabase('transaction');
  const txRepo = transactionDB.getRepository(Transaction_Table);

  if ((await txRepo.count({ where: { user_id: userId } })) === 0) {
    const categories = ['Food', 'Rent', 'Fun', 'Transport'];
    const transactions: Transaction_Table[] = [];

    for (let m = 0; m < MONTHS_BACK; m++) {
      const baseDate = new Date();
      baseDate.setMonth(baseDate.getMonth() - m);

      // Income (salary)
      transactions.push(
        txRepo.create({
          transaction_id: uuid(),
          user_id: userId,
          amount: 8000,
          category: 'Salary',
          type: 'income',
          title: 'Monthly Salary',
          date: baseDate.toISOString(),
        })
      );

      // Expenses
      for (let i = 0; i < 6; i++) {
        transactions.push(
          txRepo.create({
            transaction_id: uuid(),
            user_id: userId,
            amount: +(Math.random() * 500 + 50).toFixed(2),
            category:
              categories[Math.floor(Math.random() * categories.length)],
            type: 'expense',
            title: 'Mock Expense',
            date: baseDate.toISOString(),
          })
        );
      }
    }

    await txRepo.save(transactions);
    console.log('✅ Transaction DB seeded');
  } else {
    console.log('ℹ️ Transaction DB already seeded for user');
  }

  /* ====================================================
     DASHBOARD SERVICE
  ==================================================== */
  const dashboardDB = getServiceDatabase('dashboard');

  const monthlyRepo = dashboardDB.getRepository(DashboardMonthlySummary);
  const categoryRepo = dashboardDB.getRepository(DashboardCategorySummary);
  const recentRepo = dashboardDB.getRepository(DashboardRecentTransaction);

  if ((await monthlyRepo.count({ where: { userId } })) === 0) {
    const allTx = await txRepo.find({ where: { user_id: userId } });

    for (let m = 0; m < MONTHS_BACK; m++) {
      const d = new Date();
      d.setMonth(d.getMonth() - m);

      const month = d.getMonth() + 1;
      const year = d.getFullYear();

      const monthTx = allTx.filter(tx => {
        const td = new Date(tx.date);
        return td.getMonth() + 1 === month && td.getFullYear() === year;
      });

      const income = monthTx
        .filter(t => t.type === 'income')
        .reduce((s, t) => s + Number(t.amount), 0);

      const expense = monthTx
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount), 0);

      await monthlyRepo.save({
        userId,
        month,
        year,
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
      });

      const categoryMap: Record<string, number> = {};
      monthTx
        .filter(t => t.type === 'expense')
        .forEach(t => {
          categoryMap[t.category] =
            (categoryMap[t.category] || 0) + Number(t.amount);
        });

      for (const category of Object.keys(categoryMap)) {
        await categoryRepo.save({
          userId,
          month,
          year,
          category,
          amount: categoryMap[category],
        });
      }

      await recentRepo.save(
        monthTx.slice(0, 5).map(t => ({
          transactionId: t.transaction_id,
          userId: t.user_id,
          title: t.title,
          category: t.category,
          type: t.type,
          amount: t.amount,
          date: t.date,
        }))
      );
    }

    console.log('✅ Dashboard DB seeded');
  } else {
    console.log('ℹ️ Dashboard DB already seeded for user');
  }

  console.log('🎉 Seed completed successfully');
}
