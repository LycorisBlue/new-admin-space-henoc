import Constants from '../../const.js'

/**
 * Récupère les analytics avancées des clients avec métriques business
 * @param {Object} params - Paramètres de filtrage et pagination
 * @param {string} [params.status] - Statut des clients (registered, unregistered, all)
 * @param {number} [params.page=1] - Numéro de page
 * @param {number} [params.limit=10] - Éléments par page
 * @param {string} [params.sort_by='created_at'] - Champ de tri
 * @param {string} [params.sort_order='DESC'] - Ordre de tri
 * @returns {Promise<Object>} Résultat avec analytics et métriques
 */
export const getClientAnalytics = async (params = {}) => {
    try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
            return {
                success: false,
                message: "Token d'authentification manquant",
                needsLogin: true
            }
        }

        // Construction des paramètres de requête
        const queryParams = new URLSearchParams()

        const {
            status = 'all',
            page = 1,
            limit = 10,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = params

        // Ajout des paramètres s'ils sont fournis
        if (status && status !== 'all') queryParams.append('status', status)
        queryParams.append('page', page.toString())
        queryParams.append('limit', limit.toString())
        queryParams.append('sort_by', sort_by)
        queryParams.append('sort_order', sort_order)

        const response = await fetch(
            `${Constants.API.BASE_URL}/admin/client-analytics?${queryParams.toString()}`,
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
                    overview: data.data.overview,
                    clients: data.data.clients,
                    pagination: data.data.pagination,
                    filters_applied: data.data.filters_applied
                }
            }
        }

        // Gestion des erreurs
        switch (response.status) {
            case 400:
                const errorType = data.data?.errorType

                return {
                    success: false,
                    message: data.message || "Paramètres de requête invalides",
                    errorType: errorType,
                    validationErrors: data.data
                }

            case 401:
                const authErrorType = data.data?.errorType

                if (['TOKEN_MISSING', 'TOKEN_EXPIRED', 'TOKEN_INVALID'].includes(authErrorType)) {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    localStorage.removeItem('userRole')
                    localStorage.removeItem('adminInfo')
                }

                return {
                    success: false,
                    message: data.message || "Non authentifié",
                    needsLogin: true,
                    errorType: authErrorType
                }

            case 403:
                return {
                    success: false,
                    message: data.message || "Accès refusé - Privilèges insuffisants",
                    errorType: data.data?.errorType || 'INSUFFICIENT_PRIVILEGES'
                }

            case 500:
                return {
                    success: false,
                    message: data.message || "Erreur interne du serveur",
                    errorType: data.data?.errorType || 'SERVER_ERROR',
                    technicalError: data.data?.error
                }

            default:
                return {
                    success: false,
                    message: "Une erreur inattendue s'est produite"
                }
        }

    } catch (error) {
        console.error('Erreur lors de la récupération des analytics clients:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Formate le statut du client en français
 * @param {string} status - Statut du client
 * @returns {string} Statut formaté
 */
export const formatClientStatus = (status) => {
    const statusMap = {
        'registered': 'Enregistré',
        'unregistered': 'Non enregistré'
    }
    return statusMap[status] || status
}

/**
 * Formate le statut de la dernière commande
 * @param {string} orderStatus - Statut de la commande
 * @returns {string} Statut formaté
 */
export const formatLastOrderStatus = (orderStatus) => {
    const statusMap = {
        'paid': 'Payé',
        'partial': 'Partiellement payé',
        'unpaid': 'Non payé'
    }
    return statusMap[orderStatus] || orderStatus
}

/**
 * Classes CSS pour les badges de statut client
 * @param {string} status - Statut du client
 * @returns {string} Classes CSS
 */
export const getClientStatusBadgeClasses = (status) => {
    const statusClasses = {
        'registered': 'bg-green-100 text-green-800',
        'unregistered': 'bg-gray-100 text-gray-800'
    }
    return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Classes CSS pour les badges de statut de commande
 * @param {string} orderStatus - Statut de la commande
 * @returns {string} Classes CSS
 */
export const getOrderStatusBadgeClasses = (orderStatus) => {
    const statusClasses = {
        'paid': 'bg-green-100 text-green-800',
        'partial': 'bg-orange-100 text-orange-800',
        'unpaid': 'bg-red-100 text-red-800'
    }
    return statusClasses[orderStatus] || 'bg-gray-100 text-gray-800'
}

/**
 * Formate un montant en devise CFA
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

/**
 * Options de statuts de client pour les filtres
 */
export const getClientStatusOptions = () => [
    { value: 'all', label: 'Tous les clients' },
    { value: 'registered', label: 'Clients enregistrés' },
    { value: 'unregistered', label: 'Clients non enregistrés' }
]

/**
 * Options de tri pour les analytics clients
 */
export const getSortOptions = () => [
    { value: 'created_at', label: 'Date d\'inscription' },
    { value: 'full_name', label: 'Nom' },
    { value: 'whatsapp_number', label: 'Numéro WhatsApp' }
]

/**
 * Formate une date en français
 * @param {string} dateString - Date au format ISO
 * @param {boolean} includeTime - Inclure l'heure
 * @returns {string} Date formatée
 */
export const formatDate = (dateString, includeTime = true) => {
    if (!dateString) return 'Jamais'

    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }

    if (includeTime) {
        options.hour = '2-digit'
        options.minute = '2-digit'
    }

    return new Date(dateString).toLocaleDateString('fr-FR', options)
}

/**
 * Calcule le panier moyen d'un client
 * @param {number} totalSpent - Montant total dépensé
 * @param {number} ordersCount - Nombre de commandes
 * @returns {number} Panier moyen
 */
export const calculateAverageOrder = (totalSpent, ordersCount) => {
    if (!ordersCount || ordersCount === 0) return 0
    return totalSpent / ordersCount
}

/**
 * Détermine si un client est actif (a au moins une commande)
 * @param {number} ordersCount - Nombre de commandes
 * @returns {boolean} True si le client est actif
 */
export const isActiveClient = (ordersCount) => {
    return ordersCount > 0
}

/**
 * Calcule le taux de clients actifs
 * @param {number} activeClients - Nombre de clients actifs
 * @param {number} totalClients - Nombre total de clients
 * @returns {number} Taux en pourcentage
 */
export const calculateActiveClientRate = (activeClients, totalClients) => {
    if (!totalClients || totalClients === 0) return 0
    return Math.round((activeClients / totalClients) * 100)
}

const clientAnalyticsApi = {
    getClientAnalytics,
    formatClientStatus,
    formatLastOrderStatus,
    getClientStatusBadgeClasses,
    getOrderStatusBadgeClasses,
    formatCurrency,
    getClientStatusOptions,
    getSortOptions,
    formatDate,
    calculateAverageOrder,
    isActiveClient,
    calculateActiveClientRate
}

export default clientAnalyticsApi