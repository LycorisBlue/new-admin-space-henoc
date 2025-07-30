'use client'

import { useState } from 'react'
import { Eye, Plus } from 'lucide-react'
import Link from 'next/link'

export default function ClientsPage() {
    const [isRefreshing, setIsRefreshing] = useState(false)

    const clients = [
        { id: '1', name: 'Marie Dubois', phone: '+33123456789', orders: 8, total: 2450, lastOrder: '2024-01-15', status: 'Actif' },
        { id: '2', name: 'Jean Martin', phone: '+33987654321', orders: 3, total: 890, lastOrder: '2024-01-10', status: 'Actif' },
        { id: '3', name: 'Sophie Bernard', phone: '+33456789123', orders: 12, total: 3200, lastOrder: '2024-01-12', status: 'Actif' },
        { id: '4', name: 'Paul Durand', phone: '+33321654987', orders: 1, total: 150, lastOrder: '2023-12-20', status: 'Inactif' },
        { id: '5', name: 'Claire Moreau', phone: '+33789123456', orders: 6, total: 1750, lastOrder: '2024-01-08', status: 'Actif' }
    ]

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        setTimeout(() => setIsRefreshing(false), 1000)
    }

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
                <p className="mt-1 text-sm text-gray-500">Gérez vos clients et consultez leur historique</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <nav className="flex text-sm text-gray-500">
                    <span>Administration</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">Clients</span>
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

            {/* Statistiques */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Aperçu des clients</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Total clients</p>
                            <p className="text-3xl font-bold text-gray-900">234</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Nouveaux ce mois</p>
                            <p className="text-3xl font-bold text-gray-900">12</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Clients actifs</p>
                            <p className="text-3xl font-bold text-gray-900">189</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Commandes totales</p>
                            <p className="text-3xl font-bold text-gray-900">1,247</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des clients */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Liste des clients</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commandes</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total dépensé</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière commande</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{client.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">{client.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{client.orders}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{formatCurrency(client.total)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">
                                            {new Date(client.lastOrder).toLocaleDateString('fr-FR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${client.status === 'Actif'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            <button className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900">
                                                <Eye className="w-6 h-6" />
                                            </button>
                                            <Link
                                                href={`/dashboard/requests/create?client=${client.id}`}
                                                className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                                            >
                                                <Plus className="w-6 h-6" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Guide */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Gestion des clients</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Navigation</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Consultez l'historique des commandes</li>
                                <li>• Filtrez par statut d'activité</li>
                                <li>• Accédez aux détails client</li>
                                <li>• Créez une nouvelle demande</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Informations client</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Nom complet et contact</li>
                                <li>• Historique des achats</li>
                                <li>• Montant total dépensé</li>
                                <li>• Date de dernière commande</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}