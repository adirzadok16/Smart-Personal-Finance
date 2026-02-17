import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { motion } from "framer-motion";
import type { MonthlyCategories } from "../../models/dashboard_screen_models";
import { currentMonth, currentYear, years, months } from "../../constants/consts";
import Swal from "sweetalert2";


interface ExpenseDistributionChartProps {
    expenseChartData: MonthlyCategories[];
}
const data = [
    { name: "Food", value: 400 },
    { name: "Rent", value: 1200 },
    { name: "Entertainment", value: 300 },
    { name: "Transport", value: 200 },
    { name: "Shopping", value: 342 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];



export default function ExpenseDistributionChart({ expenseChartData }: ExpenseDistributionChartProps) {

    const [month, setMonth] = useState(months[currentMonth - 1]);
    const [year, setYear] = useState(currentYear);
    const firstData = expenseChartData.find((item) => item.month === (months.indexOf(month) + 1) && item.year === year);
    const [chartData, setChartData] = useState<{ category: string; amount: number }[]>(firstData?.categories || []);

    const handleShow = () => {
        // Here you would typically fetch data based on month/year
        const monthNumber = months.indexOf(month) + 1;
        const data = expenseChartData.find((item) => item.month === monthNumber && item.year === year);
        if (data) {
            setChartData(data.categories);
        } else {
            Swal.fire({
                toast: true,
                position: "center",
                icon: "info",
                title: "No data for selected date",
                showConfirmButton: false,
                timer: 1800,
                timerProgressBar: true
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col bg-gray-800 border border-gray-700 rounded-2xl shadow-sm p-6 mt-8 w-full max-w-6xl mx-4 mb-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h1 className="text-xl font-bold text-white">Expense Distribution</h1>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-all outline-hidden cursor-pointer"
                    >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-all outline-hidden cursor-pointer"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    <button
                        onClick={handleShow}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all active:scale-95 cursor-pointer"
                    >
                        Show
                    </button>
                </div>
            </div>

            <div className="h-[400px] w-full mb" >
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                        >
                            {chartData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px', color: '#9ca3af' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
