import axios from "axios";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function AddTransaction() {
    const navigate = useNavigate();

    // ----------------- State -----------------
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState(""); // "Income" or "Expense"
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");

    const [typeOpen, setTypeOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);

    // ----------------- Refs -----------------
    const typeDropdownRef = useRef<HTMLDivElement>(null);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    // ----------------- Data -----------------
    const types = ["Income", "Expense"];
    const categories = [
        "Salary", "Bonus", "Freelance", "Food", "Groceries", "Restaurants",
        "Transport", "Taxi", "Fuel", "Rent", "Mortgage", "Utilities",
        "Electricity", "Water", "Internet", "Phone", "Entertainment",
        "Movies", "Games", "Shopping", "Clothes", "Electronics", "Health",
        "Doctor", "Medicine", "Gym", "Insurance", "Education", "Books",
        "Courses", "Travel", "Vacation", "Gifts", "Charity", "Other"
    ];

    // ----------------- Date Limits -----------------
    const today = new Date();
    const maxDate = today.toISOString().split("T")[0]; // yyyy-mm-dd

    const lastYear = new Date(today);
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    const minDate = lastYear.toISOString().split("T")[0]; // yyyy-mm-dd

    // ----------------- Handle Outside Click -----------------
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
                setTypeOpen(false);
            }
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setCategoryOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // ----------------- Handle Form Submit ------------------
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!title || !amount || !type || !category || !date) {
            alert("Please fill in all required fields.");
            return;
        }

        // Convert date to dd-mm-yyyy
        const [year, month, day] = date.split("-");
        const formattedDate = `${day}-${month}-${year}`;

        try {

            const response = await axios.post(
                "http://localhost:3000/api/transaction/addTransaction",
                {
                    title: title,
                    amount: amount,
                    type: type.toLowerCase(),
                    category: category,
                    date: formattedDate,
                },
                {
                    withCredentials: true, 
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
               await Swal.fire({
                toast: true,
                position: "center",
                icon: "success",
                title: `Transaction added successfully`,
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
               })
                navigate('/dashboard')
            }
        } catch (err: any) {
            console.error(
                "❌ Error:",
                err.response?.data?.message || err.message
            );
        }
    }

    // ----------------- JSX -----------------
    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-900 pt-24 text-white">
            <h1 className="text-3xl font-bold mb-6">Add Transaction</h1>

            <div className="flex flex-col bg-gray-800 border border-gray-700 rounded-2xl shadow-sm p-6 w-full max-w-xl mx-4 mb-10">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Transaction Name */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Transaction Name</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-1 p-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        />
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            className="mt-1 p-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        />
                    </div>

                    {/* Type Dropdown */}
                    <div className="flex flex-col relative" ref={typeDropdownRef}>
                        <label className="text-sm font-medium">Type</label>
                        <button
                            type="button"
                            onClick={() => setTypeOpen(!typeOpen)}
                            className={`mt-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-white flex justify-between items-center w-full ${!type && "text-gray-400"}`}
                        >
                            {type || "Select type"}
                            <span>{typeOpen ? "▲" : "▼"}</span>
                        </button>

                        {typeOpen && (
                            <div className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {types.map((t) => (
                                    <div
                                        key={t}
                                        onClick={() => {
                                            setType(t);
                                            setTypeOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-600 cursor-pointer"
                                    >
                                        {t}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Category Dropdown */}
                    <div className="flex flex-col relative" ref={categoryDropdownRef}>
                        <label className="text-sm font-medium">Category</label>
                        <button
                            type="button"
                            onClick={() => setCategoryOpen(!categoryOpen)}
                            className={`mt-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-white flex justify-between items-center w-full ${!category && "text-gray-400"}`}
                        >
                            {category || "Select category"}
                            <span>{categoryOpen ? "▲" : "▼"}</span>
                        </button>

                        {categoryOpen && (
                            <div className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {categories.map((cat) => (
                                    <div
                                        key={cat}
                                        onClick={() => {
                                            setCategory(cat);
                                            setCategoryOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-600 cursor-pointer"
                                    >
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        )}

                        {category === "Other" && (
                            <input
                                type="text"
                                placeholder="Enter custom category"
                                required
                                className="mt-2 p-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            />
                        )}
                    </div>

                    {/* Date Picker */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={minDate}
                            max={maxDate}
                            required
                            className="mt-1 p-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                        >
                            Add Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
