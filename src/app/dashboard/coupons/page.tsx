"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Ticket, Plus, Trash2, Calendar, Tag, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    expiryDate: string;
    isActive: boolean;
    usageLimit?: number;
    usageCount: number;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage",
        discountValue: 0,
        minOrderAmount: 0,
        expiryDate: "",
        usageLimit: ""
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await api.get("/api/coupons/admin");
            setCoupons(res.data);
        } catch (err) {
            console.error("Failed to fetch coupons", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/api/coupons/admin", {
                ...formData,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined
            });
            setIsFormOpen(false);
            setFormData({
                code: "",
                discountType: "percentage",
                discountValue: 0,
                minOrderAmount: 0,
                expiryDate: "",
                usageLimit: ""
            });
            fetchCoupons();
        } catch (err) {
            console.error("Failed to create coupon", err);
            alert("Failed to create coupon. Check if code already exists.");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/api/coupons/admin/${id}`, { isActive: !currentStatus });
            fetchCoupons();
        } catch (err) {
            console.error("Failed to toggle status", err);
        }
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await api.delete(`/api/coupons/admin/${id}`);
            fetchCoupons();
        } catch (err) {
            console.error("Failed to delete coupon", err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Ticket className="text-blue-600" size={32} />
                        Coupon Management
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Create and manage discount codes for users</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Plus size={20} />
                    Create New Coupon
                </button>
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100"
                    >
                        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Coupon Code</label>
                                <input
                                    required
                                    placeholder="e.g. HEALTH20"
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 px-6 text-gray-800 font-bold focus:outline-none focus:border-blue-600 transition-all"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Discount Type</label>
                                <select
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 px-6 text-gray-800 font-bold focus:outline-none focus:border-blue-600 transition-all"
                                    value={formData.discountType}
                                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Discount Value</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 px-6 text-gray-800 font-bold focus:outline-none focus:border-blue-600 transition-all"
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Min Order Amount (₹)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 px-6 text-gray-800 font-bold focus:outline-none focus:border-blue-600 transition-all"
                                    value={formData.minOrderAmount}
                                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Expiry Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 px-6 text-gray-800 font-bold focus:outline-none focus:border-blue-600 transition-all"
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Usage Limit (Optional)</label>
                                <input
                                    type="number"
                                    placeholder="No limit"
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 px-6 text-gray-800 font-bold focus:outline-none focus:border-blue-600 transition-all"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-3 flex justify-end gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-8 py-3 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-3 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={24} /> : "Save Coupon"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 flex justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={48} />
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Ticket className="text-gray-300" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No Coupons Yet</h3>
                        <p className="text-gray-500 font-medium">Create your first discount code above</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Coupon</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Discount</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Min Order</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Expiry</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Usage</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((coupon) => (
                                    <tr key={coupon._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-black text-lg inline-block border border-blue-100">
                                                {coupon.code}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-gray-900 text-lg">
                                                {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' ₹'}
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{coupon.discountType} off</p>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-gray-600">₹{coupon.minOrderAmount}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-600 font-bold">
                                                <Calendar size={16} className="text-gray-400" />
                                                {format(new Date(coupon.expiryDate), "MMM dd, yyyy")}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-gray-900">{coupon.usageCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</div>
                                            <div className="w-24 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full"
                                                    style={{ width: `${coupon.usageLimit ? (coupon.usageCount / coupon.usageLimit) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => toggleStatus(coupon._id, coupon.isActive)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all ${coupon.isActive
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {coupon.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                {coupon.isActive ? 'Active' : 'Paused'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => deleteCoupon(coupon._id)}
                                                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
