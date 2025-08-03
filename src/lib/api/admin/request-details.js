import Constants from '../../const.js'

/**
 * Récupère les détails complets d'une demande spécifique
 * @param {string} requestId - ID de la demande à récupérer
 * @returns {Promise<Object>} Résultat avec les détails de la demande
 */
export const getRequestDetails = async (requestId) => {
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

        const response = await fetch(
            `${Constants.API.BASE_URL}/admin/requests/${requestId}`,
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
                data: data.data
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
        console.error('Erreur lors de la récupération des détails de la demande:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Formatte les méthodes de paiement
 * @param {string} method - Méthode de paiement
 * @returns {string} Nom formaté
 */
export const formatPaymentMethod = (method) => {
    const methods = {
        'wave': 'Wave',
        'momo': 'Mobile Money',
        'orange_money': 'Orange Money',
        'zeepay': 'Zeepay',
        'cash': 'Espèces'
    }
    return methods[method] || method
}

/**
 * Formatte le statut d'une facture
 * @param {string} status - Statut de la facture
 * @returns {string} Statut formaté
 */
export const formatInvoiceStatus = (status) => {
    const statuses = {
        'en_attente': 'En attente',
        'payé': 'Payé',
        'annulé': 'Annulé'
    }
    return statuses[status] || status
}

/**
 * Classes CSS pour les badges de statut de facture
 * @param {string} status - Statut de la facture
 * @returns {string} Classes CSS
 */
export const getInvoiceStatusBadgeClasses = (status) => {
    const classes = {
        'en_attente': 'bg-amber-100 text-amber-800',
        'payé': 'bg-green-100 text-green-800',
        'annulé': 'bg-red-100 text-red-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Classes CSS pour les badges de méthode de paiement
 * @param {string} method - Méthode de paiement
 * @returns {string} Classes CSS
 */
export const getPaymentMethodBadgeClasses = (method) => {
    const classes = {
        'wave': 'bg-blue-100 text-blue-800',
        'momo': 'bg-yellow-100 text-yellow-800',
        'orange_money': 'bg-orange-100 text-orange-800',
        'zeepay': 'bg-purple-100 text-purple-800',
        'cash': 'bg-gray-100 text-gray-800'
    }
    return classes[method] || 'bg-gray-100 text-gray-800'
}

/**
 * Formatte un montant en devise
 * @param {number} amount - Montant à formater
 * @param {string} currency - Code de devise
 * @returns {string} Montant formaté
 */
export const formatCurrency = (amount, currency = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

/**
 * Calcule le montant total payé pour une facture
 * @param {Array} payments - Liste des paiements
 * @returns {number} Montant total payé
 */
export const calculateTotalPaid = (payments = []) => {
    return payments.reduce((total, payment) => total + payment.amount_paid, 0)
}

/**
 * Détermine si une facture est complètement payée
 * @param {number} totalAmount - Montant total de la facture
 * @param {Array} payments - Liste des paiements
 * @returns {boolean} True si complètement payée
 */
export const isFullyPaid = (totalAmount, payments = []) => {
    const totalPaid = calculateTotalPaid(payments)
    return totalPaid >= totalAmount
}

/**
 * Formatte une date en français
 * @param {string} dateString - Date au format ISO
 * @param {boolean} includeTime - Inclure l'heure
 * @returns {string} Date formatée
 */
export const formatDate = (dateString, includeTime = true) => {
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

const requestDetailsApi = {
    getRequestDetails,
    formatPaymentMethod,
    formatInvoiceStatus,
    getInvoiceStatusBadgeClasses,
    getPaymentMethodBadgeClasses,
    formatCurrency,
    calculateTotalPaid,
    isFullyPaid,
    formatDate
}

export default requestDetailsApi