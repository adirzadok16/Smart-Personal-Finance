import Navbar from "../Components/Dashboard/Dashboard_Navbar";
import GeneralData from "../Components/Dashboard/general_data";
import { Transactionlist } from "../Components/Dashboard/transaction";
import ExpenseChart from "../Components/Dashboard/expense_chart";
import IncomeExpenseChart from "../Components/Dashboard/income_expense_chart";




export default function Dashboard() {
    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-50/50">
            <Navbar />
            <GeneralData />
            <Transactionlist />
            <IncomeExpenseChart />
            <ExpenseChart />
        </div>
    )
}




