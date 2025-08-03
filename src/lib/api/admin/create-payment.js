import Constants from '../../const.js'

/**
 * Enregistre un nouveau paiement pour une facture
 * @param {string} invoiceId - ID de la facture
 * @param {Object} paymentData - Données du paiement
 * @param {number} paymentData.amount_paid - Montant du paiement
 * @param {string} paymentData.method - Méthode de paiement
 * @param {string} paymentData.payment_date - Date du paiement (ISO format)
 * @param {string} [paymentData.reference] - Référence du paiement (optionnel)
 * @returns {Promise<Object>} Résultat de l'enregistrement
 */
export const createPayment = async (invoiceId, paymentData) => {
    try {
        if (!invoiceId) {
            return {
                success: false,
                message: "ID de la facture requis"
            }
        }

        // Validation des données requises
        const validation = validatePaymentData(paymentData)
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

        const { amount_paid, method, payment_date, reference } = paymentData

        const body = {
            amount_paid: parseFloat(amount_paid),
            method,
            payment_date
        }

        // Ajouter la référence si fournie
        if (reference && reference.trim()) {
            body.reference = reference.trim()
        }

        const response = await fetch(
            `${Constants.API.BASE_URL}/admin/invoices/${invoiceId}/payment`,
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
                    payment: data.data.payment,
                    invoice: data.data.invoice,
                    request: data.data.request
                }
            }
        }

        // Gestion des erreurs
        switch (response.status) {
            case 400:
                const errorType = data.data?.errorType

                // Messages spécifiques selon le type d'erreur
                switch (errorType) {
                    case 'MISSING_PAYMENT_DATA':
                        return {
                            success: false,
                            message: "Le montant, la méthode et la date de paiement sont requis",
                            errorType
                        }

                    case 'INVALID_PAYMENT_AMOUNT':
                        return {
                            success: false,
                            message: "Le montant du paiement doit être positif",
                            errorType
                        }

                    case 'INVALID_PAYMENT_METHOD':
                        return {
                            success: false,
                            message: data.message,
                            errorType,
                            validMethods: data.data?.validMethods
                        }

                    case 'INVALID_DATE_FORMAT':
                        return {
                            success: false,
                            message: "Le format de la date de paiement est invalide",
                            errorType
                        }

                    case 'INVOICE_CANCELLED':
                        return {
                            success: false,
                            message: "Impossible d'ajouter un paiement à une facture annulée",
                            errorType
                        }

                    case 'PAYMENT_EXCEEDS_REMAINING':
                        return {
                            success: false,
                            message: data.message,
                            errorType,
                            paymentDetails: {
                                totalAmount: data.data?.total_amount,
                                alreadyPaid: data.data?.already_paid,
                                remainingAmount: data.data?.remaining_amount,
                                paymentAttempt: data.data?.payment_attempt
                            }
                        }

                    default:
                        return {
                            success: false,
                            message: data.message || "Données de paiement invalides",
                            errorType
                        }
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
                    message: data.message || "Accès refusé - Privilèges insuffisants",
                    errorType: data.data?.errorType || 'INSUFFICIENT_PRIVILEGES',
                    requiredRoles: data.data?.requiredRoles,
                    userRole: data.data?.userRole
                }

            case 404:
                return {
                    success: false,
                    message: data.message || "Facture non trouvée",
                    errorType: data.data?.errorType || 'INVOICE_NOT_FOUND'
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
        console.error('Erreur lors de l\'enregistrement du paiement:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Valide les données de paiement côté client
 * @param {Object} paymentData - Données à valider
 * @returns {Object} Résultat de la validation
 */
export const validatePaymentData = (paymentData) => {
    if (!paymentData) {
        return {
            valid: false,
            message: "Données de paiement requises"
        }
    }

    const { amount_paid, method, payment_date } = paymentData

    // Validation du montant
    if (!amount_paid || isNaN(amount_paid) || parseFloat(amount_paid) <= 0) {
        return {
            valid: false,
            message: "Le montant du paiement doit être un nombre positif"
        }
    }

    // Validation de la méthode
    const validMethods = ['wave', 'momo', 'orange_money', 'zeepay', 'cash']
    if (!method || !validMethods.includes(method)) {
        return {
            valid: false,
            message: `Méthode de paiement invalide. Valeurs acceptées: ${validMethods.join(', ')}`
        }
    }

    // Validation de la date
    if (!payment_date) {
        return {
            valid: false,
            message: "La date de paiement est requise"
        }
    }

    // Vérifier que la date est valide
    const date = new Date(payment_date)
    if (isNaN(date.getTime())) {
        return {
            valid: false,
            message: "Format de date invalide"
        }
    }

    // Vérifier que la date n'est pas dans le futur
    if (date > new Date()) {
        return {
            valid: false,
            message: "La date de paiement ne peut pas être dans le futur"
        }
    }

    return { valid: true }
}

/**
 * Options de méthodes de paiement
 * @returns {Array} Liste des méthodes de paiement disponibles
 */
export const getPaymentMethodOptions = () => [
    { value: 'wave', label: 'Wave' },
    { value: 'momo', label: 'Mobile Money' },
    { value: 'orange_money', label: 'Orange Money' },
    { value: 'zeepay', label: 'Zeepay' },
    { value: 'cash', label: 'Espèces' }
]

/**
 * Formate une méthode de paiement pour l'affichage
 * @param {string} method - Méthode de paiement
 * @returns {string} Méthode formatée
 */
export const formatPaymentMethod = (method) => {
    const methodMap = {
        'wave': 'Wave',
        'momo': 'Mobile Money',
        'orange_money': 'Orange Money',
        'zeepay': 'Zeepay',
        'cash': 'Espèces'
    }
    return methodMap[method] || method
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
 * Génère une date au format ISO pour aujourd'hui
 * @returns {string} Date ISO
 */
export const getTodayISODate = () => {
    return new Date().toISOString()
}

const createPaymentApi = {
    createPayment,
    validatePaymentData,
    getPaymentMethodOptions,
    formatPaymentMethod,
    formatCurrency,
    getTodayISODate
}

export default createPaymentApi