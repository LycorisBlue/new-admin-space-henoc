'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

export default function PaymentsPage() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [stats, setStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(true)
    const [statsError, setStatsError] = useState(null)
    const [statsPeriod, setStatsPeriod] = useState('month')

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount)
    }

    const loadStats = useCallback(async () => {
        try {
            setStatsLoading(true)
            setStatsError(null)

            // Simulation
            setTimeout(() => {
                setStats({
                    totalAmount: 15750.00,
                    totalCount: 23,
                    methodBreakdown: {
                        'wave': { count: 12, total: 8500 },
                        'mobile_money': { count: 8, total: 5250 },
                        'cash': { count: 3, total: 2000 }
                    }
                })
                setStatsLoading(false)
            }, 1000)
        } catch (error) {
            setStatsError('Impossible de charger les statistiques.')
            setStatsLoading(false)
        }
    }, [statsPeriod])

    useEffect(() => {
        loadStats()
    }, [loadStats])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await loadStats()
        setTimeout(() => {
            setIsRefreshing(false)
            window.location.reload()
        }, 1000)
    }

    const handlePeriodChange = (period) => {
        setStatsPeriod(period)
    }

    const formatPaymentMethod = (method) => {
        const methods = {
            'wave': 'Wave',
            'mobile_money': 'Mobile Money',
            'orange_money': 'Orange Money',
            'zeepay': 'Zeepay',
            'cash': 'Espèces'
        }
        return methods[method] || method
    }

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Paiements</h1>
                <p className="mt-1 text-sm text-gray-500">Consultez l'historique des paiements et leurs statistiques</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <nav className="flex text-sm text-gray-500">
                    <span>Administration</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">Paiements</span>
                </nav>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                    </button>
                    <Link
                        href="/dashboard/invoices"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Voir les factures
                    </Link>
                </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <h2 className="text-lg font-medium text-gray-900">Statistiques des paiements</h2>
                        <div className="mt-2 md:mt-0 flex items-center gap-2">
                            <span className="text-sm text-gray-500">Période:</span>
                            <div className="inline-flex rounded-lg border border-gray-300">
                                {['day', 'week', 'month', 'year'].map((period, index) => (
                                    <button
                                        key={period}
                                        onClick={() => handlePeriodChange(period)}
                                        className={`px-3 py-1 text-sm font-medium ${index === 0 ? 'rounded-l-lg' : index === 3 ? 'rounded-r-lg' : ''
                                            } ${statsPeriod === period
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {period === 'day' ? 'Jour' : period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Montant total */}
                        <div className="text-center">
                            {statsLoading ? (
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                </div>
                            ) : statsError ? (
                                <div className="text-sm text-red-600">{statsError}</div>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-500 mb-1">Montant total</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {formatCurrency(stats?.totalAmount || 0)}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Nombre de paiements */}
                        <div className="text-center">
                            {statsLoading ? (
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
                                </div>
                            ) : statsError ? (
                                <div className="text-sm text-red-600">{statsError}</div>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-500 mb-1">Nombre de paiements</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {stats?.totalCount || 0}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Méthode la plus utilisée */}
                        <div className="text-center">
                            {statsLoading ? (
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                </div>
                            ) : statsError ? (
                                <div className="text-sm text-red-600">{statsError}</div>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-500 mb-1">Méthode populaire</p>
                                    {stats && Object.keys(stats.methodBreakdown).length > 0 ? (
                                        (() => {
                                            const topMethod = Object.entries(stats.methodBreakdown)
                                                .sort((a, b) => b[1].count - a[1].count)[0]
                                            return (
                                                <>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        {formatPaymentMethod(topMethod[0])}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {topMethod[1].count} paiements
                                                    </p>
                                                </>
                                            )
                                        })()
                                    ) : (
                                        <p className="text-sm text-gray-500">Aucune donnée</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tableau des paiements */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Historique des paiements</h2>
                    <p className="text-sm text-gray-500 mt-1">Liste complète de tous les paiements enregistrés</p>
                </div>
                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500">Tableau PaymentsTable à implémenter</p>
                    </div>
                </div>
            </div>

            {/* Guide */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Guide des paiements</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Navigation</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Statistiques par période sélectionnée</li>
                                <li>• Filtrage par méthode ou période</li>
                                <li>• Accès aux détails de facture</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Méthodes de paiement</h3>
                            <div className="space-y-2 text-sm">
                                {[
                                    { method: 'Wave', color: 'bg-blue-500' },
                                    { method: 'Mobile Money', color: 'bg-yellow-500' },
                                    { method: 'Orange Money', color: 'bg-orange-500' },
                                    { method: 'Zeepay', color: 'bg-indigo-500' },
                                    { method: 'Espèces', color: 'bg-gray-500' }
                                ].map(({ method, color }) => (
                                    <div key={method} className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${color}`}></div>
                                        <span className="text-gray-600">{method}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}