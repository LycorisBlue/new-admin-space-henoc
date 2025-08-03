import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, RefreshCw, Filter, Search, Users } from 'lucide-react'
import {
    getAllRequests,
    formatRequestStatus,
    getStatusBadgeClasses,
    getAssignmentInfo,
    getStatusOptions,
    getAssignmentOptions
} from '../../lib/api/admin/requests'

export default function AllRequestsTable({ refreshTrigger = 0 }) {
    const [requests, setRequests] = useState([])
    const [pagination, setPagination] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Filtres
    const [filters, setFilters] = useState({
        status: '',
        unassigned: '',
        whatsapp_number: '',
        page: 1,
        limit: 10,
        sort_by: 'created_at',
        sort_order: 'DESC'
    })

    // Options pour les filtres
    const statusOptions = getStatusOptions()
    const assignmentOptions = getAssignmentOptions()

    // Chargement des données
    const loadRequests = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setIsRefreshing(true)
            } else {
                setIsLoading(true)
            }
            setError(null)

            const result = await getAllRequests(filters)

            if (result.success) {
                setRequests(result.data.requests || [])
                setPagination(result.data.pagination)
            } else {
                if (result.needsLogin) {
                    return
                }
                setError(result.message)
            }
        } catch (err) {
            console.error('Erreur lors du chargement des demandes:', err)
            setError('Erreur lors du chargement des données')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        loadRequests()
    }, [filters, refreshTrigger])

    // Gestion des filtres
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1
        }))
    }

    // Gestion de la recherche avec debounce
    const [searchTimeout, setSearchTimeout] = useState(null)

    const handleSearchChange = (value) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const timeout = setTimeout(() => {
            handleFilterChange('whatsapp_number', value)
        }, 500)

        setSearchTimeout(timeout)
    }

    // Pagination
    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }))
    }

    // Formatage date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Actualisation
    const handleRefresh = () => {
        loadRequests(true)
    }

    // Reset filtres
    const handleResetFilters = () => {
        setFilters({
            status: '',
            unassigned: '',
            whatsapp_number: '',
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'DESC'
        })
    }

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Toutes les demandes</h2>
                    <p className="text-sm text-gray-500 mt-1">Liste complète des demandes clients</p>
                </div>
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="h-10 bg-gray-200 rounded w-20"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Toutes les demandes</h2>
                    <p className="text-sm text-gray-500 mt-1">Liste complète des demandes clients</p>
                </div>
                <div className="p-6">
                    <div className="text-center py-8">
                        <div className="text-red-600 mb-4">{error}</div>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">Toutes les demandes</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {pagination?.total_items ? `${pagination.total_items} demande(s) trouvée(s)` : 'Liste complète des demandes clients'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                        </button>
                    </div>
                </div>

                {/* Filtres */}
                <div className="mt-4 flex flex-col md:flex-row gap-3">
                    {/* Recherche client - plus large */}
                    <div className="relative flex-1 md:flex-[2]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom client ou numéro WhatsApp..."
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                        />
                    </div>

                    {/* Filtre assignation */}
                    <select
                        value={filters.unassigned}
                        onChange={(e) => handleFilterChange('unassigned', e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 flex-1"
                    >
                        {assignmentOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Reset filtres */}
                    <button
                        onClick={handleResetFilters}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0"
                    >
                        <Filter className="w-4 h-4" />
                        Réinitialiser
                    </button>
                </div>
            </div>

            <div className="p-6">
                {requests.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">
                            {Object.values(filters).some(v => v && v !== 1 && v !== 10 && v !== 'created_at' && v !== 'DESC')
                                ? 'Aucune demande trouvée avec ces filtres'
                                : 'Aucune demande enregistrée'
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Tableau */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID Demande
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assignation
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Créée le
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mise à jour
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.map((request) => {
                                        const assignmentInfo = getAssignmentInfo(request.assigned_admin_id)

                                        return (
                                            <tr key={request.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-mono text-gray-900">
                                                        #{request.id.substring(0, 8)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {request.client.full_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {request.client.whatsapp_number}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClasses(request.status)}`}>
                                                        {formatRequestStatus(request.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${assignmentInfo.badgeClasses}`}>
                                                        {assignmentInfo.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(request.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(request.updated_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <Link
                                                        href={`/dashboard/requests/${request.id}`}
                                                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                                                        title="Voir les détails"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span>Voir</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
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
                                        disabled={!pagination.has_previous_page}
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
    )
}