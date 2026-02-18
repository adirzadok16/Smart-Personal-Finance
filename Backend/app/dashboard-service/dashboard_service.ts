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
import { MoreThanOrEqual } from "typeorm";

class DashboardService {

  // TODO: implement logic for fetching recent transactions by days range
  static async getRecentTransactions(userId: string, days: number) {

    const db = getServiceDatabase('dashboard');
    const transactionRepo = db.getRepository(DashboardRecentTransaction);
    const now = new Date();
    switch(days){
      case 7:
        now.setDate(now.getDate() - 7);
        break;
      case 30:
        now.setMonth(now.getMonth() - 1);
        break;
      case 90:
        now.setMonth(now.getMonth() - 3);
        break;
      case 180:
        now.setMonth(now.getMonth() - 6);
        break;
    }
  const startDateString = now.toISOString();
    const recentTransactions = await transactionRepo.find({
      select: {
        date: true,
        amount: true,
        type: true,
        category: true,
        title: true,
      },
      where: { userId , date: MoreThanOrEqual(startDateString) },
      order: { date: 'DESC' },
    });
    return recentTransactions;
  }

  // Cache time-to-live: 7 days (in seconds)
  private static readonly CACHE_TTL = 7 * 24 * 60 * 60;

  /**
   * Fetch full dashboard data for a user.
   *
   * Flow:
   * 1. Check Redis cache first.
   * 2. If cache exists → return cached data.
   * 3. If cache missing → fetch from database.
   * 4. Store result in Redis.
   *
   * @param userId - User ID to fetch dashboard for
   * @returns DashboardCache
   */
  static async getDashboard(userId: string): Promise<DashboardCache> {
    console.log(`[DASHBOARD] Fetching dashboard for user: ${userId}`);

    try {
      const cacheKey = `dashboard:${userId}`;

      // ---------- STEP 1: CHECK CACHE ----------
      console.log(`[DASHBOARD] Checking Redis cache...`);
      const cachedDashboard = await RedisService.get(cacheKey);

      if (cachedDashboard) {
        console.log(`[DASHBOARD] Cache hit. Returning cached dashboard.`);
        return JSON.parse(cachedDashboard) as DashboardCache;
      }

      // ---------- STEP 2: FETCH FROM DATABASE ----------
      console.log(`[DASHBOARD] Cache miss. Fetching data from database...`);

      const dashboardData = await this.fetchAndCacheDashboardData(
        userId,
        cacheKey,
        this.CACHE_TTL
      );

      console.log(`[DASHBOARD] Dashboard successfully fetched and cached.`);
      return dashboardData;

    } catch (error) {
      console.error(`[DASHBOARD] Failed to fetch dashboard for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Fetch dashboard data from database and store in Redis cache.
   *
   * Fetches:
   * - Monthly summaries (current year)
   * - Category summaries (last 13 months)
   * - Recent transactions (latest 10)
   *
   * Then builds dashboard object and caches it.
   */
  static async fetchAndCacheDashboardData(
    userId: string,
    cacheKey: string,
    CACHE_TTL: number
  ) {

    // ---------- DATABASE SETUP ----------
    const db = getServiceDatabase('dashboard');
    const monthlyRepo = db.getRepository(DashboardMonthlySummary);
    const categoryRepo = db.getRepository(DashboardCategorySummary);
    const transactionRepo = db.getRepository(DashboardRecentTransaction);

    const now = new Date();
    const currentYear = now.getFullYear();

    // Used for filtering recent data ranges
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(now.getMonth() - 13);

    // ---------- FETCH MONTHLY SUMMARIES ----------
    // Returns income, expense, and balance per month for current year
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

    // ---------- FETCH CATEGORY SUMMARIES ----------
    // Uses QueryBuilder to properly filter by month/year range
    // (ORM find() is not reliable for this type of date logic)
    console.log(`[DASHBOARD] Fetching category summaries for last 13 months...`);
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
        // Select records newer than the calculated month/year threshold
        '(cs.year > :year OR (cs.year = :year AND cs.month >= :month))',
        {
          year: thirteenMonthsAgo.getFullYear(),
          month: thirteenMonthsAgo.getMonth() + 1 // convert JS month (0-11) to DB month (1-12)
        }
      )
      .orderBy('cs.year', 'DESC')
      .addOrderBy('cs.month', 'DESC')
      .getMany();

    // ---------- FETCH RECENT TRANSACTIONS ----------
    // Returns latest 10 transactions sorted by date
    console.log(`[DASHBOARD] Fetching recent transactions...`);
    const recentTransactions = await transactionRepo.find({
      take: 10,
      select: {
        date: true,
        amount: true,
        type: true,
        category: true,
        title: true,
      },
      where: { userId },
      order: { date: 'DESC' },
    });

    console.log(`[DASHBOARD] Recent transactions:`, recentTransactions);

    // ---------- BUILD DASHBOARD OBJECT ----------
    const dashboardData: DashboardCache = {
      currentMonthIncomeAndExpense: MonthValidation(monthlySummaries),
      monthlySummary: monthlySummaries,
      categorySummary: organizeCategorySummaries(categorySummaries),
      recentTransactions,
    };

    // ---------- STORE IN CACHE ----------
    console.log(`[DASHBOARD] Caching dashboard data in Redis...`);
    await RedisService.set(cacheKey, JSON.stringify(dashboardData), CACHE_TTL);

    return dashboardData;
  }

  /**
   * Remove dashboard cache for a user.
   * Should be called whenever user transactions change.
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
 * Returns current month summary.
 *
 * If current month exists in DB → return real data.
 * Otherwise → return default values (zeros).
 */
function MonthValidation(
  monthlySummaries: DashboardMonthlySummary[]
): MonthlyIncomeExpense {

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  if (
    monthlySummaries.length > 0 &&
    monthlySummaries[0].month === currentMonth &&
    monthlySummaries[0].year === currentYear
  ) {
    return monthlySummaries[0];
  }

  // Default empty values if no data exists for current month
  return {
    month: currentMonth,
    year: currentYear,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  };
}

/**
 * Groups category summaries by month and year.
 * Converts flat DB results into UI-friendly structure.
 */
function organizeCategorySummaries(
  categorySummaries: DashboardCategorySummary[]
): MonthlyCategories[] {

  const map = new Map<string, MonthlyCategories>();

  for (const s of categorySummaries) {
    const key = `${s.month} - ${s.year}`;

    if (!map.has(key)) {
      map.set(key, {
        month: s.month,
        year: s.year,
        categories: []
      });
    }

    map.get(key)!.categories.push({
      category: s.category,
      amount: Number(s.amount)
    });
  }

  // Sort by newest month first
  return Array.from(map.values()).sort(
    (a, b) => b.year - a.year || b.month - a.month
  );
}

export default DashboardService;
