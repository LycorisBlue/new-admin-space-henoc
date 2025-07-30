'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RequestsPage() {
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        setTimeout(() => {
            setIsRefreshing(false)
            window.location.reload()
        }, 1000)
    }

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Demandes clients</h1>
                <p className="mt-1 text-sm text-gray-500">Gérez toutes les demandes et leurs assignations</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <nav className="flex text-sm text-gray-500">
                    <span>Administration</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">Demandes</span>
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
                        href="/dashboard/requests/create"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nouvelle demande
                    </Link>
                </div>
            </div>

            {/* Demandes assignées */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Mes demandes assignées</h2>
                    <p className="text-sm text-gray-500 mt-1">Demandes qui vous sont attribuées</p>
                </div>
                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-gray-500">Tableau des demandes assignées à implémenter</p>
                    </div>
                </div>
            </div>

            {/* Toutes les demandes */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Toutes les demandes</h2>
                    <p className="text-sm text-gray-500 mt-1">Liste complète des demandes clients</p>
                </div>
                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-gray-500">Tableau des demandes à implémenter</p>
                    </div>
                </div>
            </div>

            {/* Guide */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Guide d'utilisation</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Navigation</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Filtrez par statut ou assignation</li>
                                <li>• Triez via les en-têtes de colonnes</li>
                                <li>• Cliquez "Voir" pour les détails</li>
                                <li>• Créez de nouvelles demandes</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Statuts</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <span className="text-gray-600"><span className="font-medium">En attente</span> - Nouvelle demande</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-gray-600"><span className="font-medium">En traitement</span> - Prise en charge</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-gray-600"><span className="font-medium">Facturé</span> - Facture créée</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <span className="text-gray-600"><span className="font-medium">Payé</span> - Facture payée</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <span className="text-gray-600"><span className="font-medium">Commandé</span> - Produits commandés</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}