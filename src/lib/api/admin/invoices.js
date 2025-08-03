import Constants from '../../const.js'

/**
 * Récupère toutes les factures avec filtres et pagination
 * @param {Object} params - Paramètres de filtrage et pagination
 * @param {string} [params.status] - Filtrer par statut (en_attente, payé, annulé)
 * @param {string} [params.client_id] - Filtrer par ID client
 * @param {string} [params.whatsapp_number] - Filtrer par numéro WhatsApp
 * @param {string} [params.admin_id] - Filtrer par admin créateur
 * @param {number} [params.min_amount] - Montant minimum
 * @param {number} [params.max_amount] - Montant maximum
 * @param {string} [params.date_from] - Date début (format ISO)
 * @param {string} [params.date_to] - Date fin (format ISO)
 * @param {string} [params.payment_status] - Statut paiement (paid, partial, unpaid)
 * @param {number} [params.page=1] - Numéro de page
 * @param {number} [params.limit=10] - Éléments par page
 * @param {string} [params.sort_by='created_at'] - Champ de tri
 * @param {string} [params.sort_order='DESC'] - Ordre de tri
 * @returns {Promise<Object>} Résultat avec la liste des factures
 */
export const getAllInvoices = async (params = {}) => {
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
            status,
            client_id,
            whatsapp_number,
            admin_id,
            min_amount,
            max_amount,
            date_from,
            date_to,
            payment_status,
            page = 1,
            limit = 10,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = params

        // Ajout des paramètres s'ils sont fournis
        if (status) queryParams.append('status', status)
        if (client_id) queryParams.append('client_id', client_id)
        if (whatsapp_number) queryParams.append('whatsapp_number', whatsapp_number)
        if (admin_id) queryParams.append('admin_id', admin_id)
        if (min_amount) queryParams.append('min_amount', min_amount.toString())
        if (max_amount) queryParams.append('max_amount', max_amount.toString())
        if (date_from) queryParams.append('date_from', date_from)
        if (date_to) queryParams.append('date_to', date_to)
        if (payment_status) queryParams.append('payment_status', payment_status)

        queryParams.append('page', page.toString())
        queryParams.append('limit', limit.toString())
        queryParams.append('sort_by', sort_by)
        queryParams.append('sort_order', sort_order)

        const response = await fetch(
            `${Constants.API.BASE_URL}/admin/invoices?${queryParams.toString()}`,
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
                    invoices: data.data.invoices,
                    pagination: data.data.pagination
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
        console.error('Erreur lors de la récupération des factures:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Formate le statut d'une facture en français
 * @param {string} status - Statut de la facture
 * @returns {string} Statut formaté
 */
export const formatInvoiceStatus = (status) => {
    const statusMap = {
        'en_attente': 'En attente',
        'payé': 'Payé',
        'annulé': 'Annulé'
    }
    return statusMap[status] || status
}

/**
 * Formate le statut de paiement en français
 * @param {string} paymentStatus - Statut de paiement
 * @returns {string} Statut formaté
 */
export const formatPaymentStatus = (paymentStatus) => {
    const statusMap = {
        'paid': 'Entièrement payé',
        'partial': 'Partiellement payé',
        'unpaid': 'Non payé'
    }
    return statusMap[paymentStatus] || paymentStatus
}

/**
 * Classes CSS pour les badges de statut de facture
 * @param {string} status - Statut de la facture
 * @returns {string} Classes CSS
 */
export const getInvoiceStatusBadgeClasses = (status) => {
    const statusClasses = {
        'en_attente': 'bg-amber-100 text-amber-800',
        'payé': 'bg-emerald-100 text-emerald-800',
        'annulé': 'bg-red-100 text-red-800'
    }
    return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Classes CSS pour les badges de statut de paiement
 * @param {string} paymentStatus - Statut de paiement
 * @returns {string} Classes CSS
 */
export const getPaymentStatusBadgeClasses = (paymentStatus) => {
    const statusClasses = {
        'paid': 'bg-green-100 text-green-800',
        'partial': 'bg-orange-100 text-orange-800',
        'unpaid': 'bg-red-100 text-red-800'
    }
    return statusClasses[paymentStatus] || 'bg-gray-100 text-gray-800'
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
 * Options de statuts de facture pour les filtres
 */
export const getInvoiceStatusOptions = () => [
    { value: '', label: 'Tous les statuts' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'payé', label: 'Payé' },
    { value: 'annulé', label: 'Annulé' }
]

/**
 * Options de statuts de paiement pour les filtres
 */
export const getPaymentStatusOptions = () => [
    { value: '', label: 'Tous les paiements' },
    { value: 'unpaid', label: 'Non payé' },
    { value: 'partial', label: 'Partiellement payé' },
    { value: 'paid', label: 'Entièrement payé' }
]

/**
 * Options de tri pour les factures
 */
export const getSortOptions = () => [
    { value: 'created_at', label: 'Date de création' },
    { value: 'total_amount', label: 'Montant total' },
    { value: 'status', label: 'Statut' }
]

/**
 * Formate une date en français
 * @param {string} dateString - Date au format ISO
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

const invoicesApi = {
    getAllInvoices,
    formatInvoiceStatus,
    formatPaymentStatus,
    getInvoiceStatusBadgeClasses,
    getPaymentStatusBadgeClasses,
    formatCurrency,
    getInvoiceStatusOptions,
    getPaymentStatusOptions,
    getSortOptions,
    formatDate
}

export default invoicesApi