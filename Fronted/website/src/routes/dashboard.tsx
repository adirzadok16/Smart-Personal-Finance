import Navbar from "../Components/Navbar";
import GeneralData from "../Components/Dashboard/generalData";
import { Transactionlist } from "../Components/Dashboard/recentTransactions";
import ExpenseDistributionChart from "../Components/Dashboard/expenseCategoryChart";
import IncomeVSExpenseChart from "../Components/Dashboard/IncomeVSExpenseChart";
import type { DashboardCache } from "../models/dashboard_screen_models";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState<DashboardCache | null>(null);
    const [loading, setLoading] = useState(true);
    const firstName = useSelector((state: any) => state.user.firstName);
    const lastName = useSelector((state: any) => state.user.lastName);
    const welcomeShownRef = useRef(false);



    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/dashboard", {
                    withCredentials: true,
                });

                if (response.status === 200) {
                    setDashboardData(response.data.statistics);

                    // 🔹 כאן אנחנו משתמשים ב-sessionStorage
                    const welcomeShown = sessionStorage.getItem("dashboardWelcomeShown");

                    // אם לא הוצג עדיין ב-session ושלא הוצג כבר ב-ref
                    if (!welcomeShown && !welcomeShownRef.current) {
                        await Swal.fire({
                            title: `👋 Welcome back, ${firstName} ${lastName}!`,
                            text: "Let's manage your finances smartly today 💰",
                            icon: "success",
                            confirmButtonText: "Let's go!",
                            background: "#1f2937",
                            color: "#fff",
                            timer: 5000,
                            timerProgressBar: true,
                            confirmButtonColor: "#007bff",
                            showCloseButton: true,
                        });

                        welcomeShownRef.current = true; // מונע double show ב-render אחד
                        sessionStorage.setItem("dashboardWelcomeShown", "true"); // מונע show נוסף בסשן
                    }
                }

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
            <Navbar isDashboard={true} />
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