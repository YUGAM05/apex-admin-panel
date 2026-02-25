"use client";
import { useEffect, useState } from "react";
import { Package, Check, X, ShieldAlert, Star, Trash2 } from "lucide-react";
import api from "@/lib/api";

export default function ProductVerificationPage() {
    const [products, setProducts] = useState<any[]>([]);

    const fetchProducts = () => {
        // Fetch ALL products to allow management
        api.get('/api/admin/inventory')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setProducts(res.data);
                } else {
                    setProducts([]);
                }
            })
            .catch(err => {
                console.error(err);
                if (err.response?.status === 401) window.location.href = '/login';
            });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        if (!confirm(`Are you sure you want to ${status} this product?`)) return;

        try {
            await api.put(`/api/admin/inventory/${id}/status`, {
                status,
                adminComments: 'Reviewed by Admin'
            });
            fetchProducts();
        } catch (error) {
            alert("Action failed");
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to DELETE this product? It will be removed permanently.")) return;

        try {
            await api.delete(`/api/admin/inventory/${id}`);
            fetchProducts();
        } catch (error) {
            alert("Delete failed");
        }
    };

    const toggleDeal = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/api/admin/inventory/${id}/deal`);
            fetchProducts();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to toggle deal status");
        }
    };

    const [editingProduct, setEditingProduct] = useState<any>(null);

    const openEdit = (product: any) => {
        setEditingProduct({ ...product });
    };

    const closeEdit = () => {
        setEditingProduct(null);
    };

    const saveEdit = async () => {
        if (!editingProduct) return;
        try {
            await api.put(`/api/admin/inventory/${editingProduct._id}`, editingProduct);
            setEditingProduct(null);
            fetchProducts();
            alert("Product updated successfully");
        } catch (error) {
            alert("Failed to update product");
        }
    };

    const setMainImage = (index: number) => {
        if (!editingProduct || !editingProduct.images) return;
        const newImages = [...editingProduct.images];
        // Move selected image to front
        const [selected] = newImages.splice(index, 1);
        newImages.unshift(selected);

        setEditingProduct({
            ...editingProduct,
            images: newImages,
            imageUrl: newImages[0] // Ensure main imageUrl matches
        });
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Product Management</h2>
            <p className="text-gray-500 mb-8">Review, approve, reject, or delete products.</p>

            {products.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center text-gray-500 border border-gray-200">
                    <div className="flex justify-center mb-4">
                        <ShieldAlert className="w-12 h-12 text-green-500 opacity-50" />
                    </div>
                    No products found in the system.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6 relative">
                            {/* Status Badge */}
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${product.status === 'approved' ? 'bg-green-100 text-green-700' :
                                product.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {product.status}
                            </div>

                            {/* Deal Badge */}
                            {product.isDealOfDay && (
                                <div className="absolute top-12 right-4 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-md flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-white" />
                                    DEAL
                                </div>
                            )}

                            {/* Image / Icon */}
                            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                {product.imageUrl || (product.images && product.images[0]) ? (
                                    <img src={product.imageUrl || product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <Package className="w-10 h-10 text-gray-400" />
                                )}
                            </div>

                            {/* Basic Info */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between pr-24">
                                    <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                                </div>
                                <span className="text-sm text-gray-500 block">
                                    Sold by: <span className="font-medium text-blue-600">{product.seller?.name || 'Unknown'}</span>
                                </span>
                                <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>

                                <div className="flex gap-4 pt-2">
                                    <div className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-600">
                                        <span className="font-bold">Category:</span> {product.category}
                                    </div>
                                    <div className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-600">
                                        <span className="font-bold">Price:</span> ₹{product.sellingPrice || product.price}
                                    </div>
                                    <div className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-600">
                                        <span className="font-bold">Stock:</span> {product.stock}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 justify-center border-l md:pl-6 border-gray-100 min-w-[140px]">
                                <button
                                    onClick={() => openEdit(product)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                                >
                                    Edit
                                </button>
                                {product.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(product._id, 'approved')}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                        >
                                            <Check className="w-4 h-4" /> Approve
                                        </button>
                                        <button
                                            onClick={() => updateStatus(product._id, 'rejected')}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition"
                                        >
                                            <X className="w-4 h-4" /> Reject
                                        </button>
                                    </>
                                )}

                                {/* Deal Toggle - Only for approved products */}
                                {product.status === 'approved' && (
                                    <button
                                        onClick={() => toggleDeal(product._id, product.isDealOfDay)}
                                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${product.isDealOfDay
                                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200'
                                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Star className={`w-4 h-4 ${product.isDealOfDay ? 'fill-yellow-600' : ''}`} />
                                        {product.isDealOfDay ? 'Remove Deal' : 'Mark as Deal'}
                                    </button>
                                )}

                                <button
                                    onClick={() => deleteProduct(product._id)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
                            <button onClick={closeEdit} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                                <input
                                    value={editingProduct.name || ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                                <input
                                    type="number"
                                    value={editingProduct.sellingPrice || editingProduct.price || 0}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value) })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Main Image Selection</label>
                                <p className="text-xs text-gray-500 mb-3">Click on an image to set it as the main product image.</p>
                                <div className="grid grid-cols-4 gap-4">
                                    {(editingProduct.images && editingProduct.images.length > 0) ? (
                                        editingProduct.images.map((img: string, idx: number) => (
                                            <div
                                                key={idx}
                                                onClick={() => setMainImage(idx)}
                                                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${idx === 0 ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 hover:border-blue-400'
                                                    }`}
                                            >
                                                <img src={img} className="w-full h-full object-cover" />
                                                {idx === 0 && (
                                                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">Main</span>
                                                    </div>
                                                )}
                                                {idx !== 0 && (
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded shadow-sm">Set Main</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-4 text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                            No images available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={closeEdit} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition">
                                Cancel
                            </button>
                            <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
