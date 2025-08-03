import Constants from '../../const.js'

/**
 * Assigne une demande à un administrateur
 * @param {string} requestId - ID de la demande
 * @param {string} [adminId] - ID de l'admin à assigner (optionnel, par défaut l'admin connecté)
 * @returns {Promise<Object>} Résultat de l'assignation
 */
export const assignRequest = async (requestId, adminId = null) => {
    try {
        if (!requestId) {
            return {
                success: false,
                message: "ID de la demande requis"
            }
        }

        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
            return {
                success: false,
                message: "Token d'authentification manquant",
                needsLogin: true
            }
        }

        const body = adminId ? { admin_id: adminId } : {}

        const response = await fetch(
            `${Constants.API.BASE_URL}/admin/requests/${requestId}/assign`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(body)
            }
        )

        const data = await response.json()

        if (response.ok) {
            return {
                success: true,
                message: data.message,
                data: data.data
            }
        }

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
                    message: data.message || "Seul un superadmin peut assigner une demande à un autre administrateur",
                    errorType: data.data?.errorType || 'INSUFFICIENT_PERMISSIONS'
                }

            case 404:
                return {
                    success: false,
                    message: data.message || "Demande non trouvée",
                    errorType: data.data?.errorType || 'REQUEST_NOT_FOUND'
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
        console.error('Erreur lors de l\'assignation de la demande:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * S'assigne une demande (raccourci)
 * @param {string} requestId - ID de la demande
 * @returns {Promise<Object>} Résultat de l'assignation
 */
export const assignToMe = async (requestId) => {
    return await assignRequest(requestId)
}

/**
 * Assigne une demande à un autre admin (nécessite superadmin)
 * @param {string} requestId - ID de la demande
 * @param {string} adminId - ID de l'admin cible
 * @returns {Promise<Object>} Résultat de l'assignation
 */
export const assignToAdmin = async (requestId, adminId) => {
    if (!adminId) {
        return {
            success: false,
            message: "ID de l'administrateur requis"
        }
    }

    return await assignRequest(requestId, adminId)
}

const assignRequestApi = {
    assignRequest,
    assignToMe,
    assignToAdmin
}

export default assignRequestApi