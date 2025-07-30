'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const [userName, setUserName] = useState('Admin')
    const [userRole, setUserRole] = useState('')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        const role = localStorage.getItem('userRole')

        if (!token) {
            // router.push('/login')
        } else {
            setUserRole(role || 'admin')
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userRole')
        router.push('/login')
    }

    const isLinkActive = (href) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard' || pathname === '/dashboard/'
        }
        return pathname === href || pathname.startsWith(`${href}/`)
    }

    const getLinkClasses = (href) => {
        return `flex items-center px-4 py-3 text-sm transition-colors ${isLinkActive(href)
                ? 'bg-gray-900 text-white rounded-lg'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg'
            }`
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - version desktop */}
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-10">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="px-6 py-8 border-b border-gray-100">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                <div className="w-4 h-4 bg-white rounded-sm"></div>
                            </div>
                            <span className="ml-3 text-xl font-semibold text-gray-900">Dashboard</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        <Link href="/dashboard" className={getLinkClasses('/dashboard')}>
                            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                            Tableau de bord
                        </Link>
                        <Link href="/dashboard/requests" className={getLinkClasses('/dashboard/requests')}>
                            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Demandes
                        </Link>
                        <Link href="/dashboard/invoices" className={getLinkClasses('/dashboard/invoices')}>
                            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Factures
                        </Link>
                        <Link href="/dashboard/payments" className={getLinkClasses('/dashboard/payments')}>
                            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Paiements
                        </Link>
                        <Link href="/dashboard/clients" className={getLinkClasses('/dashboard/clients')}>
                            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Clients
                        </Link>
                        {userRole === 'superadmin' && (
                            <Link href="/dashboard/admins" className={getLinkClasses('/dashboard/admins')}>
                                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m-9 9.197a4 4 0 105.196-5.197m0 0A7.5 7.5 0 1013.5 11c-2.998 0-5.74-1.1-7.843-2.903m15.686 8.9A9.001 9.001 0 1021 7.5c0 .205-.01.408-.028.61m0 0A8.99 8.99 0 0121 10.5M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.703.609 5.18 1.64" />
                                </svg>
                                Administrateurs
                            </Link>
                        )}
                    </nav>

                    {/* Profil */}
                    <div className="px-4 py-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-medium">
                                    {userName?.charAt(0)}
                                </div>
                                <div className="ml-3 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                                    <p className="text-xs text-gray-500">{userRole === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Header mobile */}
            <header className="lg:hidden fixed top-0 inset-x-0 z-20 bg-white border-b border-gray-200">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="mr-3 text-gray-600 hover:text-gray-900"
                            onClick={toggleMobileMenu}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex items-center">
                            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center mr-2">
                                <div className="w-3 h-3 bg-white rounded-sm"></div>
                            </div>
                            <span className="text-lg font-semibold text-gray-900">Dashboard</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Menu mobile */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-gray-900 bg-opacity-50" onClick={toggleMobileMenu}>
                    <div
                        className="bg-white h-full w-64 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center mr-2">
                                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">Dashboard</span>
                                </div>
                                <button
                                    type="button"
                                    className="text-gray-400 hover:text-gray-600"
                                    onClick={toggleMobileMenu}
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <nav className="px-4 py-4 space-y-2">
                            <Link href="/dashboard" className={getLinkClasses('/dashboard')} onClick={toggleMobileMenu}>
                                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                </svg>
                                Tableau de bord
                            </Link>
                            <Link href="/dashboard/requests" className={getLinkClasses('/dashboard/requests')} onClick={toggleMobileMenu}>
                                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Demandes
                            </Link>
                            <Link href="/dashboard/invoices" className={getLinkClasses('/dashboard/invoices')} onClick={toggleMobileMenu}>
                                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Factures
                            </Link>
                            <Link href="/dashboard/payments" className={getLinkClasses('/dashboard/payments')} onClick={toggleMobileMenu}>
                                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Paiements
                            </Link>
                            <Link href="/dashboard/clients" className={getLinkClasses('/dashboard/clients')} onClick={toggleMobileMenu}>
                                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Clients
                            </Link>
                            {userRole === 'superadmin' && (
                                <Link href="/dashboard/admins" className={getLinkClasses('/dashboard/admins')} onClick={toggleMobileMenu}>
                                    <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m-9 9.197a4 4 0 105.196-5.197m0 0A7.5 7.5 0 1013.5 11c-2.998 0-5.74-1.1-7.843-2.903m15.686 8.9A9.001 9.001 0 1021 7.5c0 .205-.01.408-.028.61m0 0A8.99 8.99 0 0121 10.5M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.703.609 5.18 1.64" />
                                    </svg>
                                    Administrateurs
                                </Link>
                            )}
                        </nav>
                        <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-100">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-medium">
                                    {userName?.charAt(0)}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                                    <p className="text-xs text-gray-500">{userRole === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenu principal */}
            <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}