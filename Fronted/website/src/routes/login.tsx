import { useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
   


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // בדיקה מיידית
        if (!email || !password) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {

            const response = await axios.post("http://localhost:3000/api/auth/login", { email, password });
            if(response.status === 200){
                alert("User logged in successfully");
                navigate("/");
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
            <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-2xl">
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
                    <h1 className="text-3xl font-bold">Smart Finance Tracker</h1>
                    <p className="text-gray-500">Manage your money intelligently</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-1">
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
                            className="w-full border border-gray-300 rounded-lg p-2
                         focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600" type="password" name="password" placeholder="Enter your password" required onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>

                    {/* Remember + Forgot */}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" />
                            Remember me
                        </label>
                        <span className="text-blue-600 cursor-pointer hover:underline">
                            Forgot password?
                        </span>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg
                       hover:bg-blue-700 transition disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                {/* Signup */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    Don’t have an account?
                    <Link
                        to="/signup"
                        className="text-blue-600 font-semibold ml-1 hover:underline"
                    >
                        Sign up now
                    </Link>
                </div>
            </div>
        </div>
    );
}
