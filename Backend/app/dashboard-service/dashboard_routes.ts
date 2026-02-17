// dashboard.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../utilities/auth_middleware';
import  DashboardService  from './dashboard_service';

export const dashboardRoutes = Router();

dashboardRoutes.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user;
    const statistics = await DashboardService.getDashboard(userId);
    res.status(200).json({ message: "Dashboard fetched successfully", success: true, statistics: statistics })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch dashboard", success: false, error: error });
  }
});

