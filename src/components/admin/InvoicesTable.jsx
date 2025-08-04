import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, RefreshCw, Filter, Search, FileText, Download } from 'lucide-react'
import {
    getAllInvoices,
    formatInvoiceStatus,
    formatPaymentStatus,
    getInvoiceStatusBadgeClasses,
    getPaymentStatusBadgeClasses,
    formatCurrency,
    getInvoiceStatusOptions,
    getPaymentStatusOptions,
    formatDate
} from '../../lib/api/admin/invoices'


export default function InvoicesTable({ refreshTrigger = 0 }) {
    const [invoices, setInvoices] = useState([])
    const [pagination, setPagination] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Filtres
    const [filters, setFilters] = useState({
        status: '',
        payment_status: '',
        whatsapp_number: '',
        min_amount: '',
        max_amount: '',
        page: 1,
        limit: 10,
        sort_by: 'created_at',
        sort_order: 'DESC'
    })

    // Options pour les filtres
    const invoiceStatusOptions = getInvoiceStatusOptions()
    const paymentStatusOptions = getPaymentStatusOptions()

    // Chargement des données
    const loadInvoices = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setIsRefreshing(true)
            } else {
                setIsLoading(true)
            }
            setError(null)

            // Nettoyer les filtres vides
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== '')
            )

            const result = await getAllInvoices(cleanFilters)

            if (result.success) {
                setInvoices(result.data.invoices || [])
                setPagination(result.data.pagination)
            } else {
                if (result.needsLogin) {
                    return
                }
                setError(result.message)
            }
        } catch (err) {
            console.error('Erreur lors du chargement des factures:', err)
            setError('Erreur lors du chargement des données')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        loadInvoices()
    }, [filters, refreshTrigger])

    // Gestion des filtres
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1
        }))
    }

    // Recherche avec debounce
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

    // Actualisation
    const handleRefresh = () => {
        loadInvoices(true)
    }

    // Reset filtres
    const handleResetFilters = () => {
        setFilters({
            status: '',
            payment_status: '',
            whatsapp_number: '',
            min_amount: '',
            max_amount: '',
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
                    <h2 className="text-lg font-medium text-gray-900">Toutes les factures</h2>
                    <p className="text-sm text-gray-500 mt-1">Liste complète des factures clients</p>
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
                    <h2 className="text-lg font-medium text-gray-900">Toutes les factures</h2>
                    <p className="text-sm text-gray-500 mt-1">Liste complète des factures clients</p>
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
                        <h2 className="text-lg font-medium text-gray-900">Toutes les factures</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {pagination?.total_items ? `${pagination.total_items} facture(s) trouvée(s)` : 'Liste complète des factures clients'}
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
                <div className="mt-4 space-y-3">
                    {/* Ligne 1: Recherche client */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom client ou numéro WhatsApp..."
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                        />
                    </div>

                    {/* Ligne 2: Filtres status et montants */}
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Statut facture */}
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 flex-1"
                        >
                            {invoiceStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {/* Statut paiement */}
                        <select
                            value={filters.payment_status}
                            onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 flex-1"
                        >
                            {paymentStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {/* Montant minimum */}
                        <input
                            type="number"
                            placeholder="Montant min"
                            value={filters.min_amount}
                            onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 flex-1"
                        />

                        {/* Montant maximum */}
                        <input
                            type="number"
                            placeholder="Montant max"
                            value={filters.max_amount}
                            onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 flex-1"
                        />

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
            </div>

            <div className="p-6">
                {invoices.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">
                            {Object.values(filters).some(v => v && v !== 1 && v !== 10 && v !== 'created_at' && v !== 'DESC')
                                ? 'Aucune facture trouvée avec ces filtres'
                                : 'Aucune facture enregistrée'
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
                                            ID Facture
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Montant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut facture
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Paiement
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Créée le
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-mono text-gray-900">
                                                    #{invoice.id.substring(0, 8)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {invoice.client.full_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {invoice.client.whatsapp_number}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(invoice.total_amount)}
                                                    </div>
                                                    {invoice.payment_status !== 'paid' && (
                                                        <div className="text-xs text-gray-500">
                                                            Payé: {formatCurrency(invoice.amount_paid || 0)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getInvoiceStatusBadgeClasses(invoice.status)}`}>
                                                    {formatInvoiceStatus(invoice.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusBadgeClasses(invoice.payment_status)}`}>
                                                    {formatPaymentStatus(invoice.payment_status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(invoice.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/dashboard/invoices/${invoice.id}`}
                                                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                                                        title="Voir les détails"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span>Voir</span>
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