"use client";
import { useEffect, useState } from "react";
import { User, ShoppingBag, Calendar, Check, X, Eye } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userOrders, setUserOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        api.get('/api/admin/users?role=customer')
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    };

    const handleViewOrders = async (user: any) => {
        setSelectedUser(user);
        setShowModal(true);
        setLoadingOrders(true);
        try {
            const res = await api.get(`/api/admin/users/${user._id}/orders`);
            setUserOrders(res.data);
        } catch (error) {
            console.error(error);
            alert("Failed to fetch orders");
        } finally {
            setLoadingOrders(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">User Management</h2>
            <p className="text-gray-500 mb-8">View registered users and their purchase history.</p>

            {/* Responsive Grid for Users */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                    <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{user.name}</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${user.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {user.status}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-6">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => handleViewOrders(user)}
                            className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 py-2.5 rounded-lg transition-all font-medium"
                        >
                            <ShoppingBag className="w-4 h-4" /> View Purchase History
                        </button>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    No users found.
                </div>
            )}

            {/* Orders Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Purchase History</h3>
                                <p className="text-sm text-gray-500">For {selectedUser.name}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {loadingOrders ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : userOrders.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p>No orders found for this user.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {userOrders.map(order => (
                                        <div key={order._id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition bg-gray-50/30">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="text-xs font-mono text-gray-400">#{order._id.slice(-6)}</span>
                                                    <p className="text-sm font-medium text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'getting ready' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {order.items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-3 text-sm">
                                                        <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {item.product?.imageUrl ? (
                                                                <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <ShoppingBag className="w-4 h-4 text-gray-300" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="truncate font-medium text-gray-800">{item.product?.name || 'Unknown Product'}</p>
                                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 text-right">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
