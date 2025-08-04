'use client'

import { useState, useEffect } from 'react'
import { Eye, Plus, RefreshCw, Filter, Search, Users, TrendingUp, UserPlus } from 'lucide-react'
import Link from 'next/link'
import {
    getClientAnalytics,
    formatClientStatus,
    formatLastOrderStatus,
    getClientStatusBadgeClasses,
    getOrderStatusBadgeClasses,
    formatCurrency,
    getClientStatusOptions,
    formatDate,
    calculateAverageOrder,
    calculateActiveClientRate
} from '../../../lib/api/admin/client-analytics'
import { InlineLoading } from '../../../components/ui/Loading'
import ClientRegistrationModal from '../../../components/admin/ClientRegistrationModal'

export default function ClientsPage() {
    const [analytics, setAnalytics] = useState(null)
    const [clients, setClients] = useState([])
    const [pagination, setPagination] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState(null)

    // États du modal d'enregistrement
    const [showRegistrationModal, setShowRegistrationModal] = useState(false)
    const [selectedClientWhatsApp, setSelectedClientWhatsApp] = useState('')

    // Filtres
    const [filters, setFilters] = useState({
        status: 'all',
        page: 1,
        limit: 10,
        sort_by: 'created_at',
        sort_order: 'DESC'
    })

    const [searchTerm, setSearchTerm] = useState('')
    const statusOptions = getClientStatusOptions()

    // Chargement des données
    const loadClientAnalytics = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setIsRefreshing(true)
            } else {
                setIsLoading(true)
            }
            setError(null)

            const result = await getClientAnalytics(filters)

            if (result.success) {
                setAnalytics(result.data.overview)
                setClients(result.data.clients || [])
                setPagination(result.data.pagination)
            } else {
                if (result.needsLogin) {
                    return
                }
                setError(result.message)
            }
        } catch (err) {
            console.error('Erreur lors du chargement des analytics clients:', err)
            setError('Erreur lors du chargement des données')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        loadClientAnalytics()
    }, [filters])

    // Gestion des filtres
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1
        }))
    }

    // Gestion de la recherche (simulation côté client pour maintenir la compatibilité)
    const filteredClients = clients.filter(client => {
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        return (
            client.name.toLowerCase().includes(searchLower) ||
            client.contact.toLowerCase().includes(searchLower) ||
            (client.email && client.email.toLowerCase().includes(searchLower))
        )
    })

    // Pagination
    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }))
    }

    const handleRefresh = () => {
        loadClientAnalytics(true)
    }

    // Gestion du modal d'enregistrement
    const handleOpenRegistrationModal = (whatsappNumber) => {
        setSelectedClientWhatsApp(whatsappNumber)
        setShowRegistrationModal(true)
    }

    const handleCloseRegistrationModal = () => {
        setShowRegistrationModal(false)
        setSelectedClientWhatsApp('')
    }

    const handleRegistrationSuccess = (updatedClient, isNewClient) => {
        // Rafraîchir les données après enregistrement
        loadClientAnalytics(true)

        // Optionnel: mettre à jour localement le client dans la liste
        if (!isNewClient) {
            setClients(prevClients =>
                prevClients.map(client =>
                    client.contact === updatedClient.whatsapp_number
                        ? {
                            ...client,
                            name: updatedClient.full_name || client.name,
                            email: updatedClient.email,
                            client_status: 'registered'
                        }
                        : client
                )
            )
        }
    }

    // Détermine si un client peut être enregistré (non enregistré)
    const canRegisterClient = (client) => {
        return client.client_status === 'unregistered'
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
                    <p className="mt-1 text-sm text-gray-500">Gérez vos clients et consultez leurs analytics</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <InlineLoading text="Chargement des analytics clients..." />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
                    <p className="mt-1 text-sm text-gray-500">Gérez vos clients et consultez leurs analytics</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
                <p className="mt-1 text-sm text-gray-500">Gérez vos clients et consultez leurs analytics</p>
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
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                    </button>
                    <button
                        onClick={() => handleOpenRegistrationModal('')}
                        className="inline-flex items-center cursor-pointer gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg"
                    >
                        <UserPlus className="w-4 h-4" />
                        Enregistrer un client
                    </button>
                </div>
            </div>

            {/* Analytics globales */}
            {analytics && (
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-medium text-gray-900">Analytics clients</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">Total clients</p>
                                <p className="text-3xl font-bold text-gray-900">{analytics.total_clients}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">Nouveaux ce mois</p>
                                <p className="text-3xl font-bold text-gray-900">{analytics.new_clients_this_month}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {analytics.total_clients > 0 && (
                                        `${Math.round((analytics.new_clients_this_month / analytics.total_clients) * 100)}% du total`
                                    )}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">Clients actifs</p>
                                <p className="text-3xl font-bold text-gray-900">{analytics.active_clients}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {calculateActiveClientRate(analytics.active_clients, analytics.total_clients)}% du total
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">Commandes totales</p>
                                <p className="text-3xl font-bold text-gray-900">{analytics.total_orders}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {analytics.active_clients > 0 && (
                                        `${Math.round(analytics.total_orders / analytics.active_clients)} par client actif`
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Liste des clients */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">Liste des clients</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {pagination?.total_items ? `${pagination.total_items} client(s)` : 'Clients avec métriques détaillées'}
                            </p>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="mt-4 flex flex-col md:flex-row gap-3">
                        {/* Recherche */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, numéro ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                            />
                        </div>

                        {/* Filtre statut */}
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {/* Tri */}
                        <select
                            value={filters.sort_by}
                            onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            <option value="created_at">Date d'inscription</option>
                            <option value="full_name">Nom</option>
                            <option value="whatsapp_number">Numéro WhatsApp</option>
                        </select>
                    </div>
                </div>

                <div className="p-6">
                    {filteredClients.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500">
                                {searchTerm ? 'Aucun client trouvé avec ces critères' : 'Aucun client enregistré'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Client
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Commandes
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total dépensé
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dernière commande
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredClients.map((client) => (
                                            <tr key={client.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {client.name}
                                                        </div>
                                                        {client.email && (
                                                            <div className="text-sm text-gray-500">
                                                                {client.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{client.contact}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getClientStatusBadgeClasses(client.client_status)}`}>
                                                        {formatClientStatus(client.client_status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{client.orders_count}</div>
                                                    {client.orders_count > 0 && (
                                                        <div className="text-xs text-gray-500">
                                                            Panier moyen: {formatCurrency(calculateAverageOrder(client.total_spent, client.orders_count))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(client.total_spent)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {client.last_order_date ? (
                                                        <div>
                                                            <div className="text-sm text-gray-900">
                                                                {formatDate(client.last_order_date, false)}
                                                            </div>
                                                            {client.last_order_status && (
                                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusBadgeClasses(client.last_order_status)}`}>
                                                                    {formatLastOrderStatus(client.last_order_status)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">Aucune commande</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                                                            title="Voir les détails"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        {/* Bouton d'enregistrement pour clients non enregistrés */}
                                                        {canRegisterClient(client) && (
                                                            <button
                                                                onClick={() => handleOpenRegistrationModal(client.contact)}
                                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                                title="Enregistrer ce client"
                                                            >
                                                                <UserPlus className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        <Link
                                                            href={`/dashboard/requests/create?client=${client.id}`}
                                                            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                                                            title="Nouvelle demande"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.total_pages > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Page {pagination.current_page} sur {pagination.total_pages}
                                        {' '}({pagination.total_items} résultat{pagination.total_items > 1 ? 's' : ''})
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                            disabled={!pagination.has_prev_page}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Précédent
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                                                const page = i + 1
                                                const isActive = page === pagination.current_page

                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`px-2 py-1 text-sm rounded ${isActive
                                                            ? 'bg-gray-900 text-white'
                                                            : 'border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                            disabled={!pagination.has_next_page}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Guide */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Analytics clients</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Métriques disponibles</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Nombre total de commandes par client</li>
                                <li>• Montant total dépensé et panier moyen</li>
                                <li>• Statut de la dernière commande</li>
                                <li>• Date d'inscription et d'activité</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Actions disponibles</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">Voir les détails du client</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-blue-500" />
                                    <span className="text-gray-600">Enregistrer les informations (clients non enregistrés)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">Créer une nouvelle demande</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'enregistrement client */}
            <ClientRegistrationModal
                isOpen={showRegistrationModal}
                onClose={handleCloseRegistrationModal}
                initialWhatsApp={selectedClientWhatsApp}
                onSuccess={handleRegistrationSuccess}
            />
        </div>
    )
}