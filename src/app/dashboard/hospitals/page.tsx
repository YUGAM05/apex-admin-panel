"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Building, MapPin, Phone, CreditCard, Clock, Trash2, Plus, Edit, X, Search, Star, Filter, Grid3x3, List, Eye } from "lucide-react";
import Image from "next/image";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://apex-backend-yugam.vercel.app';

type Hospital = {
  _id?: string;
  name: string;
  address: string;
  city: string;
  image: string;
  images?: string[];
  isOpen24Hours: boolean;
  consultationFee: number;
  governmentSchemes: string[];
  isOnlinePaymentAvailable: boolean;
  ambulanceContact: string;
  contactNumber?: string;
  description: string;
  rating: number;
};

// Comprehensive list of Indian Government Health Schemes
const GOVERNMENT_SCHEMES = [
  "Ayushman Bharat (PM-JAY)",
  "CGHS (Central Government Health Scheme)",
  "ECHS (Ex-Servicemen Contributory Health Scheme)",
  "ESIC (Employees' State Insurance Corporation)",
  "Rashtriya Swasthya Bima Yojana (RSBY)",
  "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
  "Atal Amrit Abhiyan",
  "Janani Suraksha Yojana (JSY)",
  "Janani Shishu Suraksha Karyakram (JSSK)",
  "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
  "National Health Mission (NHM)",
  "Mission Indradhanush",
  "Pradhan Mantri Swasthya Suraksha Yojana (PMSSY)",
  "National Programme for Prevention and Control of Cancer",
  "National Mental Health Programme",
  "National Tobacco Control Programme",
  "Rashtriya Kishor Swasthya Karyakram (RKSK)",
  "Free Drugs Service Initiative",
  "Free Diagnostic Service Initiative",
  "Other State Government Schemes"
];

export default function HospitalsAdminPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'overview' | 'add' | 'manage'>('overview');
  const fallbackImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" fill="%236b7280" font-size="24" text-anchor="middle" dominant-baseline="middle" font-family="Arial">Image unavailable</text></svg>';

  const [form, setForm] = useState<Hospital>({
    name: "",
    address: "",
    city: "",
    image: "",
    isOpen24Hours: false,
    consultationFee: 0,
    governmentSchemes: [],
    isOnlinePaymentAvailable: true,
    ambulanceContact: "",
    contactNumber: "",
    description: "",
    rating: 0,
  });

  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Hospital | null>(null);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/hospitals");
      setHospitals(res.data);
    } catch (e) {
      console.error("Failed to fetch hospitals", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter((h) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      h.name.toLowerCase().includes(s) ||
      h.city.toLowerCase().includes(s) ||
      h.address.toLowerCase().includes(s)
    );
  });

  const stats = {
    total: hospitals.length,
    open24: hospitals.filter((h) => h.isOpen24Hours).length,
    avgFee: hospitals.length > 0 ? Math.round(hospitals.reduce((acc, h) => acc + Number(h.consultationFee || 0), 0) / hospitals.length) : 0,
    cities: Array.from(new Set(hospitals.map((h) => h.city))).length,
    avgRating: hospitals.length > 0 ? (hospitals.reduce((acc, h) => acc + (h.rating || 0), 0) / hospitals.length).toFixed(1) : 0,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "consultationFee" || name === "rating" ? Number(value) : value,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...form,
        images: [...uploadedImageUrls, ...(form.image ? [form.image] : [])],
      };
      await api.post("/api/hospitals", payload);
      setForm({
        name: "",
        address: "",
        city: "",
        image: "",
        isOpen24Hours: false,
        consultationFee: 0,
        governmentSchemes: [],
        isOnlinePaymentAvailable: true,
        ambulanceContact: "",
        contactNumber: "",
        description: "",
        rating: 0,
      });
      setUploadedImageUrls([]);
      await fetchHospitals();
      setActiveTab('manage');
      alert("Hospital created successfully!");
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to create hospital");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this hospital?")) return;
    try {
      await api.delete(`/api/hospitals/${id}`);
      await fetchHospitals();
    } catch (e) {
      alert("Failed to delete hospital");
    }
  };

  const openEdit = (h: Hospital) => {
    setEditing(h);
    setEditingImages(h.images || []);
  };

  const closeEdit = () => {
    setEditing(null);
    setEditingImages([]);
  };

  const saveEdit = async () => {
    if (!editing?._id) return;
    try {
      const payload: any = {
        ...editing,
        images: editingImages,
      };
      await api.put(`/api/hospitals/${editing._id}`, payload);
      await fetchHospitals();
      closeEdit();
    } catch (e) {
      alert("Failed to update hospital");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            Hospital Management
          </h1>
          <p className="text-gray-500 mt-1">Manage hospital listings and information</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospitals..."
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Hospitals</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">24/7 Open</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.open24}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Cities</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{stats.cities}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Avg Fee</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">₹{stats.avgFee}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Avg Rating</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.avgRating}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'add'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <Plus className="w-4 h-4" />
              Add Hospital
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'manage'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Manage ({hospitals.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Hospitals</span>
                      <span className="font-bold text-gray-900">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">24/7 Available</span>
                      <span className="font-bold text-green-600">{stats.open24}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Rating</span>
                      <span className="font-bold text-yellow-600">{stats.avgRating} ⭐</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-6 border border-purple-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Coverage</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cities Covered</span>
                      <span className="font-bold text-purple-600">{stats.cities}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Avg Consultation Fee</span>
                      <span className="font-bold text-orange-600">₹{stats.avgFee}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Tip:</strong> Use the &quot;Add Hospital&quot; tab to register new hospitals, and &quot;Manage&quot; tab to view and edit existing entries.
                </p>
              </div>
            </div>
          )}

          {/* Add Hospital Tab */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name *</label>
                  <input
                    name="name"
                    placeholder="Enter hospital name"
                    value={form.name ?? ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    name="city"
                    placeholder="Enter city"
                    value={form.city ?? ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    name="address"
                    placeholder="Enter full address"
                    value={form.address ?? ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ambulance Contact</label>
                  <input
                    name="ambulanceContact"
                    placeholder="Enter ambulance number"
                    value={form.ambulanceContact ?? ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    name="contactNumber"
                    placeholder="Enter hospital contact number"
                    value={form.contactNumber ?? ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (₹) *</label>
                  <input
                    name="consultationFee"
                    type="number"
                    placeholder="0"
                    value={form.consultationFee ?? 0}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
                  <input
                    name="rating"
                    type="number"
                    step="0.1"
                    max="5"
                    min="0"
                    placeholder="4.5"
                    value={form.rating ?? 0}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Image URL *</label>
                  <input
                    name="image"
                    placeholder="https://example.com/image.jpg"
                    value={form.image ?? ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Additional Photos</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      try {
                        const token = localStorage.getItem('token');
                        const formData = new FormData();
                        Array.from(files).forEach(f => formData.append('images', f));
                        const res = await fetch(`${BACKEND_URL}/api/hospitals/upload-images`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token || ''}` },
                          body: formData
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setUploadedImageUrls(prev => [...prev, ...(data.urls || [])]);
                        } else {
                          alert(data.message || 'Upload failed');
                        }
                      } catch (err) {
                        alert('Upload failed');
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {uploadedImageUrls.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">✓ {uploadedImageUrls.length} image(s) uploaded</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Government Schemes</label>
                  <div className="relative">
                    <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white min-h-[42px] flex flex-wrap gap-2 items-center">
                      {form.governmentSchemes.length === 0 ? (
                        <span className="text-gray-400 text-sm">Select government schemes (Optional)...</span>
                      ) : (
                        form.governmentSchemes.map((scheme) => (
                          <span
                            key={scheme}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                          >
                            {scheme}
                            <button
                              type="button"
                              onClick={() => {
                                setForm(prev => ({
                                  ...prev,
                                  governmentSchemes: prev.governmentSchemes.filter(s => s !== scheme)
                                }));
                              }}
                              className="hover:text-blue-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    <div className="mt-2 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {GOVERNMENT_SCHEMES.map((scheme) => (
                          <label
                            key={scheme}
                            className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={form.governmentSchemes.includes(scheme)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setForm(prev => ({
                                    ...prev,
                                    governmentSchemes: [...prev.governmentSchemes, scheme]
                                  }));
                                } else {
                                  setForm(prev => ({
                                    ...prev,
                                    governmentSchemes: prev.governmentSchemes.filter(s => s !== scheme)
                                  }));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{scheme}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter hospital description"
                    value={form.description ?? ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Open 24/7?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isOpen24Hours"
                          checked={form.isOpen24Hours === true}
                          onChange={() => setForm({ ...form, isOpen24Hours: true })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isOpen24Hours"
                          checked={form.isOpen24Hours === false}
                          onChange={() => setForm({ ...form, isOpen24Hours: false })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Online Payment Available?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isOnlinePaymentAvailable"
                          checked={form.isOnlinePaymentAvailable === true}
                          onChange={() => setForm({ ...form, isOnlinePaymentAvailable: true })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isOnlinePaymentAvailable"
                          checked={form.isOnlinePaymentAvailable === false}
                          onChange={() => setForm({ ...form, isOnlinePaymentAvailable: false })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Create Hospital
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      name: "",
                      address: "",
                      city: "",
                      image: "",
                      isOpen24Hours: false,
                      consultationFee: 0,
                      governmentSchemes: [],
                      isOnlinePaymentAvailable: true,
                      ambulanceContact: "",
                      contactNumber: "",
                      description: "",
                      rating: 0,
                    });
                    setUploadedImageUrls([]);
                  }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          )}

          {/* Manage Hospitals Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <strong>{filteredHospitals.length}</strong> of <strong>{hospitals.length}</strong> hospitals
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading hospitals...</div>
              ) : filteredHospitals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No hospitals found</div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredHospitals.map((h) => (
                    <div key={h._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-48 bg-gray-100 relative">
                        <Image
                          src={(h.images && h.images[0]) || h.image}
                          alt={h.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const t = e.currentTarget as HTMLImageElement;
                            t.onerror = null;
                            t.src = fallbackImage;
                          }}
                        />
                        {h.isOpen24Hours && (
                          <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 24/7
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/95 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-gray-800 text-sm">{h.rating}</span>
                        </div>
                      </div>
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{h.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{h.description}</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{h.address}, {h.city}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>Ambulance: {h.ambulanceContact}</span>
                          </div>
                          {h.contactNumber && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span>Contact: {h.contactNumber}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600">
                            <CreditCard className="w-4 h-4 flex-shrink-0" />
                            <span className="font-semibold text-gray-900">₹{h.consultationFee}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t">
                          <button
                            onClick={() => setSelectedHospital(h)}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                          <button
                            onClick={() => openEdit(h)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(h._id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHospitals.map((h) => (
                    <div key={h._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg relative flex-shrink-0 overflow-hidden">
                        <Image
                          src={(h.images && h.images[0]) || h.image}
                          alt={h.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const t = e.currentTarget as HTMLImageElement;
                            t.onerror = null;
                            t.src = fallbackImage;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              {h.name}
                              {h.isOpen24Hours && (
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">24/7</span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {h.address}, {h.city}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-gray-800 text-sm">{h.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {h.ambulanceContact}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            <strong className="text-gray-900">₹{h.consultationFee}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedHospital(h)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(h)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(h._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Hospital</h2>
              <button onClick={closeEdit} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                  <input
                    value={editing.name || ''}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    value={editing.city || ''}
                    onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    value={editing.address || ''}
                    onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ambulance Contact</label>
                  <input
                    value={editing.ambulanceContact || ''}
                    onChange={(e) => setEditing({ ...editing, ambulanceContact: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    value={editing.contactNumber || ''}
                    onChange={(e) => setEditing({ ...editing, contactNumber: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>
                  <input
                    type="number"
                    value={editing.consultationFee ?? 0}
                    onChange={(e) => setEditing({ ...editing, consultationFee: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    max="5"
                    value={editing.rating ?? 0}
                    onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Open 24/7?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="edit_isOpen24Hours" checked={editing.isOpen24Hours === true} onChange={() => setEditing({ ...editing, isOpen24Hours: true })} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="edit_isOpen24Hours" checked={editing.isOpen24Hours === false} onChange={() => setEditing({ ...editing, isOpen24Hours: false })} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Online Payment Available?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="edit_isOnlinePaymentAvailable" checked={editing.isOnlinePaymentAvailable === true} onChange={() => setEditing({ ...editing, isOnlinePaymentAvailable: true })} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="edit_isOnlinePaymentAvailable" checked={editing.isOnlinePaymentAvailable === false} onChange={() => setEditing({ ...editing, isOnlinePaymentAvailable: false })} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editing.description || ''}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Government Schemes</label>
                  <div className="relative">
                    <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white min-h-[42px] flex flex-wrap gap-2 items-center">
                      {(!editing.governmentSchemes || editing.governmentSchemes.length === 0) ? (
                        <span className="text-gray-400 text-sm">Select government schemes (Optional)...</span>
                      ) : (
                        editing.governmentSchemes.map((scheme) => (
                          <span key={scheme} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                            {scheme}
                            <button type="button" onClick={() => { setEditing(prev => prev ? ({ ...prev, governmentSchemes: prev.governmentSchemes.filter(s => s !== scheme) }) : null); }} className="hover:text-blue-900">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    <div className="mt-2 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {GOVERNMENT_SCHEMES.map((scheme) => (
                          <label key={scheme} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={editing.governmentSchemes?.includes(scheme) || false}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditing(prev => prev ? ({ ...prev, governmentSchemes: [...(prev.governmentSchemes || []), scheme] }) : null);
                                } else {
                                  setEditing(prev => prev ? ({ ...prev, governmentSchemes: (prev.governmentSchemes || []).filter(s => s !== scheme) }) : null);
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{scheme}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button onClick={closeEdit} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={saveEdit} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Hospital Details</h2>
              <button onClick={() => setSelectedHospital(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="h-64 bg-gray-100 rounded-xl relative overflow-hidden">
                <Image
                  src={(selectedHospital.images && selectedHospital.images[0]) || selectedHospital.image}
                  alt={selectedHospital.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement;
                    t.onerror = null;
                    t.src = fallbackImage;
                  }}
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  {selectedHospital.name}
                  {selectedHospital.isOpen24Hours && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" /> 24/7
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 mt-2">{selectedHospital.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2"><MapPin className="w-4 h-4" />{selectedHospital.city}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedHospital.address}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Ambulance</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2"><Phone className="w-4 h-4" />{selectedHospital.ambulanceContact}</p>
                </div>
                {selectedHospital.contactNumber && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Contact Number</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2"><Phone className="w-4 h-4" />{selectedHospital.contactNumber}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Consultation Fee</p>
                  <p className="font-bold text-2xl text-gray-900">₹{selectedHospital.consultationFee}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Rating</p>
                  <p className="font-bold text-2xl text-gray-900 flex items-center gap-2">{selectedHospital.rating}<Star className="w-6 h-6 fill-yellow-400 text-yellow-400" /></p>
                </div>
              </div>
              {selectedHospital.governmentSchemes && selectedHospital.governmentSchemes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Government Schemes Accepted</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedHospital.governmentSchemes.map((scheme, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{scheme}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}