import {
    formatRelativeDate,
    getActivityIcon,
    getColorClasses
} from '../../lib/api/admin/analytics'

export default function RecentActivity({ recentActivity }) {
    if (!recentActivity) {
        return (
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-56"></div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Grouper les activités par type pour les statistiques
    const activityStats = recentActivity.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1
        return acc
    }, {})

    const getTypeLabel = (type) => {
        const labels = {
            'request_created': 'Nouvelles demandes',
            'payment_received': 'Paiements reçus',
            'client_registered': 'Nouveaux clients',
            'invoice_created': 'Factures créées',
            'status_updated': 'Statuts mis à jour'
        }
        return labels[type] || type
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {recentActivity.length} activité{recentActivity.length > 1 ? 's' : ''} récente{recentActivity.length > 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Mini statistiques des types d'activité */}
                    <div className="flex items-center gap-4 text-xs">
                        {Object.entries(activityStats).slice(0, 3).map(([type, count]) => (
                            <div key={type} className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${type === 'request_created' ? 'bg-blue-500' :
                                        type === 'payment_received' ? 'bg-emerald-500' :
                                            'bg-purple-500'
                                    }`}></div>
                                <span className="text-gray-600">
                                    {count} {getTypeLabel(type).toLowerCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6">
                {recentActivity.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">Aucune activité récente</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => {
                            const icon = getActivityIcon(activity.icon_type)
                            const colors = getColorClasses(activity.color)

                            return (
                                <div
                                    key={activity.id}
                                    className="flex gap-4 hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
                                >
                                    {/* Timeline connector */}
                                    <div className="relative flex flex-col items-center">
                                        {/* Icône de l'activité */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors.bg} ${colors.text} relative z-10`}>
                                            {icon.svg}
                                        </div>

                                        {/* Ligne de connexion (sauf pour le dernier élément) */}
                                        {index < recentActivity.length - 1 && (
                                            <div className="w-px h-6 bg-gray-200 mt-2"></div>
                                        )}
                                    </div>

                                    {/* Contenu de l'activité */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.title}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1 break-words">
                                                    {activity.description}
                                                </p>
                                            </div>

                                            {/* Badge du type d'activité */}
                                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${activity.type === 'request_created' ? 'bg-blue-100 text-blue-800' :
                                                    activity.type === 'payment_received' ? 'bg-emerald-100 text-emerald-800' :
                                                        activity.type === 'client_registered' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {activity.type === 'request_created' ? 'Demande' :
                                                    activity.type === 'payment_received' ? 'Paiement' :
                                                        activity.type === 'client_registered' ? 'Client' :
                                                            'Activité'}
                                            </span>
                                        </div>

                                        {/* Timestamp */}
                                        <p className="text-xs text-gray-500 mt-2">
                                            {activity.timestamp ? formatRelativeDate(activity.timestamp) : 'Date inconnue'}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Lien vers toutes les activités */}
                {recentActivity.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <button className="w-full text-center text-sm text-gray-600 hover:text-gray-900 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                            Voir toutes les activités
                            <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}