'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ClipboardList, FileText, CreditCard, Users, UserCog } from 'lucide-react'
import toast from 'react-hot-toast'
import { getMe } from '../../lib/api/auth/me'
import { logout } from '../../lib/api/auth/logout'
import Toast from '../../components/ui/Toast'

export default function DashboardLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const [adminInfo, setAdminInfo] = useState(null)
    const [isLoadingAdmin, setIsLoadingAdmin] = useState(true)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Charger les informations admin
    useEffect(() => {
        const loadAdminInfo = async () => {
            try {
                // Vérifier d'abord le cache localStorage
                const cachedAdminInfo = localStorage.getItem('adminInfo')
                if (cachedAdminInfo) {
                    const parsed = JSON.parse(cachedAdminInfo)
                    setAdminInfo(parsed)
                    setIsLoadingAdmin(false)
                    return
                }

                // Si pas en cache, faire la requête API
                const result = await getMe()

                if (result.success) {
                    const adminData = result.data.admin
                    setAdminInfo(adminData)

                    // Mettre en cache (expire après 1 heure)
                    const cacheData = {
                        ...adminData,
                        cachedAt: Date.now(),
                        expiresIn: 60 * 60 * 1000 // 1 heure
                    }
                    localStorage.setItem('adminInfo', JSON.stringify(cacheData))
                } else {
                    if (result.needsLogin) {
                        router.push('/login')
                        return
                    }
                    toast.error(result.message)
                }
            } catch (error) {
                console.error('Erreur lors du chargement des infos admin:', error)
                toast.error('Erreur lors du chargement du profil')
            } finally {
                setIsLoadingAdmin(false)
            }
        }

        loadAdminInfo()
    }, [router])

    // Vérifier l'expiration du cache périodiquement
    useEffect(() => {
        const checkCacheExpiration = () => {
            const cachedAdminInfo = localStorage.getItem('adminInfo')
            if (cachedAdminInfo) {
                const parsed = JSON.parse(cachedAdminInfo)
                const now = Date.now()
                const isExpired = parsed.cachedAt && (now - parsed.cachedAt > parsed.expiresIn)

                if (isExpired) {
                    localStorage.removeItem('adminInfo')
                    // Recharger les infos depuis l'API
                    window.location.reload()
                }
            }
        }

        const interval = setInterval(checkCacheExpiration, 5 * 60 * 1000) // Vérifier toutes les 5 minutes
        return () => clearInterval(interval)
    }, [])

    const handleLogout = async () => {
        setIsLoggingOut(true)

        try {
            const result = await logout()

            if (result.success) {
                // Nettoyer le cache admin
                localStorage.removeItem('adminInfo')

                if (result.warning) {
                    toast.success(result.message, { icon: '⚠️' })
                } else {
                    toast.success(result.message)
                }

                // Redirection vers login
                setTimeout(() => {
                    router.push('/login')
                }, 1000)
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error)
            toast.error('Erreur lors de la déconnexion')
        } finally {
            setIsLoggingOut(false)
        }
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

    const formatRole = (role) => {
        return role === 'superadmin' ? 'Super Admin' : 'Admin'
    }

    const getInitials = (name) => {
        if (!name) return 'A'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <>
            <Toast />

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
                                <LayoutDashboard className="h-5 w-5 mr-3" />
                                Tableau de bord
                            </Link>
                            <Link href="/dashboard/requests" className={getLinkClasses('/dashboard/requests')}>
                                <ClipboardList className="h-5 w-5 mr-3" />
                                Demandes
                            </Link>
                            <Link href="/dashboard/invoices" className={getLinkClasses('/dashboard/invoices')}>
                                <FileText className="h-5 w-5 mr-3" />
                                Factures
                            </Link>
                            <Link href="/dashboard/payments" className={getLinkClasses('/dashboard/payments')}>
                                <CreditCard className="h-5 w-5 mr-3" />
                                Paiements
                            </Link>
                            <Link href="/dashboard/clients" className={getLinkClasses('/dashboard/clients')}>
                                <Users className="h-5 w-5 mr-3" />
                                Clients
                            </Link>
                            {adminInfo?.role === 'superadmin' && (
                                <Link href="/dashboard/admins" className={getLinkClasses('/dashboard/admins')}>
                                    <UserCog className="h-5 w-5 mr-3" />
                                    Administrateurs
                                </Link>
                            )}
                        </nav>

                        {/* Profil */}
                        <div className="px-4 py-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowProfileModal(true)}
                                className="w-full flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                                disabled={isLoadingAdmin}
                            >
                                <div className="flex items-center min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-medium">
                                        {isLoadingAdmin ? (
                                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            getInitials(adminInfo?.name)
                                        )}
                                    </div>
                                    <div className="ml-3 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {isLoadingAdmin ? 'Chargement...' : adminInfo?.name || 'Admin'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {isLoadingAdmin ? '' : formatRole(adminInfo?.role)}
                                        </p>
                                    </div>
                                </div>
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
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
                            onClick={() => setShowProfileModal(true)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-medium">
                                {isLoadingAdmin ? (
                                    <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    getInitials(adminInfo?.name)
                                )}
                            </div>
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
                                {/* Autres liens... */}
                            </nav>
                            <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        setShowProfileModal(true)
                                        toggleMobileMenu()
                                    }}
                                    className="w-full flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-medium">
                                        {getInitials(adminInfo?.name)}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{adminInfo?.name || 'Admin'}</p>
                                        <p className="text-xs text-gray-500">{formatRole(adminInfo?.role)}</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Profil */}
                {showProfileModal && (
                    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Profil Administrateur</h3>
                                    <button
                                        onClick={() => setShowProfileModal(false)}
                                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {adminInfo && (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-medium">
                                                {getInitials(adminInfo.name)}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-semibold text-gray-900">{adminInfo.name}</h4>
                                                <p className="text-sm text-gray-500">{formatRole(adminInfo.role)}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4 space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                                                <p className="text-sm text-gray-900 mt-1">{adminInfo.email}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">ID Administrateur</label>
                                                <p className="text-sm text-gray-900 mt-1 font-mono">{adminInfo.id}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4">
                                            <button
                                                onClick={handleLogout}
                                                disabled={isLoggingOut}
                                                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoggingOut ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        Déconnexion...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        Se déconnecter
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
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
        </>
    )
}