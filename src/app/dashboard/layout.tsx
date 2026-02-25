import Link from 'next/link';
import { LayoutDashboard, Users, Package, Settings, FileHeart, Heart, Store, ShoppingCart, LogOut, Building, Truck, MessageSquare, BookOpen, Ticket } from 'lucide-react';

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
                        <img src="/apex-care-logo.png" alt="Apex Care Logo" className="w-10 h-10 object-contain" />
                        <span className="text-xl font-bold tracking-tight text-gray-900">Apex Care Admin</span>
                    </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-1">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">
                            Overview
                        </p>
                        <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                        <NavItem href="/dashboard/users" icon={<Users size={20} />} label="Users" />

                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">
                            Management
                        </p>
                        <NavItem href="/dashboard/sellers" icon={<Store size={20} />} label="Sellers" />
                        <NavItem href="/dashboard/delivery-partners" icon={<Truck size={20} />} label="Delivery Partners" />
                        <NavItem href="/dashboard/products" icon={<Package size={20} />} label="Products" />
                        <NavItem href="/dashboard/orders" icon={<ShoppingCart size={20} />} label="Orders" />
                        <NavItem href="/dashboard/prescriptions" icon={<FileHeart size={20} />} label="Prescriptions" />
                        <NavItem href="/dashboard/blood-bank" icon={<Heart size={20} />} label="Blood Bank" />
                        <NavItem href="/dashboard/hospitals" icon={<Building size={20} />} label="Hospitals" />
                        <NavItem href="/dashboard/health-hub" icon={<FileHeart size={20} />} label="Health Hub" />
                        <NavItem href="/dashboard/support" icon={<MessageSquare size={20} />} label="Support" />
                        <NavItem href="/dashboard/blogs" icon={<BookOpen size={20} />} label="Blogs" />
                        <NavItem href="/dashboard/coupons" icon={<Ticket size={20} />} label="Coupons" />


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
    // Note: in a real app, usePathname to determine active state. For now we just style a bit.
    // We can't use usePathname in a server component (layout), but this is a client component root usually?
    // Actually layout is server by default in App Router, but we can make it client or just use standard links.
    // For simplicity, we won't fully implement active state logic here without "use client" and usePathname.
    // We'll just style them neutrally with hover effects.

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
