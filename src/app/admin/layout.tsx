'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '\u{1F4CA}' },
  { href: '/admin/users', label: 'Utilisateurs', icon: '\u{1F465}' },
  { href: '/admin/questions', label: 'Questions', icon: '\u2753' },
  { href: '/admin/categories', label: 'Categories', icon: '\u{1F4C1}' },
  { href: '/admin/sessions', label: 'Sessions', icon: '\u{1F3AE}' },
  { href: '/admin/settings', label: 'Parametres', icon: '\u2699\uFE0F' },
  { href: '/admin/site-content', label: 'Contenu du site', icon: '\u{1F4DD}' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!user || !isAdmin)) {
      router.replace('/');
    }
  }, [mounted, user, isAdmin, router]);

  if (!mounted || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-primary-darker text-white flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="text-xl">&#x1F33F;</span>
            <span>Muana Mayele</span>
          </Link>
          <p className="text-white/40 text-xs mt-1">Administration</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${active ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/40 mb-2">{user.full_name}</div>
          <div className="flex gap-2">
            <Link href="/" className="text-xs text-white/50 hover:text-white">&#x1F3E0; Site</Link>
            <span className="text-white/20">|</span>
            <button onClick={() => { logout(); router.push('/'); }} className="text-xs text-white/50 hover:text-red-400">&#x1F6AA; Deconnexion</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded hover:bg-gray-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
          <h1 className="text-lg font-semibold text-dark flex-1">
            {navItems.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.label || 'Admin'}
          </h1>
          <span className="text-xs text-gray-400 hidden sm:block">{user.full_name}</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
