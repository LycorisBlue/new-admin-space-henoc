'use client'

import { useState } from 'react'
import Link from 'next/link'
import PaymentsTable from '../../../components/admin/PaymentsTable'

export default function PaymentsPage() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        setRefreshKey(prev => prev + 1)
        setTimeout(() => setIsRefreshing(false), 1000)
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Paiements</h1>
                <p className="mt-1 text-sm text-gray-500">Consultez l'historique des paiements et leurs statistiques</p>
            </div>

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

            <PaymentsTable refreshTrigger={refreshKey} />
        </div>
    )
}