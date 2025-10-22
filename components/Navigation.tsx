'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Calendar, Home, PackageIcon, Boxes, Network, Settings } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/scheduler', label: 'Scheduler', icon: Calendar },
    { href: '/equipment', label: 'Equipment', icon: Boxes },
    { href: '/inventory', label: 'Inventory', icon: PackageIcon },
    { href: '/integrations', label: 'Integrations', icon: Network },
  ];

  return (
    <nav className="bg-white border-b border-teal-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold tracking-tight" style={{ color: '#0a0a0a' }}>
                Batch Scheduler
              </h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-teal-500 text-black'
                        : 'border-transparent text-slate-600 hover:border-teal-300 hover:text-black'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Settings Dropdown */}
          <div className="flex items-center relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </button>

            {showSettings && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)}></div>
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20">
                  <Link
                    href="/gxp"
                    onClick={() => setShowSettings(false)}
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    GxP Configuration
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
