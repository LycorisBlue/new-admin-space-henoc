import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, RefreshCw, Filter, Search, CreditCard } from 'lucide-react'
import {
    getAllPayments,
    formatPaymentMethod,
    getPaymentMethodBadgeClasses,
    formatCurrency,
    getPaymentMethodOptions,
    formatDate
} from '../../lib/api/admin/payments'

export default function PaymentsTable({ refreshTrigger = 0 }) {
    const [payments, setPayments] = useState([])
    const [pagination, setPagination] = useState(null)
    const [stats, setStats] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const [filters, setFilters] = useState({
        method: '',
        whatsapp_number: '',
        min_amount: '',
        max_amount: '',
        page: 1,
        limit: 10,
        sort_by: 'payment_date',
        sort_order: 'DESC'
    })

    const methodOptions = getPaymentMethodOptions()

    const loadPayments = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setIsRefreshing(true)
            } else {
                setIsLoading(true)
            }
            setError(null)

            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== '')
            )

            const result = await getAllPayments(cleanFilters)

            if (result.success) {
                setPayments(result.data.payments || [])
                setPagination(result.data.pagination)
                setStats(result.data.stats)
            } else {
                if (result.needsLogin) return
                setError(result.message)
            }
        } catch (err) {
            setError('Erreur lors du chargement des données')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        loadPayments()
    }, [filters, refreshTrigger])

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1
        }))
    }

    const [searchTimeout, setSearchTimeout] = useState(null)
    const handleSearchChange = (value) => {
        if (searchTimeout) clearTimeout(searchTimeout)
        const timeout = setTimeout(() => {
            handleFilterChange('whatsapp_number', value)
        }, 500)
        setSearchTimeout(timeout)
    }

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }))
    }

    const handleRefresh = () => loadPayments(true)

    const handleResetFilters = () => {
        setFilters({
            method: '',
            whatsapp_number: '',
            min_amount: '',
            max_amount: '',
            page: 1,
            limit: 10,
            sort_by: 'payment_date',
            sort_order: 'DESC'
        })
    }

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Tous les paiements</h2>
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
                <div className="p-6 text-center">
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
        <div className="space-y-6">
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
                                        className={`px-3 py-1 text-sm font-medium ${index === 0 ? 'rounded-l-lg' : index === 3 ? 'rounded-r-lg' : ''
                                            } bg-white text-gray-700 hover:bg-gray-50`}
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
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Montant total</p>
                            <p className="text-3xl font-bold text-gray-900">127 500 F CFA</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Nombre de paiements</p>
                            <p className="text-3xl font-bold text-gray-900">23</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Méthode populaire</p>
                            <p className="text-xl font-bold text-gray-900">Wave</p>
                            <p className="text-sm text-gray-500">12 paiements</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">Tous les paiements</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {pagination?.total_items ? `${pagination.total_items} paiement(s)` : 'Liste des paiements'}
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                        </button>
                    </div>

                    {/* Filtres */}
                    <div className="mt-4 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher par client..."
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                            <select
                                value={filters.method}
                                onChange={(e) => handleFilterChange('method', e.target.value)}
                                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 flex-1"
                            >
                                {methodOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                placeholder="Montant min"
                                value={filters.min_amount}
                                onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 flex-1"
                            />

                            <input
                                type="number"
                                placeholder="Montant max"
                                value={filters.max_amount}
                                onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 flex-1"
                            />

                            <button
                                onClick={handleResetFilters}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0"
                            >
                                <Filter className="w-4 h-4" />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {payments.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 p-4 text-gray-400" />
                            <p className="text-gray-500">Aucun paiement trouvé</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Client
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Montant
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Méthode
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Date paiement
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Confirmé par
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {payment.client.full_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {payment.client.whatsapp_number}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(payment.amount_paid)}
                                                    </div>
                                                    {payment.reference && (
                                                        <div className="text-xs text-gray-500">
                                                            Réf: {payment.reference}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodBadgeClasses(payment.method)}`}>
                                                        {formatPaymentMethod(payment.method)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(payment.payment_date)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {payment.confirmed_by.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/dashboard/invoices/${payment.invoice.id}`}
                                                            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                                                            title="Voir la facture"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            <span>Facture</span>
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
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                            disabled={!pagination.has_previous_page}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Précédent
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                            disabled={!pagination.has_next_page}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
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
        </div>
    )
}