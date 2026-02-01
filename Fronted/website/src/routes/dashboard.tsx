import Navbar from "../Components/Dashboard/Dashboard_Navbar";
import GeneralData from "../Components/Dashboard/general_data";
import { Transactionlist } from "../Components/Dashboard/transaction";
import ExpenseChart from "../Components/Dashboard/expense_chart";
import IncomeExpenseChart from "../Components/Dashboard/income_expense_chart";
import type { DashboardCache } from "../models/dashboard_screen_models";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {


    const [dashboardData, setDashboardData] = useState<DashboardCache | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:3000/api/dashboard",
                {
                    withCredentials: true,
                });
                console.log(response.data);
                setDashboardData(response.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-900">
            <Navbar />
            <GeneralData />
            <Transactionlist />
            <IncomeExpenseChart />
            <ExpenseChart />
        </div>
    )
}



