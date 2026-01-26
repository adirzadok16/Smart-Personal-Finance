import { Link } from "react-router-dom";

export default function Home() {
    const handleScroll = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    const navItemClass =
        "text-gray-700 hover:text-gray-900 font-semibold transition-all duration-300 cursor-pointer";

    return (
        <div className="min-h-screen">
            {/* Navbar */}
            <header>
                <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-50/90 backdrop-blur shadow-sm py-4">
                    <div className="flex justify-between items-center px-5">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
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

                        {/* Navigation */}
                        <ul className="flex items-center gap-8">
                            <li>
                                <button
                                    onClick={() => handleScroll("home")}
                                    className={navItemClass}
                                >
                                    Home
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleScroll("about")}
                                    className={navItemClass}
                                >
                                    About
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleScroll("features")}
                                    className={navItemClass}
                                >
                                    Features
                                </button>
                            </li>
                            <li>
                                <Link
                                    to="/login"
                                    className="text-blue-600 font-semibold hover:text-blue-700 transition"
                                >
                                    Sign in
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/signup"
                                    className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm"
                                >
                                    Get Started
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>

            <main>

                {/* Home Section */}
                <section
                    id="home"
                    className="min-h-screen flex flex-col items-center justify-center
                               bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
                >
                    <div className="mb-6 px-4 py-1 rounded-full bg-white/10 border border-white/20">
                        <p className="text-sm tracking-widest text-gray-200">
                            HOME
                        </p>
                    </div>
                    <div className="text-center px-6 max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                            Take Control of Your <span className="text-blue-400">Financial Future</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-200 mb-10">
                            Track expenses, set budgets, and achieve your financial goals
                            with an intelligent and intuitive finance management platform.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/signup"
                                className="bg-blue-600 text-white px-10 py-3 rounded-lg
                                           font-semibold hover:bg-blue-700 transition shadow-md"
                            >
                                Start Free
                            </Link>

                            <button
                                onClick={() => handleScroll("features")}
                                className="bg-white/10 text-white px-10 py-3 rounded-lg
                                           font-semibold border border-white/20
                                           hover:bg-white/20 transition hover:cursor-pointer"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section
                    id="about"
                    className=" min-h-screen flex flex-col items-center justify-center
                               bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
                >
                    <div className="mb-6 px-4 py-1 rounded-full bg-white/10 border border-white/20">
                        <p className="text-sm tracking-widest text-gray-200">
                            ABOUT US
                        </p>
                    </div>
                    <div className="text-center px-6 max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                            Empowering Your <span className="text-blue-400">Financial Freedom</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-200 mb-2">
                            Smart Finance was born from a simple belief: everyone deserves access to intelligent financial tools.
                        </p>

                        <p className="text-lg md:text-xl text-gray-200 mb-10">
                            We combine cutting-edge AI technology with intuitive design to help you make smarter financial decisions, save more, and achieve your goals faster.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col bg-white/10 p-2 rounded-lg hover:cursor-pointer hover:-translate-y-2 transition">
                                <h2 className="text-3xl font-bold text-white mb-4">2019</h2>
                                <p className="text-gray-200 mb-4">Founded</p>

                            </div>
                            <div className="flex flex-col bg-white/10 p-2 rounded-lg hover:cursor-pointer hover:-translate-y-2 transition">
                                <h2 className="text-3xl font-bold text-white mb-4">50+</h2>
                                <p className="text-gray-200 mb-4">Team Members</p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section
                    id="features"
                    className="pt-32 min-h-screen flex flex-col items-center justify-center
               bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4"
                >
                    {/* Section Label */}
                    <div className="mb-6 px-4 py-1 rounded-full bg-white/10 border border-white/20">
                        <p className="text-sm tracking-widest text-gray-200">
                            FEATURES
                        </p>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col items-center justify-center text-center max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                            Everything You Need in One Place
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-16">
                            Powerful tools designed to transform how you manage money.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mb-10">

                        {/* Feature Card Template */}
                        {[
                            {
                                title: "Budget Management",
                                desc: "Track your spending across categories and stay within your budget goals.",
                                iconColor: "bg-blue-600",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        className="w-7 h-7">
                                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                                        <path d="M22 12A10 10 0 0 0 12 2v10z" />
                                    </svg>
                                )
                            },
                            {
                                title: "Expense Tracking",
                                desc: "Keep an eye on where your money goes with detailed tracking and reports.",
                                iconColor: "bg-green-500",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        className="w-7 h-7">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                )
                            },
                            {
                                title: "Reports & Analytics",
                                desc: "Generate detailed reports to analyze your financial performance.",
                                iconColor: "bg-purple-600",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        className="w-7 h-7">
                                        <path d="M3 3h18v18H3z" />
                                    </svg>
                                )
                            },
                            {
                                title: "Investment Insights",
                                desc: "Get smart recommendations to maximize your investments and grow your wealth.",
                                iconColor: "bg-blue-600",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        className="w-7 h-7">
                                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                        <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                )
                            },
                            {
                                title: "Financial Goals",
                                desc: "Get detailed analytics and reports on your financial patterns.",
                                iconColor: "bg-blue-600",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        className="w-7 h-7">
                                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                        <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                )
                            },
                            {
                                title: "AI-Powered Insights",
                                desc: "Leverage AI to forecast trends, optimize your spending, and receive personalized recommendations.",
                                iconColor: "bg-indigo-500",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        className="w-7 h-7">
                                        <path d="M12 2a10 10 0 0 0 0 20" />
                                        <path d="M2 12h20" />
                                    </svg>
                                )
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="group relative bg-white/10 backdrop-blur-md
                p-8 rounded-2xl border border-white/20 shadow-xl transition
                hover:bg-white/20 hover:-translate-y-2 ">
                                <div className={`w-14 h-14 ${feature.iconColor} rounded-xl
                    flex items-center justify-center text-white mb-6
                    transition-transform group-hover:scale-110`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-200 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}

                    </div>
                </section>

            </main>
        </div>
    );
}


