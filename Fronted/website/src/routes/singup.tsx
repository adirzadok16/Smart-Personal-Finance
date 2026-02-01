import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


export default function Singup() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {

            const response = await axios.post("http://localhost:3000/api/auth/register", { firstName, lastName, email, password });
            if (response.status === 201) {
                alert("User registered successfully");
                navigate("/login");
            }

            console.log(response.data);

        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <div className="bg-gray-800 w-full max-w-md p-8 rounded-xl shadow-2xl border border-gray-700">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-8 h-8 text-white"
                        >
                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                            <polyline points="16 7 22 7 22 13" />
                        </svg>
                    </div>
                </div>
                {/* Title */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white">Create Account</h1>
                    <p className="text-gray-400">Start managing your finances today</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* First Name */}
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-semibold mb-1 text-gray-300">
                            First Name
                        </label>
                        <input
                            required
                            id="firstName"
                            type="text"
                            autoComplete="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your first name"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                    </div>
                    {/* Last Name */}
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-semibold mb-1 text-gray-300">
                            Last Name
                        </label>
                        <input
                            required
                            id="lastName"
                            type="text"
                            autoComplete="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter your last name"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                    </div>
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-1 text-gray-300">
                            Email
                        </label>
                        <input
                            required
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold mb-1 text-gray-300">
                            Password
                        </label>
                        <div className="relative">
                            <input className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" type="password" name="password" placeholder="Enter your password" value={password} required onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg
                       hover:bg-blue-700 transition disabled:opacity-60"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                    {/* Sign in */}
                    <div className="text-center mt-6 text-sm text-gray-400">
                        Already have an account?
                        <Link
                            to="/login"
                            className="text-blue-400 font-semibold ml-1 hover:underline"
                        >
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

