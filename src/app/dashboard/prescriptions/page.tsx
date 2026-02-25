"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Prescription {
    _id: string;
    user: {
        name: string;
        email: string;
    };
    imageUrl: string;
    status: 'pending' | 'verified' | 'rejected';
    notes?: string;
    createdAt: string;
}

export default function PrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const fetchPrescriptions = async () => {
        try {
            // Fetch all prescriptions or just pending? I'll fetch all sorted by date
            const res = await api.get('/api/prescriptions/admin');
            setPrescriptions(res.data);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const handleStatusUpdate = async (id: string, status: 'verified' | 'rejected') => {
        try {
            await api.put(`/api/prescriptions/${id}/status`, { status });
            // Update UI optimistically
            setPrescriptions(prev => prev.map(p =>
                p._id === id ? { ...p, status } : p
            ));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Prescription Review</h1>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Pending: {prescriptions.filter(p => p.status === 'pending').length}
                    </span>
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {prescriptions.map((p) => (
                        <div key={p._id} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row gap-6 shadow-sm">
                            {/* Thumbnail - PDF or Image */}
                            <div className="w-full md:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setSelectedImage(p.imageUrl)}>
                                {p.imageUrl.includes('application/pdf') || p.imageUrl.endsWith('.pdf') ? (
                                    // PDF Icon
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                        <svg className="w-20 h-20 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-bold text-gray-700">PDF Document</span>
                                    </div>
                                ) : (
                                    // Image Preview
                                    <img src={p.imageUrl} alt="Prescription" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                )}</div>

                            {/* Details */}
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{p.user?.name || 'Unknown User'}</h3>
                                        <p className="text-sm text-gray-500">{p.user?.email}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Uploaded: {new Date(p.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        p.status === 'verified' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {p.status}
                                    </div>
                                </div>

                                {p.notes && (
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mt-2 border border-gray-100">
                                        <span className="font-semibold block text-xs text-gray-500 uppercase mb-1">User Notes:</span>
                                        {p.notes}
                                    </div>
                                )}

                                <div className="pt-4 flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedImage(p.imageUrl)}
                                        className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" /> View Document
                                    </button>

                                    {p.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(p._id, 'verified')}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(p._id, 'rejected')}
                                                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold text-sm flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {prescriptions.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            No prescriptions found.
                        </div>
                    )}
                </div>
            )}

            {/* File Viewer Modal - Supports both images and PDFs */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-6xl max-h-[95vh] w-full bg-white rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-full hover:bg-red-700 z-10 shadow-lg transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>

                        {/* Check if it's a PDF or image */}
                        {selectedImage.includes('application/pdf') || selectedImage.endsWith('.pdf') ? (
                            // PDF Viewer
                            <div className="w-full h-[90vh]">
                                <iframe
                                    src={selectedImage}
                                    className="w-full h-full"
                                    title="Prescription PDF"
                                />
                            </div>
                        ) : (
                            // Image Viewer
                            <img src={selectedImage} alt="Prescription Full View" className="w-full h-full object-contain max-h-[90vh]" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
