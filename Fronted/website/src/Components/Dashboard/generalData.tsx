import { motion } from "framer-motion";
import type { MonthlyIncomeExpense } from "../../models/dashboard_screen_models";

interface GeneralDataProps {
    data: MonthlyIncomeExpense;
}

interface StatCardProps {
    title: string;
    value: number | string;
    badge?: { text: string; color: string };
    month: number;
    year: number;
}

export default function GeneralData({ data }: GeneralDataProps) {
    const stats = [
        { title: "Total Balance", value: data.balance, badge: { text: "This month", color: "blue" } },
        { title: "Income", value: data.totalIncome, badge: { text: "This month", color: "green" } },
        { title: "Expenses", value: data.totalExpense, badge: { text: "This month", color: "red" } },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4 mt-24">
            {stats.map((stat, idx) => (
                <StatCard
                    key={idx}
                    title={stat.title}
                    value={stat.value}
                    badge={stat.badge}
                    month={data.month}
                    year={data.year}
                />
            ))}
        </div>
    );
}

function StatCard({ title, value, badge, month, year }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="flex flex-col items-center justify-center bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex flex-col justify-center items-center">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">({month}/{year})</p>
                <h1 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h1>
                <h2 className="text-3xl font-bold text-white mt-2">{value} ILS</h2>
            </div>
            {badge && (
                <span className={`text-white px-2 py-0.5 rounded text-xs font-medium mt-2 bg-${badge.color}-500`}>
                    {badge.text}
                </span>
            )}
        </motion.div>
    );
}


