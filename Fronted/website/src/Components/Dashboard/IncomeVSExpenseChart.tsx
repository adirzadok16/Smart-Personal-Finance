import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import type { MonthlyIncomeExpense } from "../../models/dashboard_screen_models";
import { monthNamesShort } from "../../constants/consts";


interface IncomeExpenseChartProps {
    expenseChartData: MonthlyIncomeExpense[];
}

export default function IncomeVSExpenseChart({ expenseChartData }: IncomeExpenseChartProps) {

    const chartData = expenseChartData
        .sort((a, b) => a.month - b.month)
        .map(item => {
            return {
                month: monthNamesShort[item.month - 1],

                income: item.totalIncome,
                expenses: item.totalExpense
            };
        });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col bg-gray-800 border border-gray-700 rounded-2xl shadow-sm p-6 mt-8 w-full max-w-6xl mx-4"
        >
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-xl font-bold text-white">Income vs Expenses</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-400">Income</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-400">Expenses</span>
                    </div>
                </div>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#fff', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                borderRadius: '12px',
                                border: '1px solid #374151',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: '#fff' }}      // צבע הערכים (income, expenses)
                            labelStyle={{ color: '#facc15' }}  // צבע שם החודש שמופיע ב-tooltip
                        />
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#13e308ff"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#13e308ff', strokeWidth: 2, stroke: '#1f2937' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#1f2937' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

