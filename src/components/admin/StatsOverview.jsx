import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatCurrency, formatCurrencyCompact } from '../../lib/api/admin/analytics'

export default function StatsOverview({ paymentMethods, requestsDistribution, additionalStats }) {
    if (!paymentMethods && !requestsDistribution && !additionalStats) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-64 bg-gray-100 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Préparation des données pour le graphique en camembert
    const formatPaymentMethodsData = () => {
        if (!paymentMethods) return []

        return Object.entries(paymentMethods).map(([method, data]) => ({
            name: formatMethodName(method),
            value: data.count,
            amount: data.amount,
            percentage: data.percentage
        }))
    }

    const formatMethodName = (method) => {
        const names = {
            'card': 'Cartes/Mobile',
            'bank_transfer': 'Virement',
            'cash': 'Espèces',
            'wave': 'Wave',
            'momo': 'Mobile Money',
            'orange_money': 'Orange Money'
        }
        return names[method] || method
    }

    // Couleurs pour le graphique
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280']

    const paymentData = formatPaymentMethodsData()

    // Tooltip personnalisé pour le graphique
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{data.name}</p>
                    <p className="text-sm text-gray-600">
                        {data.value} paiement{data.value > 1 ? 's' : ''} ({data.percentage}%)
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(data.amount)}
                    </p>
                </div>
            )
        }
        return null
    }

    // Préparation des données de répartition des demandes
    const formatRequestsData = () => {
        if (!requestsDistribution) return []

        const statusNames = {
            'pending': 'En attente',
            'in_progress': 'En traitement',
            'completed': 'Terminées',
            'cancelled': 'Annulées'
        }

        return Object.entries(requestsDistribution).map(([status, data]) => ({
            status: statusNames[status] || status,
            count: data.count,
            percentage: data.percentage
        }))
    }

    const requestsData = formatRequestsData()

    return (
        <div className="space-y-6">
            {/* Métriques rapides */}
            {additionalStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Montant moyen facture</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">
                                    {formatCurrencyCompact(additionalStats.average_invoice_amount)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Taux de completion</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">
                                    {additionalStats.completion_rate}%
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Temps de réponse</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">
                                    {additionalStats.response_time_hours}h
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique des méthodes de paiement */}
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900">Méthodes de paiement</h3>
                        <p className="text-sm text-gray-500 mt-1">Répartition des paiements reçus</p>
                    </div>
                    <div className="p-6">
                        {paymentData.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ percentage }) => `${percentage}%`}
                                        >
                                            {paymentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            formatter={(value) => (
                                                <span className="text-sm text-gray-600">{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    <p className="text-sm">Aucun paiement enregistré</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top clients et répartition des demandes */}
                <div className="space-y-6">
                    {/* Top clients */}
                    {additionalStats?.top_clients && (
                        <div className="bg-white rounded-xl border border-gray-200">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-medium text-gray-900">Top clients</h3>
                                <p className="text-sm text-gray-500 mt-1">Clients les plus actifs</p>
                            </div>
                            <div className="p-6">
                                {additionalStats.top_clients.length > 0 ? (
                                    <div className="space-y-4">
                                        {additionalStats.top_clients.map((client, index) => (
                                            <div key={index} className="flex items-center justify-between py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                            index === 1 ? 'bg-gray-100 text-gray-800' :
                                                                'bg-orange-100 text-orange-800'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{client.name}</p>
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-gray-900">
                                                    {formatCurrencyCompact(client.total_amount)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">Aucun client enregistré</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Répartition des demandes */}
                    {requestsData.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-medium text-gray-900">Statut des demandes</h3>
                                <p className="text-sm text-gray-500 mt-1">Répartition par statut</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {requestsData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${item.status === 'En attente' ? 'bg-amber-500' :
                                                        item.status === 'En traitement' ? 'bg-blue-500' :
                                                            item.status === 'Terminées' ? 'bg-emerald-500' :
                                                                'bg-red-500'
                                                    }`}></div>
                                                <span className="text-sm text-gray-700">{item.status}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {item.count}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({item.percentage}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}