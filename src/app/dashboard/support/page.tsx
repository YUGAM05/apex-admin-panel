"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    Mail,
    Phone,
    ExternalLink,
    Search,
    Filter,
    MoreVertical,
    ChevronRight,
    Loader2
} from 'lucide-react';

export default function SupportDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/support/admin/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setTickets(data);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/support/admin/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                fetchTickets();
                if (selectedTicket?._id === id) {
                    setSelectedTicket({ ...selectedTicket, status: newStatus });
                }
            }
        } catch (error) {
            console.error('Error updating ticket:', error);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
        const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.userId?.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-blue-600" /> Support Tickets
                    </h1>
                    <p className="text-gray-500 font-medium">Manage user inquiries and return assistance requests.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
                    >
                        <option value="All">All Status</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Ticket List */}
                <div className="lg:col-span-4 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                            <p className="text-gray-400 font-bold">No tickets found.</p>
                        </div>
                    ) : (
                        filteredTickets.map((ticket) => (
                            <div
                                key={ticket._id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`p-6 rounded-[2rem] border transition-all cursor-pointer ${selectedTicket?._id === ticket._id
                                        ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200"
                                        : "bg-white border-gray-100 hover:border-blue-200"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${selectedTicket?._id === ticket._id
                                            ? "bg-white/20 text-white"
                                            : ticket.status === 'Open' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                        }`}>
                                        {ticket.status}
                                    </span>
                                    <span className={`text-[10px] font-bold ${selectedTicket?._id === ticket._id ? "text-blue-100" : "text-gray-400"}`}>
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-black mb-2 line-clamp-1">{ticket.subject}</h3>
                                <p className={`text-sm line-clamp-2 ${selectedTicket?._id === ticket._id ? "text-blue-100" : "text-gray-500"}`}>
                                    {ticket.message}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Ticket Detail */}
                <div className="lg:col-span-8">
                    {selectedTicket ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden sticky top-8"
                        >
                            <div className="p-8 md:p-12">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900">{selectedTicket.userId?.name || 'Unknown User'}</h2>
                                            <div className="flex flex-wrap gap-4 mt-2">
                                                <span className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                    <Mail className="w-4 h-4" /> {selectedTicket.userId?.email || 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                    <Phone className="w-4 h-4" /> {selectedTicket.userId?.phone || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleUpdateStatus(selectedTicket._id, 'In Progress')}
                                            className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all"
                                        >
                                            Take Action
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedTicket._id, 'Resolved')}
                                            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                        >
                                            Mark Resolved
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject</p>
                                        <p className="text-xl font-black text-gray-900">{selectedTicket.subject}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Message</p>
                                        <div className="bg-slate-50 p-8 rounded-[2rem] text-gray-700 font-medium leading-relaxed border border-slate-100">
                                            {selectedTicket.message}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                                        <div className="flex items-center gap-8">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                                <span className="flex items-center gap-2 font-black text-gray-900">
                                                    <div className={`w-2 h-2 rounded-full ${selectedTicket.status === 'Open' ? "bg-red-500" : "bg-emerald-500"}`} />
                                                    {selectedTicket.status}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ticket Type</p>
                                                <span className="font-black text-gray-900">{selectedTicket.type}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Request Date</p>
                                            <span className="font-black text-gray-900">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                            <MessageSquare className="w-16 h-16 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Select a ticket to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
