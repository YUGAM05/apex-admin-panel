"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { motion } from "framer-motion";
import {
    Mail, Lock, Loader2, ShieldCheck, ArrowRight,
    Globe, Eye, EyeOff
} from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post('/api/auth/login', { email, password });

            if (res.data.role !== 'admin') {
                setError("Access Denied. Admin privileges required.");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data));
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Login Error:", err);
            if (err.response) {
                setError(err.response.data?.message || `Server Error: ${err.response.status}`);
            } else if (err.request) {
                setError("Network Error: Could not connect to server.");
            } else {
                setError(err.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f6f7f8] text-slate-900 antialiased h-screen overflow-hidden font-sans">
            <div className="flex h-full w-full">
                {/* Left Side: Visual/Branding Section */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#136dec]/90 to-[#0a1822]/85"></div>
                    <img
                        alt="Modern pharmaceutical laboratory"
                        className="absolute inset-0 object-cover w-full h-full"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3vsHDVkH7-YsexJ0e9VtsM8_N_x5ogH9nb8IPQ8O7uBpm733shwhrHIJYdOAuQDiD9azrVo5iwOxh964MFbcl0717zKSLXTyZSDHgJ7b7uWnQACDCSDzzIzeyXfcHJvNHrWi7U-SgnRDsYK_ja-VVGQY7zMxBew6RH927qjbIP6MpufqAqsc80B8gpgAiyGKRmX-ZjkSlAitFBUCW-T8twkekDlARS8OGQhHTHphS3cslXAuTey94qy5ZtHYk5a6Jds8CnIIRyEKg"
                    />
                    <div className="relative z-20 flex flex-col justify-between p-16 w-full text-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg">
                                <svg className="w-8 h-8 text-[#136dec]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                                </svg>
                            </div>
                            <span className="text-2xl font-bold tracking-tight">Apex Care Admin</span>
                        </div>
                        <div className="max-w-md">
                            <h1 className="text-5xl font-extrabold leading-tight mb-6">Securing the future of medical supply chains.</h1>
                            <p className="text-lg text-blue-100 font-medium">Streamlined logistics management for the next generation of e-pharmacies. Enterprise-grade security and real-time tracking.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold uppercase tracking-widest text-blue-200">System Status</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                    <span className="text-sm font-bold">All Systems Operational</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form Section */}
                <div className="w-full lg:w-1/2 flex flex-col bg-white overflow-y-auto">
                    {/* Mobile Header Only */}
                    <div className="lg:hidden flex items-center justify-between p-6 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <svg className="w-6 h-6 text-[#136dec]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                            </svg>
                            <span className="text-lg font-bold text-slate-900">Medlogistics</span>
                        </div>
                        <button className="text-[#136dec] text-sm font-bold">Contact Support</button>
                    </div>

                    <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-12">
                        <div className="max-w-md w-full mx-auto">
                            <div className="mb-10">
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Admin Portal</h2>
                                <p className="text-slate-500 font-medium">Welcome back. Please enter your administrator credentials to access the management dashboard.</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-3"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                                        <p className="leading-relaxed">{error}</p>
                                    </motion.div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="email">Admin Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#136dec]">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input
                                            className="block w-full pl-11 pr-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#136dec]/20 focus:border-[#136dec] transition-all font-medium outline-none"
                                            id="email"
                                            name="email"
                                            placeholder="admin@life-link.com"
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-bold text-slate-700" htmlFor="password">Password</label>
                                        <Link className="text-sm font-bold text-[#136dec] hover:underline" href="#">Forgot Password?</Link>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#136dec]">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            className="block w-full pl-11 pr-12 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#136dec]/20 focus:border-[#136dec] transition-all font-medium outline-none"
                                            id="password"
                                            name="password"
                                            placeholder="••••••••••••"
                                            required
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="w-full flex items-center justify-center py-4 px-6 rounded-xl bg-[#136dec] hover:bg-[#136dec]/90 text-white font-extrabold text-base shadow-lg shadow-[#136dec]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                    ) : (
                                        <>
                                            <span>Admin Login</span>
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-12 pt-8 border-t border-slate-100">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                        <ShieldCheck className="w-5 h-5 text-green-500" />
                                        <span>Secured by Med-Encryption Protocol</span>
                                    </div>
                                    <button className="text-slate-500 hover:text-[#136dec] transition-colors text-sm font-bold flex items-center gap-1">
                                        <span>Support Center</span>
                                        <Globe className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="p-8 mt-auto text-center lg:text-left">
                        <p className="text-slate-400 text-xs font-medium">
                            © 2024 Medlogistics Systems Inc. All rights reserved. Professional Admin Portal v2.4.1
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
