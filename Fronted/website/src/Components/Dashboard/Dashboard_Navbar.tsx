import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    const handleToggle = () => {
        setOpen(!open);
    };

    const handleProfile = () => {
        alert("Profile clicked");
    };

    const handleLogout = () => {
        alert("Logout clicked");
    };
    return (
        <nav className="fixed flex justify-between items-center top-0 left-0 right-0 bg-gray-800/95 backdrop-blur shadow-md py-4 z-50 border-b border-gray-700">
            <div className="flex items-center gap-3 pl-10">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-blue-600"
                >
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                </svg>
                <Link to="/dashboard" className="text-white font-semibold text-xl">
                    Smart Finance
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 pr-10">
                    <Link to="/add-transaction" className="flex items-center p-2 text-white bg-blue-400 rounded-full hover:cursor-pointer hover:bg-blue-600 transition-colors"
                    >
                        Add Transaction
                    </Link>
                </div>
                <div className="relative inline-block text-left pr-10">
                    <button
                        onClick={handleToggle}
                        className="flex items-center p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                    >
                        <FaUserCircle size={24} className="cursor-pointer text-blue-400" />
                    </button>


                    {open && (
                        <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                            <button
                                onClick={handleProfile}
                                className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                            >
                                Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}