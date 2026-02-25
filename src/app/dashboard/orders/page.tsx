"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ShoppingCart, User, Package, Calendar } from "lucide-react";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/admin/orders');
            setOrders(res.data);
        } catch (error: any) {
            console.error("Failed to fetch orders:", error.message);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("URL:", error.response.config.url);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">System Orders</h2>

            {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center text-gray-500 border border-gray-200">
                    <div className="flex justify-center mb-4">
                        <ShoppingCart className="w-12 h-12 text-gray-300" />
                    </div>
                    No orders found in the system.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500">Order Details</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Revenue Breakdown</th>
                                <th className="px-6 py-4 font-medium text-gray-500 text-right">Admin Net</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-mono text-gray-400 capitalize">#{order._id.slice(-6).toUpperCase()}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                                        {order.user?.name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{order.user?.name || 'Unknown'}</p>
                                                        <p className="text-[10px] text-gray-500">{order.user?.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1.5 min-w-[180px]">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Order Total:</span>
                                                <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
                                            </div>
                                            <div className="h-[1px] bg-gray-100 my-1"></div>
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-gray-400">Platform Fee:</span>
                                                <span className="text-blue-600 font-medium">+ ₹{order.platformFee || 0}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-gray-400">Seller Comm (15%):</span>
                                                <span className="text-blue-600 font-medium">+ ₹{order.sellerCommission || 0}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-gray-400">Delivery Comm (10%):</span>
                                                <span className="text-blue-600 font-medium">+ ₹{order.adminDeliveryCommission || 0}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="inline-block bg-blue-50 border border-blue-100 rounded-xl p-3 text-right">
                                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-0.5">Total Admin Share</p>
                                            <p className="text-xl font-black text-blue-700">
                                                ₹{(order.platformFee || 0) + (order.sellerCommission || 0) + (order.adminDeliveryCommission || 0)}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                            order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                            }`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
