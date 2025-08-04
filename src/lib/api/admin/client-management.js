import Constants from '../../const.js'

/**
 * Vérifie si un numéro WhatsApp est déjà enregistré
 * @param {string} whatsappNumber - Numéro WhatsApp au format international
 * @returns {Promise<Object>} Résultat avec informations du client si existant
 */
export const checkWhatsAppNumber = async (whatsappNumber) => {
    try {
        if (!whatsappNumber) {
            return {
                success: false,
                message: "Numéro WhatsApp requis"
            }
        }

        // Validation basique du format
        const validation = validateWhatsAppNumber(whatsappNumber)
        if (!validation.valid) {
            return {
                success: false,
                message: validation.message
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

        // Encoder le numéro pour l'URL (gérer le +)
        const encodedNumber = encodeURIComponent(whatsappNumber)

        const response = await fetch(
            `${Constants.API.BASE_URL}/admin/clients/check-whatsapp/${encodedNumber}`,
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
                    whatsapp_number: data.data.whatsapp_number,
                    exists: data.data.exists,
                    client: data.data.client
                }
            }
        }

        // Gestion des erreurs
        switch (response.status) {
            case 400:
                const errorType = data.data?.errorType

                if (errorType === 'INVALID_WHATSAPP_NUMBER_FORMAT') {
                    return {
                        success: false,
                        message: "Format du numéro WhatsApp invalide. Utilisez le format international (ex: +2250102030405)",
                        errorType: errorType
                    }
                }

                return {
                    success: false,
                    message: data.message || "Format de numéro invalide",
                    errorType: errorType
                }

            case 401:
                const authErrorType = data.data?.errorType

                if (['TOKEN_MISSING', 'TOKEN_EXPIRED', 'TOKEN_INVALID'].includes(authErrorType)) {
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
        console.error('Erreur lors de la vérification du numéro WhatsApp:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Enregistre ou met à jour un client
 * @param {Object} clientData - Données du client
 * @param {string} clientData.whatsapp_number - Numéro WhatsApp (obligatoire)
 * @param {string} [clientData.full_name] - Nom complet
 * @param {string} [clientData.email] - Email
 * @param {string} [clientData.adresse] - Adresse
 * @returns {Promise<Object>} Résultat avec informations du client enregistré
 */
export const registerClient = async (clientData) => {
    try {
        const { whatsapp_number, full_name, email, adresse } = clientData

        if (!whatsapp_number) {
            return {
                success: false,
                message: "Le numéro WhatsApp est obligatoire"
            }
        }

        // Validation du format WhatsApp
        const whatsappValidation = validateWhatsAppNumber(whatsapp_number)
        if (!whatsappValidation.valid) {
            return {
                success: false,
                message: whatsappValidation.message
            }
        }

        // Validation de l'email si fourni
        if (email && !validateEmail(email)) {
            return {
                success: false,
                message: "Format d'email invalide"
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

        // Construire le body de la requête (ne pas envoyer de champs vides)
        const body = { whatsapp_number }
        if (full_name && full_name.trim()) body.full_name = full_name.trim()
        if (email && email.trim()) body.email = email.trim()
        if (adresse && adresse.trim()) body.adresse = adresse.trim()

        const response = await fetch(
            `${Constants.API.BASE_URL}/admin/clients/register-client`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(body)
            }
        )

        const data = await response.json()

        // Succès
        if (response.ok) {
            return {
                success: true,
                message: data.message,
                data: {
                    client: data.data.client,
                    is_new_client: data.data.is_new_client
                }
            }
        }

        // Gestion des erreurs
        switch (response.status) {
            case 400:
                const errorType = data.data?.errorType

                switch (errorType) {
                    case 'MISSING_WHATSAPP_NUMBER':
                        return {
                            success: false,
                            message: "Le numéro WhatsApp est obligatoire",
                            errorType: errorType
                        }

                    case 'INVALID_WHATSAPP_NUMBER_FORMAT':
                        return {
                            success: false,
                            message: "Format du numéro WhatsApp invalide. Utilisez le format international",
                            errorType: errorType
                        }

                    case 'INVALID_EMAIL_FORMAT':
                        return {
                            success: false,
                            message: "Format d'email invalide",
                            errorType: errorType
                        }

                    default:
                        return {
                            success: false,
                            message: data.message || "Données invalides",
                            errorType: errorType
                        }
                }

            case 401:
                const authErrorType = data.data?.errorType

                if (['TOKEN_MISSING', 'TOKEN_EXPIRED', 'TOKEN_INVALID'].includes(authErrorType)) {
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
        console.error('Erreur lors de l\'enregistrement du client:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Valide le format d'un numéro WhatsApp
 * @param {string} number - Numéro à valider
 * @returns {Object} Résultat de la validation
 */
export const validateWhatsAppNumber = (number) => {
    if (!number || typeof number !== 'string') {
        return {
            valid: false,
            message: "Numéro WhatsApp requis"
        }
    }

    const trimmedNumber = number.trim()

    // Vérifier le format international (doit commencer par +)
    if (!trimmedNumber.startsWith('+')) {
        return {
            valid: false,
            message: "Le numéro doit commencer par + (format international)"
        }
    }

    // Vérifier qu'il contient seulement des chiffres après le +
    const digitsOnly = trimmedNumber.slice(1)
    if (!/^\d+$/.test(digitsOnly)) {
        return {
            valid: false,
            message: "Le numéro ne doit contenir que des chiffres après le +"
        }
    }

    // Vérifier la longueur (minimum 8 chiffres, maximum 15 selon E.164)
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        return {
            valid: false,
            message: "Le numéro doit contenir entre 8 et 15 chiffres"
        }
    }

    return { valid: true }
}

/**
 * Valide le format d'un email
 * @param {string} email - Email à valider
 * @returns {boolean} True si valide
 */
export const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return false

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
}

/**
 * Formate un numéro WhatsApp pour l'affichage
 * @param {string} number - Numéro à formater
 * @returns {string} Numéro formaté
 */
export const formatWhatsAppNumber = (number) => {
    if (!number) return ''

    // Supprimer les espaces et retourner tel quel (déjà au format international)
    return number.trim()
}

/**
 * Nettoie et formate un numéro WhatsApp saisi par l'utilisateur
 * @param {string} input - Saisie utilisateur
 * @returns {string} Numéro nettoyé
 */
export const cleanWhatsAppInput = (input) => {
    if (!input) return ''

    // Supprimer les espaces, tirets, parenthèses
    let cleaned = input.replace(/[\s\-\(\)]/g, '')

    // Ajouter le + si pas présent et que ça commence par un chiffre
    if (/^\d/.test(cleaned)) {
        cleaned = '+' + cleaned
    }

    return cleaned
}

/**
 * Détermine si un client est "complet" (a plus que juste le WhatsApp)
 * @param {Object} client - Objet client
 * @returns {boolean} True si le client a des infos additionnelles
 */
export const isCompleteClient = (client) => {
    if (!client) return false

    return !!(client.full_name || client.email || client.adresse)
}

/**
 * Génère un nom d'affichage pour un client
 * @param {Object} client - Objet client
 * @returns {string} Nom à afficher
 */
export const getClientDisplayName = (client) => {
    if (!client) return 'Client inconnu'

    if (client.full_name && client.full_name.trim()) {
        return client.full_name.trim()
    }

    return `Client ${client.whatsapp_number || 'sans nom'}`
}

/**
 * Formate une date en français
 * @param {string} dateString - Date au format ISO
 * @param {boolean} includeTime - Inclure l'heure
 * @returns {string} Date formatée
 */
export const formatDate = (dateString, includeTime = true) => {
    if (!dateString) return ''

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

const clientManagementApi = {
    checkWhatsAppNumber,
    registerClient,
    validateWhatsAppNumber,
    validateEmail,
    formatWhatsAppNumber,
    cleanWhatsAppInput,
    isCompleteClient,
    getClientDisplayName,
    formatDate
}

export default clientManagementApi