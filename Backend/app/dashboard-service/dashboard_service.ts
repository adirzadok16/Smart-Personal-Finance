import { getServiceDatabase } from "../db/database";
import RedisService from "../utilities/redis_service";
import { DashboardMonthlySummary, DashboardCategorySummary, DashboardRecentTransaction } from "./dashboard_schemas";
import { DashboardCache } from "./dashboard_models";
import { MoreThan } from "typeorm";

class DashboardService {

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

      // ------------------ DATABASE CONNECTION ------------------
      const db = getServiceDatabase('dashboard');
      const monthlyRepo = db.getRepository(DashboardMonthlySummary);
      const categoryRepo = db.getRepository(DashboardCategorySummary);
      const transactionRepo = db.getRepository(DashboardRecentTransaction);

      const now = new Date();
      const currentYear = now.getFullYear();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      // ------------------ FETCH DATA ------------------
      console.log(`[DASHBOARD] Fetching monthly summaries for current year...`);
      const monthlySummaries = await monthlyRepo.find({
        where: { userId, year: currentYear },
        order: { month: 'ASC' },
      });

      console.log(`[DASHBOARD] Fetching category summaries for current year...`);
      const categorySummaries = await categoryRepo.find({
        where: { userId, year: currentYear },
      });

      console.log(`[DASHBOARD] Fetching recent transactions from last 6 months...`);
      const recentTransactions = await transactionRepo.find({
        where: { userId, date: MoreThan(sixMonthsAgo.toISOString()) },
        order: { date: 'DESC' },
      });

      // ------------------ BUILD DASHBOARD OBJECT ------------------
      const dashboardData: DashboardCache = {
        monthlySummary : monthlySummaries,
        categorySummary : categorySummaries,
        recentTransactions : recentTransactions,
      };

      // ------------------ STORE IN CACHE ------------------
      console.log(`[DASHBOARD] Caching dashboard data in Redis...`);
      await RedisService.set(cacheKey, JSON.stringify(dashboardData), 7 * 24 * 60 * 60); // expire in 7 days

      console.log(`[DASHBOARD] Dashboard successfully fetched and cached.`);
      return dashboardData;

    } catch (error) {
      console.error(`[DASHBOARD] Failed to fetch dashboard for user: ${userId}`, error);
      throw error;
    }
  }
}

export default DashboardService;
