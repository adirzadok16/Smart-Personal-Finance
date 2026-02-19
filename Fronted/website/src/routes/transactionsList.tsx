import { useState, useEffect } from "react";
import type { RecentTransaction } from "../models/dashboard_screen_models";
import { Transaction } from "../Components/Dashboard/recentTransactions";
import axios from "axios";
import Navbar from "../Components/Navbar";

export default function TransactionsList() {
    const [data, setData] = useState<RecentTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(7);

    useEffect(() => {
        const fetchTransactionsData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/dashboard/transactions?days=${days}`, {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                console.log(response.data);
                setData(response.data.transactions);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactionsData();
    }, [days]);

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>Error</div>;

    return (
        <div className="flex flex-col items-center bg-gray-900 min-h-screen">
            <div className="flex flex-col bg-gray-800 border border-gray-700 rounded-2xl shadow-sm p-6 mt-24 w-full max-w-6xl mx-4 mb-10">
                <Navbar />
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-white">
                        Recent Transactions
                    </h1>
                    <div className="flex justify-end gap-4">
                        <button
                            className="text-sm font-medium text-blue-400 border-1 p-1.5 rounded-md  hover:text-blue-300 hover:cursor-pointer transition-colors"
                            onClick={() => { setDays(7) }}>
                            7 days
                        </button>
                        <button
                            className="text-sm font-medium text-blue-400 border-1 p-1.5 rounded-md  hover:text-blue-300 hover:cursor-pointer transition-colors"
                            onClick={() => { setDays(30) }}>
                            30 days
                        </button>
                        <button
                            className="text-sm font-medium text-blue-400 border-1 p-1.5 rounded-md  hover:text-blue-300 hover:cursor-pointer transition-colors"
                            onClick={() => { setDays(90) }}>
                            90 days
                        </button>
                        <button
                            className="text-sm font-medium text-blue-400 border-1 p-1.5 rounded-md  hover:text-blue-300 hover:cursor-pointer transition-colors"
                            onClick={() => { setDays(180) }}>
                            180 days
                        </button>
                    </div>
                </div>


                <div className="flex flex-col gap-3 pr-2 max-h-[500px] overflow-y-auto">
                    <div className="flex flex-col gap-3 pr-2 max-h-[500px] overflow-y-auto">
                        {data.map((transaction) => {
                            const formattedDate = new Date(transaction.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                            });

                            return (
                                <Transaction
                                    transaction={{ ...transaction, date: formattedDate }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}