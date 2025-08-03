import Constants from '../../const.js'

/**
 * Récupère toutes les demandes avec filtres et pagination
 * @param {Object} params - Paramètres de filtrage et pagination
 * @param {string} [params.status] - Filtrer par statut
 * @param {string} [params.client_id] - Filtrer par ID client
 * @param {string} [params.whatsapp_number] - Filtrer par numéro WhatsApp
 * @param {string} [params.assigned_admin_id] - Filtrer par admin assigné
 * @param {string} [params.unassigned] - Filtrer non assignées ("true"/"false")
 * @param {number} [params.page=1] - Numéro de page
 * @param {number} [params.limit=10] - Éléments par page
 * @param {string} [params.sort_by='created_at'] - Champ de tri
 * @param {string} [params.sort_order='DESC'] - Ordre de tri
 * @returns {Promise<Object>} Résultat avec la liste des demandes
 */
export const getAllRequests = async (params = {}) => {
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
            assigned_admin_id,
            unassigned,
            page = 1,
            limit = 10,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = params

        // Ajout des paramètres s'ils sont fournis
        if (status) queryParams.append('status', status)
        if (client_id) queryParams.append('client_id', client_id)
        if (whatsapp_number) queryParams.append('whatsapp_number', whatsapp_number)
        if (assigned_admin_id) queryParams.append('assigned_admin_id', assigned_admin_id)
        if (unassigned) queryParams.append('unassigned', unassigned)

        queryParams.append('page', page.toString())
        queryParams.append('limit', limit.toString())
        queryParams.append('sort_by', sort_by)
        queryParams.append('sort_order', sort_order)

        const response = await fetch(
            `${Constants.API.BASE_URL}/admin/requests?${queryParams.toString()}`,
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
                    requests: data.data.requests,
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
        console.error('Erreur lors de la récupération des demandes:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Utilitaire pour formater le statut en français
 * @param {string} status - Statut en base
 * @returns {string} Statut formaté
 */
export const formatRequestStatus = (status) => {
    const statusMap = {
        'en_attente': 'En attente',
        'en_traitement': 'En traitement',
        'facturé': 'Facturé',
        'payé': 'Payé',
        'commandé': 'Commandé',
        'expédié': 'Expédié',
        'livré': 'Livré',
        'annulé': 'Annulé'
    }

    return statusMap[status] || status
}

/**
 * Utilitaire pour obtenir les classes CSS du badge selon le statut
 * @param {string} status - Statut de la demande
 * @returns {string} Classes CSS pour le badge
 */
export const getStatusBadgeClasses = (status) => {
    const statusClasses = {
        'en_attente': 'bg-amber-100 text-amber-800',
        'en_traitement': 'bg-blue-100 text-blue-800',
        'facturé': 'bg-emerald-100 text-emerald-800',
        'payé': 'bg-purple-100 text-purple-800',
        'commandé': 'bg-indigo-100 text-indigo-800',
        'expédié': 'bg-orange-100 text-orange-800',
        'livré': 'bg-green-100 text-green-800',
        'annulé': 'bg-red-100 text-red-800'
    }

    return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Utilitaire pour formater l'état d'assignation
 * @param {string|null} assigned_admin_id - ID de l'admin assigné
 * @returns {Object} Informations sur l'assignation
 */
export const getAssignmentInfo = (assigned_admin_id) => {
    if (assigned_admin_id) {
        return {
            isAssigned: true,
            text: 'Assignée',
            badgeClasses: 'bg-green-100 text-green-800'
        }
    }

    return {
        isAssigned: false,
        text: 'Non assignée',
        badgeClasses: 'bg-gray-100 text-gray-800'
    }
}

/**
 * Options de statuts pour les filtres
 */
export const getStatusOptions = () => [
    { value: '', label: 'Tous les statuts' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'en_traitement', label: 'En traitement' },
    { value: 'facturé', label: 'Facturé' },
    { value: 'payé', label: 'Payé' },
    { value: 'commandé', label: 'Commandé' },
    { value: 'expédié', label: 'Expédié' },
    { value: 'livré', label: 'Livré' },
    { value: 'annulé', label: 'Annulé' }
]

/**
 * Options d'assignation pour les filtres
 */
export const getAssignmentOptions = () => [
    { value: '', label: 'Toutes les demandes' },
    { value: 'true', label: 'Non assignées' },
    { value: 'false', label: 'Assignées' }
]

const requestsApi = {
    getAllRequests,
    formatRequestStatus,
    getStatusBadgeClasses,
    getAssignmentInfo,
    getStatusOptions,
    getAssignmentOptions
}

export default requestsApi