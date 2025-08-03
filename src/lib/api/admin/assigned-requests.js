import Constants from '../../const.js'

/**
 * Récupère les demandes assignées à l'administrateur connecté
 * @param {Object} params - Paramètres de filtrage et pagination
 * @param {string} [params.status] - Filtrer par statut (en_attente, en_traitement, etc.)
 * @param {number} [params.page=1] - Numéro de page
 * @param {number} [params.limit=10] - Nombre d'éléments par page
 * @param {string} [params.sort_by='created_at'] - Champ de tri
 * @param {string} [params.sort_order='DESC'] - Ordre de tri (ASC, DESC)
 * @returns {Promise<Object>} Résultat avec la liste des demandes assignées
 */
export const getAssignedToMe = async (params = {}) => {
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

        // Paramètres avec valeurs par défaut
        const {
            status,
            page = 1,
            limit = 10,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = params

        // Ajout des paramètres s'ils sont fournis
        if (status) queryParams.append('status', status)
        queryParams.append('page', page.toString())
        queryParams.append('limit', limit.toString())
        queryParams.append('sort_by', sort_by)
        queryParams.append('sort_order', sort_order)

        const response = await fetch(
            `${Constants.API.BASE_URL}/admin/assigned-requests/assigned-to-me?${queryParams.toString()}`,
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

        // Gestion des erreurs selon le code de statut
        switch (response.status) {
            case 401:
                // Token invalide, expiré ou manquant
                const errorType = data.data?.errorType

                // Nettoyage des tokens si invalides
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
                // Privilèges insuffisants
                return {
                    success: false,
                    message: data.message || "Accès refusé - Privilèges insuffisants",
                    errorType: data.data?.errorType || 'INSUFFICIENT_PRIVILEGES'
                }

            case 500:
                // Erreur serveur
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
        // Erreur réseau ou autre erreur technique
        console.error('Erreur lors de la récupération des demandes assignées:', error)

        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Utilitaire pour formater le statut en français
 * @param {string} status - Statut en anglais/base
 * @returns {string} Statut formaté en français
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
 * Utilitaire pour obtenir la couleur du badge selon le statut
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

const assignedRequestsApi = {
    getAssignedToMe,
    formatRequestStatus,
    getStatusBadgeClasses
}

export default assignedRequestsApi