"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Heart, Activity, Search, MapPin, Droplet, User, Phone, CheckCircle, AlertOctagon, Clock, ShieldCheck, Siren, FileSpreadsheet, Download, Upload, X, Trash2, ExternalLink, Bot, Image as ImageIcon } from 'lucide-react';
// Removed top-level imports that break SSR
import { saveAs } from 'file-saver';

export default function BloodBankAdminPage() {
    const [activeTab, setActiveTab] = useState<'donors' | 'requests'>('requests');
    const [donors, setDonors] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [verifyingAI, setVerifyingAI] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchData = async (isPolling = false) => {
        if (!isPolling) setLoading(true);
        try {
            const [donorsRes, requestsRes, statsRes] = await Promise.all([
                api.get('/api/blood-bank/admin/donors'),
                api.get('/api/blood-bank/admin/requests'),
                api.get('/api/blood-bank/admin/donors/stats')
            ]);
            setDonors(donorsRes.data);
            setRequests(requestsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching blood bank data:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/blood-bank/admin/import/donors/template', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Template download failed');

            const blob = await response.blob();
            saveAs(blob, 'blood_donor_import_template.xlsx');
        } catch (error) {
            console.error('Template download failed:', error);
            alert('Failed to download template');
        }
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx')) {
            alert('Please upload a valid Excel Workbook (.xlsx). Legacy .xls and CSV files are not supported.');
            return;
        }

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/api/blood-bank/admin/import/donors', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const result = response.data;

            let message = `Import completed!\n\nSuccessful: ${result.stats.successfulImports}\nDuplicates: ${result.stats.duplicates}\nErrors: ${result.stats.errors}`;

            if (result.errors && result.errors.length > 0) {
                message += `\n\nDetails:\n${result.errors.slice(0, 5).join('\n')}`;
                if (result.errors.length > 5) message += `\n...and ${result.errors.length - 5} more errors.`;
            }

            alert(message);
            fetchData();
            setShowImportModal(false);
        } catch (error: any) {
            console.error('Import error:', error);
            const message = error.response?.data?.message || 'Failed to import file';
            const detail = error.response?.data?.error ? `\nReason: ${error.response.data.error}` : '';
            alert(`${message}${detail}`);
        } finally {
            setImporting(false);
            event.target.value = '';
        }
    };

    const downloadExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'donors'
                ? '/api/blood-bank/admin/export/donors/excel'
                : '/api/blood-bank/admin/export/requests/excel';

            const response = await fetch(`http://localhost:5000${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            saveAs(blob, `blood-${activeTab}-${Date.now()}.xlsx`);
        } catch (error) {
            console.error('Excel export failed:', error);
            alert('Failed to export to Excel');
        }
    };

    const downloadPDF = async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'donors'
                ? '/api/blood-bank/admin/export/donors/pdf'
                : '/api/blood-bank/admin/export/requests/pdf';

            const response = await api.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
            const data = activeTab === 'donors' ? response.data.donors : response.data.requests;

            // Dynamically import libraries to avoid SSR errors
            const jspdfModule = await import('jspdf');
            const jsPDF = jspdfModule.jsPDF || jspdfModule.default;
            const autoTable = (await import('jspdf-autotable')).default;

            const doc = new jsPDF('landscape');
            doc.setFontSize(18);
            doc.setTextColor(220, 20, 60);
            doc.text(`Blood ${activeTab === 'donors' ? 'Donors' : 'Requests'} Report`, 14, 15);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

            let headers: string[];
            let rows: any[][];

            if (activeTab === 'donors') {
                headers = ['Name', 'Email', 'Blood Group', 'Age', 'Gender', 'Phone', 'City', 'Area', 'Available'];
                rows = data.map((d: any) => [
                    d.name, d.email, d.bloodGroup, d.age, d.gender,
                    d.phone, d.city, d.area, d.isAvailable
                ]);
            } else {
                headers = ['Patient', 'Requested By', 'Blood Group', 'Units', 'Hospital', 'City', 'Contact', 'Status', 'Urgent'];
                rows = data.map((r: any) => [
                    r.patientName, r.requestedBy, r.bloodGroup, r.units,
                    r.hospitalAddress, r.city, r.contactNumber, r.status, r.isUrgent
                ]);
            }

            autoTable(doc, {
                head: [headers],
                body: rows,
                startY: 28,
                theme: 'grid',
                headStyles: {
                    fillColor: [220, 20, 60],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 28 }
            });

            doc.save(`blood-${activeTab}-${Date.now()}.pdf`);
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('Failed to export to PDF');
        }
    };





    const handleAIVerify = async (id: string) => {
        console.log(`[UI] Starting AI verification for ${id}...`);
        setVerifyingAI(id);
        try {
            const response = await api.post(`/api/blood-bank/admin/requests/${id}/verify-ai`);
            const updatedRequest = response.data;
            console.log(`[UI] Received response:`, updatedRequest);

            // Update the requests list
            setRequests(prev => prev.map(req => req._id === id ? updatedRequest : req));

            // If this request is currently selected, update it too
            if (selectedRequest && selectedRequest._id === id) {
                console.log(`[UI] Updating selected request state.`);
                setSelectedRequest(updatedRequest);
            }

            // fetchData(); // Removed to avoid multiple state updates, the local update is sufficient
        } catch (error: any) {
            console.error('[UI] Agent Verification failed:', error);
            alert(error.response?.data?.message || 'Agent Verification failed. Please ensure Ollama is running.');
        } finally {
            setVerifyingAI(null);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        if (!confirm(`Are you sure you want to mark this request as ${status}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await api.patch(`/api/blood-bank/admin/requests/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    const handleDeleteDonor = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from the donor list? This action cannot be undone.`)) return;
        try {
            await api.delete(`/api/blood-bank/admin/donors/${id}`);
            fetchData();
            alert('Donor removed successfully');
        } catch (error) {
            console.error('Failed to delete donor:', error);
            alert('Failed to delete donor');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">Blood Bank Management</h1>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100 shadow-sm shadow-green-100/50">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider">Live</span>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Requests ({requests.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('donors')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'donors' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Donors ({donors.length})
                        </button>
                    </div>

                    <button
                        onClick={downloadExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export Excel
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>

                    {activeTab === 'donors' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                            >
                                <Upload className="w-4 h-4" />
                                Import Data
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {activeTab === 'donors' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-500 mb-1">Total Donors</div>
                        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                        <div className="text-sm text-blue-600 mb-1 flex items-center gap-1">
                            <User className="w-4 h-4" />
                            User Panel
                        </div>
                        <div className="text-2xl font-bold text-blue-700">{stats.userPanel}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                        <div className="text-sm text-purple-600 mb-1 flex items-center gap-1">
                            <FileSpreadsheet className="w-4 h-4" />
                            Google Form
                        </div>
                        <div className="text-2xl font-bold text-purple-700">{stats.googleForm}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                        <div className="text-sm text-green-600 mb-1 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Available
                        </div>
                        <div className="text-2xl font-bold text-green-700">{stats.available}</div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {activeTab === 'requests' ? (
                        <RequestsTable
                            requests={requests}
                            onStatusUpdate={handleStatusUpdate}
                            onAIVerify={handleAIVerify}
                            verifyingAI={verifyingAI}
                            onViewDetails={(req) => setSelectedRequest(req)}
                        />
                    ) : (
                        <DonorsTable donors={donors} onDelete={handleDeleteDonor} />
                    )}
                </div>
            )}

            {/* Local Agent Verification Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[85vh]">
                        {/* Image Preview Side */}
                        <div className="md:w-1/2 bg-gray-900 flex items-center justify-center p-4">
                            {selectedRequest.kycDocumentImage ? (
                                <img
                                    src={selectedRequest.kycDocumentImage}
                                    className="max-w-full max-h-full object-contain"
                                    alt="KYC Document"
                                />
                            ) : (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <ImageIcon className="w-16 h-16 mb-2" />
                                    <span>No Image Available</span>
                                </div>
                            )}
                        </div>

                        {/* Details Side */}
                        <div className="md:w-1/2 p-8 flex flex-col overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">KYC Agent Verification</h3>
                                    <p className="text-gray-500">{selectedRequest.kycDocumentType}</p>
                                </div>
                                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-600 uppercase tracking-wider">
                                        <Bot className="w-4 h-4" /> Agent Report (Ollama/Llama3)
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${selectedRequest.aiVerificationStatus === 'Verified' ? 'bg-green-100 text-green-700' :
                                            selectedRequest.aiVerificationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {selectedRequest.aiVerificationStatus || 'Pending'}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed italic">
                                        &quot;{selectedRequest.aiVerificationRemarks || 'No agent analysis has been performed yet.'}&quot;
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <span className="text-gray-500 block">Patient</span>
                                        <span className="font-bold text-red-900">{selectedRequest.patientName}</span>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <span className="text-gray-500 block">Blood Group</span>
                                        <span className="font-bold text-red-900">{selectedRequest.bloodGroup}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 mt-auto flex gap-3">
                                {selectedRequest.aiVerificationStatus !== 'Verified' && (
                                    <button
                                        onClick={() => handleAIVerify(selectedRequest._id)}
                                        disabled={verifyingAI === selectedRequest._id}
                                        className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
                                    >
                                        {verifyingAI === selectedRequest._id ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Running AI...
                                            </>
                                        ) : (
                                            <>
                                                <Bot className="w-5 h-5" />
                                                Run Agent Verification
                                            </>
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}






            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-purple-600">
                                <FileSpreadsheet className="w-6 h-6" />
                                <h3 className="text-xl font-bold text-gray-900">Import Blood Donors</h3>
                            </div>
                            <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                                <p className="font-semibold mb-1">Sheet Requirements:</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-600">
                                    <li>First row must be headers</li>
                                    <li>Supported columns: Name, Blood Group, Phone, Email, Age, Gender, City, Area, Address</li>
                                    <li>Phone number must be unique</li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={downloadTemplate}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-gray-600 font-medium group"
                                >
                                    <Download className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                                    Download Sample Template
                                </button>

                                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl cursor-pointer transition-all font-bold shadow-lg shadow-purple-100 group">
                                    {importing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processing File...
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                            Upload Excel & Import
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".xlsx"
                                        onChange={handleFileImport}
                                        disabled={importing}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Supported format: .xlsx only</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function RequestsTable({ requests, onStatusUpdate, onAIVerify, verifyingAI, onViewDetails }: {
    requests: any[],
    onStatusUpdate: (id: string, status: string) => void,
    onAIVerify: (id: string) => void,
    verifyingAI: string | null,
    onViewDetails: (req: any) => void
}) {
    if (requests.length === 0) return <EmptyState message="No blood requests found" />;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-gray-700">Urgency</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Patient</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Blood Group</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Location</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">KYC Status</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {requests.map((req) => (
                        <tr key={req._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                {req.isUrgent ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                        <AlertOctagon className="w-3 h-3" /> Critical
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                        Standard
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{req.patientName}</div>
                                <div className="text-gray-500 text-xs">Age: {req.age}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                                        {req.bloodGroup}
                                    </span>
                                    <span className="text-gray-500 text-xs">{req.units} Units</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                <div className="font-medium text-xs truncate max-w-[150px]">{req.hospitalAddress}</div>
                                <div className="text-[10px]">{req.area}, {req.city}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        {req.kycDocumentImage ? (
                                            <div
                                                className="w-10 h-7 bg-gray-100 rounded border border-gray-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => onViewDetails(req)}
                                            >
                                                <img src={req.kycDocumentImage} alt="KYC Document" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-7 bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-gray-300">
                                                <ImageIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${req.aiVerificationStatus === 'Verified' ? 'bg-green-100 text-green-700' :
                                            req.aiVerificationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                            {req.aiVerificationStatus || 'Pending'}
                                        </span>
                                    </div>
                                    {req.kycDocumentImage && (!req.aiVerificationStatus || req.aiVerificationStatus === 'Pending') ? (
                                        <button
                                            onClick={() => onAIVerify(req._id)}
                                            disabled={verifyingAI === req._id}
                                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {verifyingAI === req._id ? 'Running...' : <><Bot className="w-3 h-3" /> Run Agent</>}
                                        </button>
                                    ) : req.aiVerificationStatus && (
                                        <button
                                            onClick={() => onViewDetails(req)}
                                            className="text-[10px] font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                        >
                                            <Bot className="w-3 h-3" /> View Report
                                        </button>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'Open' || req.status === 'Urgent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {req.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onViewDetails(req)}
                                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                                        title="View Details"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                    {req.status !== 'Fulfilled' && req.status !== 'Closed' && (
                                        <button
                                            onClick={() => onStatusUpdate(req._id, 'Fulfilled')}
                                            className="text-[10px] bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md transition-colors shadow-sm font-bold"
                                        >
                                            Fulfill
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function DonorsTable({ donors, onDelete }: { donors: any[], onDelete: (id: string, name: string) => void }) {
    if (donors.length === 0) return <EmptyState message="No registered donors found" />;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-gray-700">Donor</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Blood Group</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Details</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Location</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Contact</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Source</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Availability</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {donors.map((donor) => (
                        <tr key={donor._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{donor.name}</div>
                                <div className="text-gray-500 text-xs text-ellipsis overflow-hidden max-w-[150px]">{donor.address}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                                    {donor.bloodGroup}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                <div>{donor.gender}, {donor.age} yrs</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                <div className="font-medium">{donor.area}</div>
                                <div className="text-xs">{donor.city}</div>
                            </td>
                            <td className="px-6 py-4 font-mono text-gray-600">
                                {donor.phone}
                            </td>
                            <td className="px-6 py-4">
                                {donor.source === 'google_form' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                        <FileSpreadsheet className="w-3 h-3" />
                                        Google Form
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                        <User className="w-3 h-3" />
                                        User Panel
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {donor.isAvailable ? (
                                    <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">
                                        <CheckCircle className="w-3 h-3" /> Available
                                    </span>
                                ) : (
                                    <span className="text-gray-400 font-bold text-xs">Unavailable</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => onDelete(donor._id, donor.name)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove Donor"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="p-12 text-center text-gray-400">
            <Heart className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p>{message}</p>
        </div>
    );
}
