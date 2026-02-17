import { getServiceDatabase } from "../db/database";
import RedisService from "../utilities/redis_service";
import {
  DashboardMonthlySummary,
  DashboardCategorySummary,
  DashboardRecentTransaction
} from "./dashboard_schemas";
import {
  DashboardCache,
  MonthlyCategories,
  MonthlyIncomeExpense,
} from "./dashboard_models";
import { MoreThan } from "typeorm";

class DashboardService {

  private static readonly CACHE_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

  /**
   * getDashboard
   * @param userId - The user ID for which to fetch the dashboard
   * 
   * What it does:
   *  - Checks Redis cache first
   *  - If cache exists, parses and returns it
   *  - If cache does not exist, fetches from database
   *  - Populates monthly summaries, category summaries, and recent transactions
   *  - Stores result in Redis for future requests
   * 
   * Returns: Promise<DashboardCache>
   */
  static async getDashboard(userId: string): Promise<DashboardCache> {
    console.log(`[DASHBOARD] Fetching dashboard for user: ${userId}`);

    try {
      const cacheKey = `dashboard:${userId}`;

      // ------------------ CHECK CACHE ------------------
      console.log(`[DASHBOARD] Checking Redis cache...`);
      const cachedDashboard = await RedisService.get(cacheKey);
      if (cachedDashboard) {
        console.log(`[DASHBOARD] Cache hit. Returning cached dashboard.`);
        return JSON.parse(cachedDashboard) as DashboardCache;
      }

      console.log(`[DASHBOARD] Cache miss. Fetching data from database...`);

      const dashboardData = await this.fetchAndCacheDashboardData(userId, cacheKey, this.CACHE_TTL);

      console.log(`[DASHBOARD] Dashboard successfully fetched and cached.`);
      return dashboardData;

    } catch (error) {
      console.error(`[DASHBOARD] Failed to fetch dashboard for user: ${userId}`, error);
      throw error;
    }
  }


  static async fetchAndCacheDashboardData(userId: string, cacheKey: string, CACHE_TTL: number) {

    // ------------------ DATABASE CONNECTION ------------------
    const db = getServiceDatabase('dashboard');
    const monthlyRepo = db.getRepository(DashboardMonthlySummary);
    const categoryRepo = db.getRepository(DashboardCategorySummary);
    const transactionRepo = db.getRepository(DashboardRecentTransaction);

    const now = new Date();
    const currentYear = now.getFullYear();

    // last 6 months for recent transactions
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    // last 13 months for category summaries
    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(now.getMonth() - 13);

    // ------------------ FETCH DATA ------------------
    console.log(`[DASHBOARD] Fetching monthly summaries for current year...`);
    const monthlySummaries = await monthlyRepo.find({
      select: {
        month: true,
        year: true,
        totalIncome: true,
        totalExpense: true,
        balance: true,
      },
      where: { userId, year: currentYear },
      order: { month: 'DESC', year: 'DESC' },
    });

    console.log(`[DASHBOARD] Fetching category summaries for last 13 months...`);
    // FIX: Use QueryBuilder for proper date range filtering
    const categorySummaries = await categoryRepo
      .createQueryBuilder('cs')
      .select([
        'cs.month',
        'cs.year',
        'cs.category',
        'cs.amount'
      ])
      .where('cs.userId = :userId', { userId })
      .andWhere(
        '(cs.year > :year OR (cs.year = :year AND cs.month >= :month))', // select only the  
        {
          year: thirteenMonthsAgo.getFullYear(),
          month: thirteenMonthsAgo.getMonth() + 1 // Convert 0-11 to 1-12
        }
      )
      .orderBy('cs.year', 'DESC')
      .addOrderBy('cs.month', 'DESC')
      .getMany();

    console.log(`[DASHBOARD] Fetching recent transactions from last 6 months...`);
    // FIX: Format date properly for string comparison
    const dateThreshold = sixMonthsAgo.toISOString().split('T')[0]; // YYYY-MM-DD format
    const recentTransactions = await transactionRepo.find({
      select: {
        date: true,
        amount: true,
        type: true,
        category: true,
        title: true,
      },
      where: {
        userId,
        date: MoreThan(dateThreshold)
      },
      order: { date: 'DESC' },
    });

    console.log(`[DASHBOARD] Recent transactions:`, recentTransactions);

    // ------------------ BUILD DASHBOARD OBJECT ------------------
    const dashboardData: DashboardCache = {
      currentMonthIncomeAndExpense: MonthValidation(monthlySummaries),
      monthlySummary: monthlySummaries,
      categorySummary: organizeCategorySummaries(categorySummaries),
      recentTransactions: recentTransactions,
    };

    // ------------------ STORE IN CACHE ------------------
    console.log(`[DASHBOARD] Caching dashboard data in Redis...`);
    await RedisService.set(cacheKey, JSON.stringify(dashboardData), CACHE_TTL);
    return dashboardData;
  }





  /**
   * Invalidate dashboard cache for a user
   * Should be called when user's transactions are modified
   */
  static async invalidateCache(userId: string): Promise<void> {
    const cacheKey = `dashboard:${userId}`;
    try {
      await RedisService.delete(cacheKey);
      console.log(`[DASHBOARD] Cache invalidated for user: ${userId}`);
    } catch (error) {
      console.error(`[DASHBOARD] Failed to invalidate cache for user: ${userId}`, error);
    }
  }

}

/**
 * Get current month's income and expense summary
 * Returns actual data if exists, or zero values if not
 */
function MonthValidation(monthlySummaries: DashboardMonthlySummary[]): MonthlyIncomeExpense {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  if (monthlySummaries.length > 0 &&
    monthlySummaries[0].month === currentMonth &&
    monthlySummaries[0].year === currentYear) {
    return monthlySummaries[0];
  }

  return {
    month: currentMonth,
    year: currentYear,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  };
}

function organizeCategorySummaries(categorySummaries: DashboardCategorySummary[]): MonthlyCategories[] {
  const map = new Map<string, MonthlyCategories>();
  for (const s of categorySummaries) {
    const key = `${s.month} - ${s.year}`
    if (!map.has(key)) {
      map.set(key, {
        month: s.month,
        year: s.year,
        categories: []
      })
    }
    map.get(key)!.categories.push({
      category: s.category,
      amount: Number(s.amount)
    })
  }
  return Array.from(map.values()).sort(
    (a, b) => b.year - a.year || b.month - a.month
  );
}




export default DashboardService;