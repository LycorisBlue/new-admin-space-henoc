import Constants from '../../const.js'

/**
 * Récupère les informations de l'administrateur connecté
 * @returns {Promise<Object>} Résultat avec les informations de l'admin
 */
export const getMe = async () => {
    try {
        // Récupération du token d'accès
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
            return {
                success: false,
                message: "Token d'authentification manquant",
                needsLogin: true
            }
        }

        const response = await fetch(`${Constants.API.BASE_URL}${Constants.API.ENDPOINTS.AUTH}/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const data = await response.json()

        // Succès
        if (response.ok) {
            return {
                success: true,
                message: data.message,
                data: {
                    admin: data.data.admin,
                    token: data.data.token
                }
            }
        }

        // Gestion des erreurs selon le code de statut
        switch (response.status) {
            case 401:
                // Token invalide, expiré ou manquant
                const errorType = data.data?.errorType

                // Nettoyage des tokens si invalides
                if (['TOKEN_INVALID', 'TOKEN_EXPIRED', 'TOKEN_EXPIRED_OR_REVOKED'].includes(errorType)) {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    localStorage.removeItem('userRole')
                }

                return {
                    success: false,
                    message: data.message || "Non authentifié",
                    needsLogin: true,
                    errorType: errorType
                }

            case 404:
                // Admin non trouvé
                return {
                    success: false,
                    message: data.message || "Administrateur non trouvé",
                    needsLogin: true
                }

            case 500:
                return {
                    success: false,
                    message: data.message || "Erreur interne du serveur"
                }

            default:
                return {
                    success: false,
                    message: "Une erreur inattendue s'est produite"
                }
        }

    } catch (error) {
        // Erreur réseau ou autre erreur technique
        console.error('Erreur lors de la récupération des informations:', error)

        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

export default getMe