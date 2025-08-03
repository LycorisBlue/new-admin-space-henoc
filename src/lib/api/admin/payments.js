import Constants from '../../const.js'

/**
 * Récupère tous les paiements avec filtres et pagination
 * @param {Object} params - Paramètres de filtrage et pagination
 * @param {string} [params.method] - Méthode de paiement
 * @param {string} [params.client_id] - ID client
 * @param {string} [params.whatsapp_number] - Numéro WhatsApp
 * @param {string} [params.admin_id] - ID admin confirmateur
 * @param {number} [params.min_amount] - Montant minimum
 * @param {number} [params.max_amount] - Montant maximum
 * @param {string} [params.date_from] - Date début
 * @param {string} [params.date_to] - Date fin
 * @param {string} [params.invoice_id] - ID facture
 * @param {string} [params.request_id] - ID demande
 * @param {number} [params.page=1] - Page
 * @param {number} [params.limit=10] - Limite
 * @param {string} [params.sort_by='payment_date'] - Tri
 * @param {string} [params.sort_order='DESC'] - Ordre
 * @returns {Promise<Object>} Résultat avec paiements et stats
 */
export const getAllPayments = async (params = {}) => {
    try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
            return {
                success: false,
                message: "Token d'authentification manquant",
                needsLogin: true
            }
        }

        const queryParams = new URLSearchParams()

        const {
            method,
            client_id,
            whatsapp_number,
            admin_id,
            min_amount,
            max_amount,
            date_from,
            date_to,
            invoice_id,
            request_id,
            page = 1,
            limit = 10,
            sort_by = 'payment_date',
            sort_order = 'DESC'
        } = params

        // Ajout des paramètres s'ils sont fournis
        if (method) queryParams.append('method', method)
        if (client_id) queryParams.append('client_id', client_id)
        if (whatsapp_number) queryParams.append('whatsapp_number', whatsapp_number)
        if (admin_id) queryParams.append('admin_id', admin_id)
        if (min_amount) queryParams.append('min_amount', min_amount.toString())
        if (max_amount) queryParams.append('max_amount', max_amount.toString())
        if (date_from) queryParams.append('date_from', date_from)
        if (date_to) queryParams.append('date_to', date_to)
        if (invoice_id) queryParams.append('invoice_id', invoice_id)
        if (request_id) queryParams.append('request_id', request_id)

        queryParams.append('page', page.toString())
        queryParams.append('limit', limit.toString())
        queryParams.append('sort_by', sort_by)
        queryParams.append('sort_order', sort_order)

        const response = await fetch(
            `${Constants.API.BASE_URL}/admin/payments?${queryParams.toString()}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        )

        const data = await response.json()

        if (response.ok) {
            return {
                success: true,
                message: data.message,
                data: {
                    payments: data.data.payments,
                    pagination: data.data.pagination,
                    stats: data.data.stats
                }
            }
        }

        // Gestion des erreurs
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
        console.error('Erreur lors de la récupération des paiements:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Formate une méthode de paiement
 * @param {string} method - Méthode de paiement
 * @returns {string} Méthode formatée
 */
export const formatPaymentMethod = (method) => {
    const methodMap = {
        'wave': 'Wave',
        'momo': 'Mobile Money',
        'orange_money': 'Orange Money',
        'zeepay': 'Zeepay',
        'cash': 'Espèces'
    }
    return methodMap[method] || method
}

/**
 * Classes CSS pour badges de méthode de paiement
 * @param {string} method - Méthode de paiement
 * @returns {string} Classes CSS
 */
export const getPaymentMethodBadgeClasses = (method) => {
    const methodClasses = {
        'wave': 'bg-blue-100 text-blue-800',
        'momo': 'bg-yellow-100 text-yellow-800',
        'orange_money': 'bg-orange-100 text-orange-800',
        'zeepay': 'bg-purple-100 text-purple-800',
        'cash': 'bg-gray-100 text-gray-800'
    }
    return methodClasses[method] || 'bg-gray-100 text-gray-800'
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
 * Options de méthodes de paiement pour filtres
 */
export const getPaymentMethodOptions = () => [
    { value: '', label: 'Toutes les méthodes' },
    { value: 'wave', label: 'Wave' },
    { value: 'momo', label: 'Mobile Money' },
    { value: 'orange_money', label: 'Orange Money' },
    { value: 'zeepay', label: 'Zeepay' },
    { value: 'cash', label: 'Espèces' }
]

/**
 * Options de tri pour les paiements
 */
export const getSortOptions = () => [
    { value: 'payment_date', label: 'Date de paiement' },
    { value: 'amount_paid', label: 'Montant' },
    { value: 'created_at', label: 'Date de création' }
]

/**
 * Formate une date en français
 * @param {string} dateString - Date ISO
 * @param {boolean} includeTime - Inclure l'heure
 * @returns {string} Date formatée
 */
export const formatDate = (dateString, includeTime = true) => {
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

const paymentsApi = {
    getAllPayments,
    formatPaymentMethod,
    getPaymentMethodBadgeClasses,
    formatCurrency,
    getPaymentMethodOptions,
    getSortOptions,
    formatDate
}

export default paymentsApi