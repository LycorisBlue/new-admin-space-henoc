import Constants from '../../const.js'

/**
 * Récupère toutes les données analytics pour le dashboard admin
 * @returns {Promise<Object>} Résultat avec les données analytics complètes
 */
export const getAnalytics = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
            return {
                success: false,
                message: "Token d'authentification manquant",
                needsLogin: true
            }
        }

        const response = await fetch(
            `${Constants.API.BASE_URL}/admin/analytics`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        )

        const data = await response.json()

        // Succès
        if (response.ok) {
            return {
                success: true,
                message: data.message,
                data: {
                    metrics: data.data.metrics,
                    weeklyEvolution: data.data.weekly_evolution,
                    requestsDistribution: data.data.requests_distribution,
                    paymentMethods: data.data.payment_methods,
                    recentActivity: data.data.recent_activity,
                    additionalStats: data.data.additional_stats,
                    metadata: data.data.metadata
                }
            }
        }

        // Gestion des erreurs selon le code de statut
        switch (response.status) {
            case 401:
                const errorType = data.data?.errorType

                if (['TOKEN_INVALID', 'TOKEN_EXPIRED', 'TOKEN_EXPIRED_OR_REVOKED', 'UNAUTHORIZED'].includes(errorType)) {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    localStorage.removeItem('userRole')
                    localStorage.removeItem('adminInfo')
                }

                return {
                    success: false,
                    message: data.message || "Non authentifié",
                    needsLogin: true,
                    errorType: errorType
                }

            case 403:
                return {
                    success: false,
                    message: data.message || "Accès refusé - Privilèges insuffisants",
                    errorType: data.data?.errorType || 'INSUFFICIENT_PRIVILEGES',
                    requiredRoles: data.data?.requiredRoles,
                    userRole: data.data?.userRole
                }

            case 500:
                return {
                    success: false,
                    message: data.message || "Erreur interne du serveur",
                    errorType: data.data?.errorType || 'SERVER_ERROR'
                }

            default:
                return {
                    success: false,
                    message: "Une erreur inattendue s'est produite"
                }
        }

    } catch (error) {
        console.error('Erreur lors de la récupération des analytics:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Formate un montant depuis les centimes vers la devise
 * @param {number} amountInCents - Montant en centimes
 * @param {string} currency - Code de devise (EUR par défaut)
 * @returns {string} Montant formaté
 */
export const formatCurrency = (amountInCents, currency = 'XOF') => {
    const amount = amountInCents / 100
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

/**
 * Formate un montant de manière compacte (K, M, B)
 * @param {number} amountInCents - Montant en centimes
 * @param {string} currency - Code de devise
 * @returns {string} Montant formaté de manière compacte
 */
export const formatCurrencyCompact = (amountInCents, currency = 'XOF') => {
    const amount = amountInCents / 100

    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M FCFA`
    } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K FCFA`
    } else {
        return formatCurrency(amountInCents, currency)
    }
}

/**
 * Formate un pourcentage de changement avec signe
 * @param {number} percentage - Pourcentage de changement
 * @returns {string} Pourcentage formaté avec signe
 */
export const formatPercentageChange = (percentage) => {
    if (percentage > 0) {
        return `+${percentage}%`
    } else if (percentage < 0) {
        return `${percentage}%`
    } else {
        return '0%'
    }
}

/**
 * Obtient l'icône et la couleur selon la tendance
 * @param {string} trend - Tendance ('up' ou 'down')
 * @param {number} percentage - Pourcentage de changement
 * @returns {Object} Objet avec icône et couleur
 */
export const getTrendInfo = (trend, percentage) => {
    if (percentage === 0) {
        return {
            icon: '→',
            color: 'text-gray-500',
            bgColor: 'bg-gray-100'
        }
    }

    if (trend === 'up') {
        return {
            icon: '↗',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100'
        }
    } else {
        return {
            icon: '↘',
            color: 'text-red-600',
            bgColor: 'bg-red-100'
        }
    }
}

/**
 * Formate une date relative (il y a X temps)
 * @param {string} dateString - Date au format ISO
 * @returns {string} Date formatée de manière relative
 */
export const formatRelativeDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMilliseconds = now - date
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) {
        return "À l'instant"
    } else if (diffInMinutes < 60) {
        return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`
    } else if (diffInHours < 24) {
        return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
    } else if (diffInDays < 7) {
        return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
    } else {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }
}

/**
 * Obtient l'icône selon le type d'activité
 * @param {string} iconType - Type d'icône ('plus', 'check', 'user')
 * @returns {Object} Objet avec l'icône et ses styles
 */
export const getActivityIcon = (iconType) => {
    const icons = {
        plus: {
            svg: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            ),
            defaultColor: 'text-blue-600',
            defaultBg: 'bg-blue-100'
        },
        check: {
            svg: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ),
            defaultColor: 'text-emerald-600',
            defaultBg: 'bg-emerald-100'
        },
        user: {
            svg: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            defaultColor: 'text-purple-600',
            defaultBg: 'bg-purple-100'
        }
    }

    return icons[iconType] || icons.plus
}

/**
 * Obtient les couleurs selon la couleur spécifiée
 * @param {string} color - Couleur ('blue', 'green', 'purple', 'red')
 * @returns {Object} Classes CSS pour les couleurs
 */
export const getColorClasses = (color) => {
    const colors = {
        blue: {
            text: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        green: {
            text: 'text-emerald-600',
            bg: 'bg-emerald-100'
        },
        purple: {
            text: 'text-purple-600',
            bg: 'bg-purple-100'
        },
        red: {
            text: 'text-red-600',
            bg: 'bg-red-100'
        },
        gray: {
            text: 'text-gray-600',
            bg: 'bg-gray-100'
        }
    }

    return colors[color] || colors.blue
}

/**
 * Formate les données pour le graphique Recharts
 * @param {Object} weeklyEvolution - Données d'évolution hebdomadaire
 * @returns {Array} Données formatées pour Recharts
 */
export const formatChartData = (weeklyEvolution) => {
    if (!weeklyEvolution || !weeklyEvolution.labels) {
        return []
    }

    return weeklyEvolution.labels.map((label, index) => ({
        name: label,
        demandes: weeklyEvolution.datasets.requests[index] || 0,
        factures: weeklyEvolution.datasets.invoices[index] || 0,
        revenus: (weeklyEvolution.datasets.revenue[index] || 0) / 100 // Conversion centimes -> euros
    }))
}

/**
 * Calcule les totaux pour les métriques
 * @param {Object} metrics - Objet des métriques
 * @returns {Object} Totaux calculés
 */
export const calculateTotals = (metrics) => {
    if (!metrics) return {}

    return {
        totalRequests: metrics.total_requests?.current || 0,
        totalInvoices: metrics.total_invoices?.current || 0,
        totalRevenue: metrics.total_revenue?.current || 0,
        totalClients: metrics.active_clients?.current || 0
    }
}

/**
 * Valide la structure des données analytics
 * @param {Object} data - Données à valider
 * @returns {boolean} True si les données sont valides
 */
export const validateAnalyticsData = (data) => {
    if (!data) return false

    const requiredFields = [
        'metrics',
        'weeklyEvolution',
        'recentActivity'
    ]

    return requiredFields.every(field => data.hasOwnProperty(field))
}

const analyticsApi = {
    getAnalytics,
    formatCurrency,
    formatCurrencyCompact,
    formatPercentageChange,
    getTrendInfo,
    formatRelativeDate,
    getActivityIcon,
    getColorClasses,
    formatChartData,
    calculateTotals,
    validateAnalyticsData
}

export default analyticsApi