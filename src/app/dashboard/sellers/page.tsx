"use client";
import { useEffect, useState } from "react";
import { Check, X, Building2, FileText, Phone, MapPin, Search, ExternalLink, UserCheck, Clock, Shield } from "lucide-react";
import api from '@/lib/api';

export default function SellerManagementPage() {
    const [activeTab, setActiveTab] = useState<'verification' | 'active'>('verification');
    const [pendingSellers, setPendingSellers] = useState<any[]>([]);
    const [activeSellers, setActiveSellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const [pendingRes, approvedRes] = await Promise.all([
                api.get('/api/admin/users?role=seller&status=pending'),
                api.get('/api/admin/users?role=seller&status=approved')
            ]);

            setPendingSellers(Array.isArray(pendingRes.data) ? pendingRes.data : []);
            setActiveSellers(Array.isArray(approvedRes.data) ? approvedRes.data : []);
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) window.location.href = '/login';
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        if (!confirm(`Are you sure you want to ${status} this seller?`)) return;

        try {
            await api.put(`/api/admin/users/${id}/status`, { status });
            fetchSellers();
            alert(`Seller ${status} successfully`);
        } catch (error) {
            alert("Action failed");
        }
    };

    const filteredActiveSellers = activeSellers.filter(seller =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Seller Management</h2>
                    <p className="text-gray-500">Manage seller applications and active partners.</p>
                </div>

                {activeTab === 'active' && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search sellers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                        />
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('verification')}
                    className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'verification'
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Verification
                        {pendingSellers.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                {pendingSellers.length}
                            </span>
                        )}
                    </div>
                    {activeTab === 'verification' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'active'
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Active Sellers
                        <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
                            {activeSellers.length}
                        </span>
                    </div>
                    {activeTab === 'active' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                    )}
                </button>
            </div>

            {loading ? (
                <div className="bg-white p-12 rounded-xl text-center text-gray-500 border border-gray-200 shadow-sm">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    Loading sellers...
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Verification Tab Content */}
                    {activeTab === 'verification' && (
                        <div className="grid grid-cols-1 gap-6">
                            {pendingSellers.length === 0 ? (
                                <div className="bg-white p-12 rounded-xl text-center text-gray-500 border border-gray-200">
                                    No pending seller applications.
                                </div>
                            ) : (
                                pendingSellers.map((seller) => (
                                    <div key={seller._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                                        {/* Basic Info */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-gray-900">{seller.name}</h3>
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                                    Pending Review
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Building2 className="w-4 h-4" />
                                                <span>{seller.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                <span>{seller.phone || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {seller.address ? `${seller.address.street}, ${seller.address.city} ${seller.address.zip}` : 'No Address Provided'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Verification Details */}
                                        <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-2">
                                            <h4 className="font-bold text-gray-700 mb-2">Verification Documents</h4>
                                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                                <span className="text-gray-500">Bank Account:</span>
                                                <span className="font-mono text-gray-800">{seller.bankDetails?.accountNumber || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                                <span className="text-gray-500">IFSC Code:</span>
                                                <span className="font-mono text-gray-800">{seller.bankDetails?.ifsc || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200 pb-2 pt-1">
                                                <span className="text-gray-500">Aadhaar Card:</span>
                                                {seller.aadhaarCardUrl ? (
                                                    <a href={seller.aadhaarCardUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline cursor-pointer flex items-center gap-1 font-medium">
                                                        View Aadhaar <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : <span className="text-gray-400 italic">Not Provided</span>}
                                            </div>
                                            <div className="flex justify-between pt-1">
                                                <span className="text-gray-500">License Cert:</span>
                                                {seller.pharmacyCertificate ? (
                                                    <a href={seller.pharmacyCertificate} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1 font-medium">
                                                        View Document <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : <span className="text-gray-400 italic">Not Provided</span>}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3 justify-center md:min-w-[160px] border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-100">
                                            <button
                                                onClick={() => updateStatus(seller._id, 'approved')}
                                                className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full font-medium"
                                            >
                                                <Check className="w-4 h-4" /> Approve
                                            </button>
                                            <button
                                                onClick={() => updateStatus(seller._id, 'rejected')}
                                                className="flex items-center justify-center gap-2 px-6 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition w-full font-medium"
                                            >
                                                <X className="w-4 h-4" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Active Sellers Tab Content */}
                    {activeTab === 'active' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 font-bold text-gray-600 text-sm">
                                        <th className="px-6 py-4">Seller Info</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredActiveSellers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No active sellers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredActiveSellers.map((seller) => (
                                            <tr key={seller._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{seller.name}</div>
                                                    <div className="text-xs text-gray-500">{seller.email}</div>
                                                    <div className="text-[10px] text-gray-400 mt-1 uppercase font-mono tracking-tighter">ID: {seller._id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="w-3 h-3" />
                                                        {seller.phone || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin className="w-3 h-3 text-red-400" />
                                                        {seller.address?.city || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold uppercase">
                                                        Verified
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => updateStatus(seller._id, 'rejected')}
                                                            title="Suspend/Reject"
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => window.open(seller.aadhaarCardUrl, '_blank')}
                                                            title="View Aadhaar Card"
                                                            disabled={!seller.aadhaarCardUrl}
                                                            className={`p-2 rounded-lg transition ${seller.aadhaarCardUrl ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 cursor-not-allowed'}`}
                                                        >
                                                            <Shield className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => window.open(seller.pharmacyCertificate, '_blank')}
                                                            title="View Certificate"
                                                            disabled={!seller.pharmacyCertificate}
                                                            className={`p-2 rounded-lg transition ${seller.pharmacyCertificate ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
