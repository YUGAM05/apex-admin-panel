import Link from 'next/link';
import { LayoutDashboard, Users, ShoppingCart, Package, Settings, LogOut, Store, Menu } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full inset-y-0 left-0 z-50 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                            M
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">MedAdmin</span>
                    </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-1">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">
                            Overview
                        </p>
                        <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                        <NavItem href="/admin/users" icon={<Users size={20} />} label="Users" />

                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">
                            Management
                        </p>
                        <NavItem href="/admin/sellers" icon={<Store size={20} />} label="Sellers" />
                        <NavItem href="/admin/products" icon={<Package size={20} />} label="Products" />
                        <NavItem href="/admin/orders" icon={<ShoppingCart size={20} />} label="Orders" />



                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors group">
                        <LogOut size={20} />
                        <span className="font-medium group-hover:text-red-600">Log Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 bg-gray-50/50">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-8 flex items-center justify-between">
                    <h2 className="text-gray-500 text-sm">Welcome back, <span className="text-gray-900 font-semibold">Super Admin</span></h2>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                            SA
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group text-gray-600 hover:bg-blue-50 hover:text-blue-600`}
        >
            <span className="text-gray-400 group-hover:text-blue-600 transition-colors">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}
