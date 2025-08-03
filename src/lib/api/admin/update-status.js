import Constants from '../../const.js'

/**
 * Met à jour le statut d'une demande
 * @param {string} requestId - ID de la demande
 * @param {string} status - Nouveau statut
 * @param {string} [comment] - Commentaire optionnel
 * @returns {Promise<Object>} Résultat de la mise à jour
 */
export const updateRequestStatus = async (requestId, status, comment = null) => {
    try {
        if (!requestId) {
            return {
                success: false,
                message: "ID de la demande requis"
            }
        }

        if (!status) {
            return {
                success: false,
                message: "Le statut est requis"
            }
        }

        const validStatuses = [
            'en_attente', 'en_traitement', 'facturé', 'payé',
            'commandé', 'expédié', 'livré', 'annulé'
        ]

        if (!validStatuses.includes(status)) {
            return {
                success: false,
                message: `Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}`,
                validStatuses
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

        const body = { status }
        if (comment) {
            body.comment = comment
        }

        const response = await fetch(
            `${Constants.API.BASE_URL}/admin/requests/${requestId}/status`,
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
            case 400:
                const errorType = data.data?.errorType

                return {
                    success: false,
                    message: data.message,
                    errorType: errorType,
                    validStatuses: data.data?.validStatuses
                }

            case 401:
                const authErrorType = data.data?.errorType

                if (['TOKEN_INVALID', 'TOKEN_EXPIRED', 'TOKEN_EXPIRED_OR_REVOKED', 'UNAUTHORIZED'].includes(authErrorType)) {
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
                    message: data.message || "Vous n'êtes pas autorisé à modifier le statut de cette demande",
                    errorType: data.data?.errorType || 'ADMIN_NOT_ASSIGNED',
                    requestId: data.data?.request_id,
                    assignedAdminId: data.data?.assigned_admin_id
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
        console.error('Erreur lors de la mise à jour du statut:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Options de statuts disponibles
 */
export const getStatusOptions = () => [
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
 * Statuts suivants logiques selon le statut actuel
 */
export const getNextStatuses = (currentStatus) => {
    const statusFlow = {
        'en_attente': ['en_traitement', 'annulé'],
        'en_traitement': ['facturé', 'annulé'],
        'facturé': ['payé', 'annulé'],
        'payé': ['commandé', 'annulé'],
        'commandé': ['expédié', 'annulé'],
        'expédié': ['livré', 'annulé'],
        'livré': [],
        'annulé': []
    }

    const nextStatusValues = statusFlow[currentStatus] || []
    const allOptions = getStatusOptions()

    return allOptions.filter(option => nextStatusValues.includes(option.value))
}

const updateStatusApi = {
    updateRequestStatus,
    getStatusOptions,
    getNextStatuses
}

export default updateStatusApi