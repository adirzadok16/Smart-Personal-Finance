export function Transaction() {
    return (
        <div className="group border border-gray-100 rounded-xl p-4 transition-all hover:bg-gray-50 hover:shadow-sm">
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Salary</p>
                        <p className="text-xs text-gray-500">Income • Jan 20, 2026</p>
                    </div>
                </div>
                <div>
                    <p className="text-lg font-bold text-green-600">+5,000.00</p>
                </div>
            </div>
        </div>
    )
}



export function Transactionlist() {
    return (
        <div className="flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mt-8 w-full max-w-6xl mx-4 mb-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-gray-900">
                    Recent Transactions
                </h1>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
            </div>

            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <Transaction />
                <Transaction />
                <Transaction />
                <Transaction />
                <Transaction />
                <Transaction />
            </div>
        </div>
    );
}

