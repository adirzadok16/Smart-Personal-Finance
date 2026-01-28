import { getServiceDatabase } from "../db/database";
import { DashboardMonthlySummary, DashboardCategorySummary, DashboardRecentTransaction } from "./dashboard_schemas";
import RedisService from "../utilities/redis_service";

export class DashboardService {

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
   */
  static async getDashboard(userId: string) {
    console.log(`[DASHBOARD] Fetching dashboard for user: ${userId}`);

    try {
      // ------------------ CHECK CACHE ------------------
      console.log(`[DASHBOARD] Checking Redis cache...`);
      const cachedDashboard = await RedisService.get(`dashboard:${userId}`);
      if (cachedDashboard) {
        console.log(`[DASHBOARD] Cache hit. Returning cached dashboard for user: ${userId}`);
        return JSON.parse(cachedDashboard);
      }

      console.log(`[DASHBOARD] Cache miss. Fetching from database...`);

      // ------------------ DATABASE FETCH ------------------
      const db = getServiceDatabase('dashboard');
      const monthlyRepo = db.getRepository(DashboardMonthlySummary);
      const categoryRepo = db.getRepository(DashboardCategorySummary);
      const transactionRepo = db.getRepository(DashboardRecentTransaction);

      console.log(`[DASHBOARD] Fetching monthly summaries, category summaries, and recent transactions from DB...`);
      const [monthlySummaries, categorySummaries, recentTransactions] = await Promise.all([
        monthlyRepo.find({ where: { userId } }),
        categoryRepo.find({ where: { userId } }),
        transactionRepo.find({ where: { userId }, order: { date: 'DESC' }, take: 10 }) // fetch latest 10 transactions
      ]);

      console.log(`[DASHBOARD] DB fetch completed for user: ${userId}`);

      // ------------------ BUILD DASHBOARD OBJECT ------------------
      const dashboardStatistics = {
        monthlySummaries,
        categorySummaries,
        recentTransactions
      };

      // ------------------ STORE IN CACHE ------------------
      console.log(`[DASHBOARD] Storing dashboard in Redis cache for user: ${userId}`);
      await RedisService.set(`dashboard:${userId}`, JSON.stringify(dashboardStatistics), 300); // expire in 5 minutes

      console.log(`[DASHBOARD] Dashboard successfully cached and returned for user: ${userId}`);
      return dashboardStatistics;

    } catch (error) {
      console.error(`[DASHBOARD] Failed to fetch dashboard for user: ${userId}`, error);
      throw error;
    }
  }
}
