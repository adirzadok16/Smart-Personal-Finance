import type { RecentTransaction } from "../../models/dashboard_screen_models";

interface TransactionProps {
    data: RecentTransaction[];
}

interface TransactionItemProps {
    transaction: RecentTransaction;

}

export function Transactionlist({ data }: TransactionProps) {
    return (
        <div className="flex flex-col bg-gray-800 border border-gray-700 rounded-2xl shadow-sm p-6 mt-8 w-full max-w-6xl mx-4 mb-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-white">
                    Recent Transactions
                </h1>
                <button className="text-sm font-medium text-blue-400 hover:text-blue-300">View All</button>
            </div>


            <div className="flex flex-col gap-3 pr-2 max-h-[500px] overflow-y-auto">
                {data.slice(0, 10).map((transaction) => {
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
    );
}

export function Transaction({ transaction }: TransactionItemProps) {
    return (
        <div className="group border border-gray-700 rounded-xl p-4 transition-all hover:bg-gray-700/50 hover:shadow-sm">
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center text-green-500">
                    {transaction.type === "income" ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                    )}
                    </div>
                    <div className="flex flex-col">
                        <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">{transaction.title}</p>
                        <p className="text-xs text-gray-400">{transaction.type} • {transaction.category} • {transaction.date}</p>
                    </div>
                </div>
                <div>
                    {
                        transaction.type === "income" ? (
                            <p className="text-lg font-bold text-green-500">+{transaction.amount}</p>
                        ) : (
                            <p className="text-lg font-bold text-red-500">-{transaction.amount}</p>
                        )
                    }
                </div>
            </div>
        </div>
    )
}




