import Constants from '../../const.js'

/**
 * Déconnecte l'administrateur et révoque ses tokens
 * @returns {Promise<Object>} Résultat de la déconnexion
 */
export const logout = async () => {
    try {
        // Récupération du token d'accès
        const accessToken = localStorage.getItem('accessToken')

        // Si pas de token, considérer comme déjà déconnecté
        if (!accessToken) {
            // Nettoyage préventif du localStorage
            cleanupLocalStorage()

            return {
                success: true,
                message: "Déconnexion effectuée",
                alreadyLoggedOut: true
            }
        }

        const response = await fetch(`${Constants.API.BASE_URL}${Constants.API.ENDPOINTS.AUTH}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const data = await response.json()

        // Succès - nettoyage du localStorage
        if (response.ok) {
            cleanupLocalStorage()

            return {
                success: true,
                message: data.message || "Déconnexion réussie"
            }
        }

        // Gestion des erreurs selon le code de statut
        switch (response.status) {
            case 400:
                // Token non fourni côté serveur (ne devrait pas arriver)
                cleanupLocalStorage()

                return {
                    success: true,
                    message: "Déconnexion effectuée"
                }

            case 401:
                // Token invalide, expiré ou non autorisé
                const errorType = data.data?.errorType

                // Dans tous les cas, nettoyer le localStorage
                cleanupLocalStorage()

                // Si token expiré/invalide, considérer comme succès
                if (['TOKEN_INVALID', 'TOKEN_EXPIRED', 'TOKEN_EXPIRED_OR_REVOKED'].includes(errorType)) {
                    return {
                        success: true,
                        message: "Déconnexion effectuée"
                    }
                }

                return {
                    success: true,
                    message: "Déconnexion effectuée"
                }

            case 500:
                // Erreur serveur - mais nettoyer quand même côté client
                cleanupLocalStorage()

                const serverErrorType = data.data?.errorType

                if (serverErrorType === 'TOKEN_REVOCATION_ERROR') {
                    return {
                        success: true,
                        message: "Déconnexion effectuée (erreur de révocation côté serveur)",
                        warning: true
                    }
                }

                return {
                    success: true,
                    message: "Déconnexion effectuée (erreur serveur)",
                    warning: true
                }

            default:
                // Erreur inconnue - nettoyer quand même
                cleanupLocalStorage()

                return {
                    success: true,
                    message: "Déconnexion effectuée",
                    warning: true
                }
        }

    } catch (error) {
        // Erreur réseau ou autre erreur technique
        console.error('Erreur lors de la déconnexion:', error)

        // En cas d'erreur réseau, nettoyer quand même le localStorage
        cleanupLocalStorage()

        return {
            success: true,
            message: "Déconnexion effectuée (hors ligne)",
            warning: true
        }
    }
}

/**
 * Nettoie complètement le localStorage des données d'authentification
 */
const cleanupLocalStorage = () => {
    try {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userRole')

        // Optionnel : nettoyer d'autres données utilisateur si nécessaire
        // localStorage.removeItem('userPreferences')
        // localStorage.removeItem('lastActivity')

    } catch (error) {
        console.error('Erreur lors du nettoyage du localStorage:', error)
    }
}

export default logout