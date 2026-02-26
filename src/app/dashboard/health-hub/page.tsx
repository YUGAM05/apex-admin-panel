"use client";
import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Loader2 } from 'lucide-react';
import axios from 'axios';

interface HealthTip {
    _id: string;
    title: string;
    description: string;
    date: string;
    imageUrl?: string;
}

export default function HealthHubPage() {
    const [tips, setTips] = useState<HealthTip[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        fetchTips();
    }, []);

    const fetchTips = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://apex-backend-yugam.vercel.app/api'}/health-hub`);
            setTips(response.data);
        } catch (error) {
            console.error('Error fetching tips:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://apex-backend-yugam.vercel.app/api'}/health-hub`, {
                title,
                description,
                imageUrl
            });
            // Reset form and refresh list
            setTitle('');
            setDescription('');
            setImageUrl('');
            fetchTips();
        } catch (error) {
            console.error('Error creating tip:', error);
            alert('Failed to create health tip');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tip?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'https://apex-backend-yugam.vercel.app/api'}/health-hub/${id}`);
            setTips(tips.filter(t => t._id !== id));
        } catch (error) {
            console.error('Error deleting tip:', error);
            alert('Failed to delete tip');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Health Hub Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-600" />
                            Add New Health Tip
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. Benefits of Water"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Enter detailed health tip..."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    'Post Health Tip'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List View */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Recent Posts</h2>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : tips.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                            No health tips posted yet.
                        </div>
                    ) : (
                        tips.map((tip) => (
                            <div key={tip._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex gap-6 group hover:border-blue-200 transition-all">
                                {tip.imageUrl && (
                                    <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                        <img src={tip.imageUrl} alt={tip.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">{tip.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(tip.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(tip._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Tip"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-gray-600 line-clamp-2">{tip.description}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
