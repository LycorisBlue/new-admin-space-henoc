import {
    formatCurrency,
    formatCurrencyCompact,
    formatPercentageChange,
    getTrendInfo
} from '../../lib/api/admin/analytics'

export default function MetricsCards({ metrics }) {
    if (!metrics) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const metricsConfig = [
        {
            key: 'total_requests',
            title: 'Total demandes',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            format: (value) => value.toLocaleString('fr-FR'),
            color: 'blue'
        },
        {
            key: 'total_invoices',
            title: 'Factures',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            format: (value) => value.toLocaleString('fr-FR'),
            color: 'emerald'
        },
        {
            key: 'total_revenue',
            title: 'Revenus',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            format: (value) => formatCurrencyCompact(value),
            color: 'amber'
        },
        {
            key: 'active_clients',
            title: 'Clients actifs',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            format: (value) => value.toLocaleString('fr-FR'),
            color: 'purple'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricsConfig.map((config) => {
                const metric = metrics[config.key]
                if (!metric) return null

                const trendInfo = getTrendInfo(metric.trend, metric.percentage_change)
                const colorClasses = {
                    blue: 'text-blue-600 bg-blue-50',
                    emerald: 'text-emerald-600 bg-emerald-50',
                    amber: 'text-amber-600 bg-amber-50',
                    purple: 'text-purple-600 bg-purple-50'
                }

                return (
                    <div key={config.key} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 mb-1">{config.title}</p>
                                <p className="text-3xl font-semibold text-gray-900 mb-1">
                                    {config.format(metric.current)}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${trendInfo.color} ${trendInfo.bgColor}`}>
                                        <span className="mr-1">{trendInfo.icon}</span>
                                        {formatPercentageChange(metric.percentage_change)}
                                    </span>
                                    <span className="text-xs text-gray-500">ce mois</span>
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[config.color]}`}>
                                {config.icon}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}