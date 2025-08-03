'use client'

import { useState } from 'react'
import Link from 'next/link'
import InvoicesTable from '../../../components/admin/InvoicesTable'

export default function InvoicesPage() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        setRefreshKey(prev => prev + 1)
        setTimeout(() => {
            setIsRefreshing(false)
        }, 1000)
    }

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Factures</h1>
                <p className="mt-1 text-sm text-gray-500">Gérez les factures clients et leurs paiements</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <nav className="flex text-sm text-gray-500">
                    <span>Administration</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">Factures</span>
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
                        href="/dashboard/requests"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Voir les demandes
                    </Link>
                </div>
            </div>

            {/* Tableau des factures */}
            <InvoicesTable refreshTrigger={refreshKey} />

            {/* Guide */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Guide des factures</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Navigation</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Filtrez par statut ou montant</li>
                                <li>• Recherchez par client</li>
                                <li>• Cliquez "Voir" pour les détails</li>
                                <li>• Téléchargez le PDF</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Statuts</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-gray-700 mb-1">Factures</p>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                            <span className="text-gray-600">En attente</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-gray-600">Payée</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <span className="text-gray-600">Annulée</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}