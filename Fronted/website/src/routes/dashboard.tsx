import Navbar from "../Components/Dashboard/Dashboard_Navbar";
import GeneralData from "../Components/Dashboard/generalData";
import { Transactionlist } from "../Components/Dashboard/transactionList";
import ExpenseDistributionChart from "../Components/Dashboard/expenseCategoryChart";
import IncomeVSExpenseChart from "../Components/Dashboard/IncomeVSExpenseChart";
import type { DashboardCache } from "../models/dashboard_screen_models";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState<DashboardCache | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/dashboard", {
                    withCredentials: true,
                });
                console.log(response.data);
                setDashboardData(response.data.statistics);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-6"></div>
                <p className="text-xl font-semibold">Loading dashboard...</p>
                <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</p>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-white px-4">
                <div className="bg-red-600 rounded-full p-4 mb-6 shadow-lg">
                    <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </div>
                <p className="text-2xl font-bold">Failed to load dashboard</p>
                <p className="text-gray-400 text-sm mt-2">Something went wrong. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-900">
            <Navbar />
            {dashboardData.currentMonthIncomeAndExpense ? (
                <GeneralData data={dashboardData.currentMonthIncomeAndExpense} />
            ) : (
                <div className="text-white">No income/expense data available</div>
            )}

            {dashboardData.recentTransactions ? (
                <Transactionlist data={dashboardData.recentTransactions} />
            ) : (
                <div className="text-white">No recent transactions</div>
            )}
            {
                dashboardData.monthlySummary ? (
                    <IncomeVSExpenseChart expenseChartData={dashboardData.monthlySummary} />
                ) : (
                    <div className="text-white">No monthly summary data available</div>
                )
            }
            {
                dashboardData.categorySummary ? (
                    <ExpenseDistributionChart expenseChartData={dashboardData.categorySummary} />
                ) : (
                    <div className="text-white">No category summary data available</div>
                )
            }
        </div>
    );
}