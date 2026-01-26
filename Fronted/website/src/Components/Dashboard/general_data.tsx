import { motion } from "framer-motion";

export default function GeneralData() {

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4 mt-24">
            <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center justify-center bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
                <h1 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Balance</h1>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">4,758 ILS</h2>
                <div className="flex items-center gap-1 mt-2">
                    <span className="text-green-500 font-medium text-sm">+12.5%</span>
                    <span className="text-gray-400 text-xs text-nowrap">from last month</span>
                </div>
            </motion.div>

            <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center justify-center bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
                <h1 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Income</h1>
                <h2 className="text-3xl font-bold text-black mt-2">5,000 ILS</h2>
                <span className="text-white bg-green-500 px-2 py-0.5 rounded text-xs font-medium mt-2">This month</span>
            </motion.div>

            <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center justify-center bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
                <h1 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Expenses</h1>
                <h2 className="text-3xl font-bold text-black mt-2">242 ILS</h2>
                <span className="text-white bg-red-500 px-2 py-0.5 rounded text-xs font-medium mt-2">This month</span>
            </motion.div>
        </div>

    )
}