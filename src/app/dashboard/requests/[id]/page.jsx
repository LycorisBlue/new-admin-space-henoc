'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function RequestDetailsPage() {
    const params = useParams()
    const requestId = params.id
    const [refreshKey, setRefreshKey] = useState(0)

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1)
    }

    const handleStatusUpdate = () => {
        handleRefresh()
    }

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Détails de la demande</h1>
                <p className="mt-1 text-sm text-gray-500">Consultez et gérez cette demande client</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <nav className="flex text-sm text-gray-500">
                    <Link href="/dashboard" className="hover:text-gray-700">Administration</Link>
                    <span className="mx-2">/</span>
                    <Link href="/dashboard/requests" className="hover:text-gray-700">Demandes</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">#{requestId?.substring(0, 8)}</span>
                </nav>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Actualiser
                    </button>
                    <Link
                        href="/dashboard/requests"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour
                    </Link>
                </div>
            </div>

            {/* Détails de la demande */}
            <div key={refreshKey} className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Informations de la demande</h2>
                </div>
                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-gray-500">Composant RequestDetails à implémenter</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {requestId}</p>
                    </div>
                </div>
            </div>

            {/* Guide d'actions */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Actions possibles</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Gestion</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Modifier le statut de la demande</li>
                                <li>• Assigner la demande</li>
                                <li>• Consulter les détails client</li>
                                <li>• Suivre l'historique</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Cycle de traitement</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div>1. En attente → En traitement</div>
                                <div>2. En traitement → Facturé</div>
                                <div>3. Facturé → Payé</div>
                                <div>4. Payé → Commandé</div>
                                <div>5. Commandé → Livré</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}