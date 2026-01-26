import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { motion } from "framer-motion";

const data = [
    { name: "Food", value: 400 },
    { name: "Rent", value: 1200 },
    { name: "Entertainment", value: 300 },
    { name: "Transport", value: 200 },
    { name: "Shopping", value: 342 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const years = ["2024", "2025", "2026"];

export default function ExpenseChart() {
    const [month, setMonth] = useState("January");
    const [year, setYear] = useState("2026");

    const handleShow = () => {
        // Here you would typically fetch data based on month/year
        console.log(`Showing data for ${month} ${year}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mt-8 w-full max-w-6xl mx-4"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h1 className="text-xl font-bold text-gray-900">Expense Distribution</h1>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-all outline-hidden cursor-pointer"
                    >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-all outline-hidden cursor-pointer"
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

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
