import Constants from '../../const.js'

/**
 * Récupère la liste de tous les administrateurs
 * @returns {Promise<Object>} Résultat avec la liste des administrateurs
 */
export const getAllAdmins = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
            return {
                success: false,
                message: "Token d'authentification manquant",
                needsLogin: true
            }
        }

        const response = await fetch(`${Constants.API.BASE_URL}/superadmin/admins`, {
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
                data: data.data
            }
        }

        // Gestion des erreurs selon le code de statut
        switch (response.status) {
            case 401:
                // Token invalide ou expiré
                const errorType = data.data?.errorType

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

            case 403:
                return {
                    success: false,
                    message: data.message || "Accès refusé - Rôle super-administrateur requis",
                    errorType: data.data?.errorType
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
        console.error('Erreur lors de la récupération des administrateurs:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Crée un nouvel administrateur
 * @param {Object} adminData - Données du nouvel administrateur
 * @param {string} adminData.name - Nom de l'administrateur
 * @param {string} adminData.email - Email de l'administrateur
 * @param {string} adminData.password - Mot de passe de l'administrateur
 * @param {string} [adminData.role='admin'] - Rôle de l'administrateur
 * @returns {Promise<Object>} Résultat de la création
 */
export const createAdmin = async (adminData) => {
    try {
        const { name, email, password, role = 'admin' } = adminData

        // Validation basique côté client
        if (!name || !email || !password) {
            return {
                success: false,
                message: "Nom, email et mot de passe sont requis"
            }
        }

        // Validation du format email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return {
                success: false,
                message: "Format d'email invalide"
            }
        }

        // Validation du rôle
        if (!['admin', 'superadmin'].includes(role)) {
            return {
                success: false,
                message: "Rôle invalide. Valeurs acceptées: admin, superadmin"
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

        const response = await fetch(`${Constants.API.BASE_URL}/superadmin/admins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ name, email, password, role })
        })

        const data = await response.json()

        // Succès
        if (response.ok) {
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
                    message: data.message,
                    errorType: data.data?.errorType
                }

            case 401:
                const errorType = data.data?.errorType

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

            case 403:
                return {
                    success: false,
                    message: data.message || "Accès refusé - Rôle super-administrateur requis",
                    errorType: data.data?.errorType
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
        console.error('Erreur lors de la création de l\'administrateur:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Met à jour un administrateur existant
 * @param {string} id - ID de l'administrateur à modifier
 * @param {Object} adminData - Nouvelles données de l'administrateur
 * @param {string} [adminData.name] - Nom de l'administrateur
 * @param {string} [adminData.email] - Email de l'administrateur
 * @param {string} [adminData.password] - Nouveau mot de passe
 * @param {string} [adminData.role] - Rôle de l'administrateur
 * @returns {Promise<Object>} Résultat de la mise à jour
 */
export const updateAdmin = async (id, adminData) => {
    try {
        if (!id) {
            return {
                success: false,
                message: "ID de l'administrateur requis"
            }
        }

        // Validation du format email si fourni
        if (adminData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(adminData.email)) {
                return {
                    success: false,
                    message: "Format d'email invalide"
                }
            }
        }

        // Validation du rôle si fourni
        if (adminData.role && !['admin', 'superadmin'].includes(adminData.role)) {
            return {
                success: false,
                message: "Rôle invalide. Valeurs acceptées: admin, superadmin"
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

        const response = await fetch(`${Constants.API.BASE_URL}/superadmin/admins/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(adminData)
        })

        const data = await response.json()

        // Succès
        if (response.ok) {
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
                    message: data.message,
                    errorType: data.data?.errorType
                }

            case 401:
                const errorType = data.data?.errorType

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

            case 403:
                return {
                    success: false,
                    message: data.message || "Accès refusé - Rôle super-administrateur requis",
                    errorType: data.data?.errorType
                }

            case 404:
                return {
                    success: false,
                    message: data.message || "Administrateur non trouvé",
                    errorType: data.data?.errorType
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
        console.error('Erreur lors de la mise à jour de l\'administrateur:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Supprime un administrateur
 * @param {string} id - ID de l'administrateur à supprimer
 * @returns {Promise<Object>} Résultat de la suppression
 */
export const deleteAdmin = async (id) => {
    try {
        if (!id) {
            return {
                success: false,
                message: "ID de l'administrateur requis"
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

        const response = await fetch(`${Constants.API.BASE_URL}/superadmin/admins/${id}`, {
            method: 'DELETE',
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
                message: data.message
            }
        }

        // Gestion des erreurs selon le code de statut
        switch (response.status) {
            case 400:
                return {
                    success: false,
                    message: data.message || "Vous ne pouvez pas supprimer votre propre compte",
                    errorType: data.data?.errorType
                }

            case 401:
                const errorType = data.data?.errorType

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

            case 403:
                return {
                    success: false,
                    message: data.message || "Accès refusé - Rôle super-administrateur requis",
                    errorType: data.data?.errorType
                }

            case 404:
                return {
                    success: false,
                    message: data.message || "Administrateur non trouvé",
                    errorType: data.data?.errorType
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
        console.error('Erreur lors de la suppression de l\'administrateur:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

const adminApi = {
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin
}

export default adminApi