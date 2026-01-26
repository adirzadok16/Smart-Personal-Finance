import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";

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
        <nav className="fixed flex justify-between items-center top-0 left-0 right-0 bg-gray-50 shadow-sm py-4 z-50">
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
                <span className="text-black font-semibold text-xl">
                    Smart Finance
                </span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 pr-10">
                    <button className="flex items-center p-2 text-white bg-blue-600 rounded-full hover:cursor-pointer hover:bg-blue-700">
                        Add Transaction
                    </button>
                </div>
                <div className="relative inline-block text-left pr-10">
                    <button
                        onClick={handleToggle}
                        className="flex items-center p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                    >
                        <FaUserCircle size={24} className="cursor-pointer text-blue-600" />
                    </button>


                    {open && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                            <button
                                onClick={handleProfile}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
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