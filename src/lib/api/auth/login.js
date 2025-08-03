import Constants from '../../const.js'

/**
 * Authentifie un administrateur avec email et mot de passe
 * @param {Object} credentials - Les identifiants de connexion
 * @param {string} credentials.email - Email de l'administrateur
 * @param {string} credentials.password - Mot de passe de l'administrateur
 * @returns {Promise<Object>} Résultat de l'authentification
 */
export const login = async (credentials) => {
    try {
        const { email, password } = credentials

        // Validation basique côté client
        if (!email || !password) {
            return {
                success: false,
                message: "Email et mot de passe requis"
            }
        }

        const response = await fetch(`${Constants.API.BASE_URL}${Constants.API.ENDPOINTS.AUTH}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })

        const data = await response.json()

        // Succès
        if (response.ok) {
            // Stockage des tokens si fournis
            if (data.data?.accessToken) {
                localStorage.setItem('accessToken', data.data.accessToken)
            }
            if (data.data?.refreshToken) {
                localStorage.setItem('refreshToken', data.data.refreshToken)
            }
            if (data.data?.role) {
                localStorage.setItem('userRole', data.data.role)
            }

            return {
                success: true,
                message: data.message,
                data: data.data
            }
        }

        // Gestion des erreurs selon le code de statut
        switch (response.status) {
            case 400:
                return {
                    success: false,
                    message: data.message || "Données de requête invalides"
                }

            case 401:
                return {
                    success: false,
                    message: data.message || "Identifiants invalides"
                }

            case 429:
                return {
                    success: false,
                    message: data.message || "Trop de tentatives de connexion. Réessayez plus tard."
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
        console.error('Erreur lors de la connexion:', error)

        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

export default login