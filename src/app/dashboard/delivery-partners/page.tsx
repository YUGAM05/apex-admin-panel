
"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { CheckCircle, XCircle, Search, Truck, AlertCircle, Phone, MapPin } from 'lucide-react';

export default function DeliveryPartnerManagement() {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected

    useEffect(() => {
        fetchPartners();
    }, [filter]);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            // Fetch users with role 'delivery' and current filter status
            const res = await api.get(`/api/admin/users?role=delivery&status=${filter}`);
            setPartners(res.data);
        } catch (error) {
            console.error('Error fetching delivery partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to ${newStatus} this partner?`)) return;

        try {
            await api.put(`/api/admin/users/${id}/status`, { status: newStatus });
            // Refresh list
            fetchPartners();
            alert(`Partner has been ${newStatus}.`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status.');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Truck className="w-8 h-8 text-orange-600" />
                        Delivery Partner Management
                    </h1>
                    <p className="text-gray-500 mt-1">Approve and manage delivery fleet</p>
                </div>

                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    {['pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === status
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
            ) : partners.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No {filter} delivery partners found</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partners.map((partner) => (
                        <div key={partner._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                                            {partner.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{partner.name}</h3>
                                            <p className="text-xs text-gray-500">{partner.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${partner.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        partner.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {partner.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{partner.phone || 'No phone provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{partner.city || 'Location not set'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Truck className="w-4 h-4 text-gray-400" />
                                        <span>Items Delivered: {partner.deliveriesCompleted || 0}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 pt-2 border-t mt-2">
                                        Joined: {new Date(partner.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {filter === 'pending' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleStatusUpdate(partner._id, 'approved')}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(partner._id, 'rejected')}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition border border-red-200"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                )}

                                {filter !== 'pending' && (
                                    <div className="text-center">
                                        <button
                                            onClick={() => handleStatusUpdate(partner._id, filter === 'approved' ? 'rejected' : 'approved')}
                                            className="text-xs text-gray-400 hover:text-gray-600 underline"
                                        >
                                            Change Status
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
