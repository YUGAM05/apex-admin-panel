"use client";
import { useEffect, useState } from "react";
import { Users, Package, TrendingUp, AlertCircle, CheckCircle, Clock, FileDown, Activity } from "lucide-react";
import api from "@/lib/api";
import { generateSystemReport } from "@/lib/reportUtils";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [trendData, setTrendData] = useState<any>(null);

    useEffect(() => {
        // Fetch stats
        api.get('/api/admin/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));

        // Fetch trends
        api.get('/api/admin/trends')
            .then(res => setTrendData(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Overview of system performance and activities.</p>
                </div>
                <button
                    onClick={() => generateSystemReport(stats)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm hover:shadow-md"
                >
                    <FileDown size={18} />
                    Download Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats?.counts?.users || 0}
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    trend="+5% new today"
                    color="bg-blue-50"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats?.counts?.pendingProducts || 0}
                    icon={<Clock className="w-6 h-6 text-amber-600" />}
                    trend="Action required"
                    trendColor="text-amber-600"
                    color="bg-amber-50"
                />
                <StatCard
                    title="Total Revenue"
                    value={stats?.counts?.revenue ? `₹${stats.counts.revenue.toLocaleString()}` : '₹0'}
                    icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
                    trend="+12% vs last month"
                    trendColor="text-emerald-600"
                    color="bg-emerald-50"
                />
                <StatCard
                    title="Admin Profit"
                    value={stats?.counts?.profit ? `₹${stats.counts.profit.toLocaleString()}` : '₹0'}
                    icon={<Activity className="w-6 h-6 text-rose-600" />}
                    trend="Net Earnings"
                    trendColor="text-rose-600"
                    color="bg-rose-50"
                />
                <StatCard
                    title="Active Sellers"
                    value={stats?.counts?.sellers || 0}
                    icon={<Package className="w-6 h-6 text-purple-600" />}
                    trend="+2 this week"
                    color="bg-purple-50"
                />
            </div>

            {/* Graphs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-gray-900">Revenue Trends (Last 7 Days)</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData?.revenue || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-gray-900">User Acquisition</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData?.users || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="count" name="New Signups" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. New Seller Reports (Pending) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">New Seller Requests</h3>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase">
                                Pending
                            </span>
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {stats?.recentUsers?.filter((u: any) => u.role === 'seller' && u.status === 'pending').length || 0} New
                        </span>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto max-h-[400px]">
                        <div className="space-y-4">
                            {stats?.recentUsers?.filter((u: any) => u.role === 'seller' && u.status === 'pending').length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500 italic text-sm">No pending seller requests.</p>
                                </div>
                            ) : (
                                stats?.recentUsers?.filter((u: any) => u.role === 'seller' && u.status === 'pending').map((user: any) => (
                                    <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl group hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 leading-tight">{user.name}</h4>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <a href="/dashboard/sellers" className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:text-blue-600 hover:border-blue-200 transition shadow-sm">
                                            Review
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Active Sellers Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">Active Sellers</h3>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">
                                Live
                            </span>
                        </div>
                        <a href="/dashboard/sellers" className="text-xs text-blue-600 font-bold hover:underline">View All</a>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto max-h-[400px]">
                        <div className="space-y-4">
                            {!stats?.activeSellers || stats.activeSellers.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500 italic text-sm">No active sellers found.</p>
                                </div>
                            ) : (
                                stats.activeSellers.map((seller: any) => (
                                    <div key={seller._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-green-50/50 transition border border-transparent hover:border-green-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-emerald-600 font-bold shadow-sm">
                                                {seller.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 leading-tight">{seller.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider tabular-nums">Since {new Date(seller.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2 text-gray-400">
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
                {/* Recent Customers */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Recent Customer Signups</h3>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {stats?.recentUsers?.filter((u: any) => u.role === 'customer').length || 0} Total
                        </span>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats?.recentUsers?.filter((u: any) => u.role === 'customer').length === 0 ? (
                                <p className="text-gray-500 italic col-span-2 text-center py-4 text-sm">No recent customer signups.</p>
                            ) : (
                                stats?.recentUsers?.filter((u: any) => u.role === 'customer').map((user: any) => (
                                    <div key={user._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition cursor-default group">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate text-sm">{user.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <span className="text-[10px] text-gray-300 font-bold tabular-nums">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-6">System Health</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <CheckCircle size={18} />
                                </div>
                                <span className="font-medium text-gray-700">API Status</span>
                            </div>
                            <span className="text-green-600 text-sm font-semibold">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <CheckCircle size={18} />
                                </div>
                                <span className="font-medium text-gray-700">Database</span>
                            </div>
                            <span className="text-green-600 text-sm font-semibold">Healthy</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <AlertCircle size={18} />
                                </div>
                                <span className="font-medium text-gray-700">Storage</span>
                            </div>
                            <span className="text-amber-600 text-sm font-semibold">85% Full</span>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">QUICK ACTIONS</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="py-2 px-3 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-blue-600 hover:border-blue-200 transition">
                                Add User
                            </button>
                            <button className="py-2 px-3 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-blue-600 hover:border-blue-200 transition">
                                Reset Cache
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, trendColor = "text-green-600", color }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 ${color} rounded-xl`}>
                    {icon}
                </div>
                {/* <span className="text-gray-400 cursor-pointer hover:text-gray-600">
                    <MoreHorizontal size={16} />
                </span> */}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                {trend && (
                    <div className={`mt-3 text-xs font-medium ${trendColor} flex items-center gap-1`}>
                        {trendColor.includes('green') || trendColor.includes('emerald') ? '↗' : ''} {trend}
                    </div>
                )}
            </div>
        </div>
    )
}
