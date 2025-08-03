import Constants from '../../const.js'

/**
 * Récupère les détails complets d'une facture
 * @param {string} invoiceId - ID de la facture
 * @returns {Promise<Object>} Résultat avec les détails de la facture
 */
export const getInvoiceDetails = async (invoiceId) => {
    try {
        if (!invoiceId) {
            return {
                success: false,
                message: "ID de la facture requis"
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
            `${Constants.API.BASE_URL}/admin/invoices/${invoiceId}`,
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
        console.error('Erreur lors de la récupération des détails de la facture:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Formate le statut d'une facture
 * @param {string} status - Statut de la facture
 * @returns {string} Statut formaté
 */
export const formatInvoiceStatus = (status) => {
    const statusMap = {
        'en_attente': 'En attente',
        'payé': 'Payé',
        'annulé': 'Annulé'
    }
    return statusMap[status] || status
}

/**
 * Formate le statut de paiement
 * @param {string} paymentStatus - Statut de paiement
 * @returns {string} Statut formaté
 */
export const formatPaymentStatus = (paymentStatus) => {
    const statusMap = {
        'paid': 'Entièrement payé',
        'partial': 'Partiellement payé',
        'unpaid': 'Non payé'
    }
    return statusMap[paymentStatus] || paymentStatus
}

/**
 * Formate une méthode de paiement
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
 * Classes CSS pour badges de statut facture
 * @param {string} status - Statut de la facture
 * @returns {string} Classes CSS
 */
export const getInvoiceStatusBadgeClasses = (status) => {
    const statusClasses = {
        'en_attente': 'bg-amber-100 text-amber-800',
        'payé': 'bg-emerald-100 text-emerald-800',
        'annulé': 'bg-red-100 text-red-800'
    }
    return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Classes CSS pour badges de statut paiement
 * @param {string} paymentStatus - Statut de paiement
 * @returns {string} Classes CSS
 */
export const getPaymentStatusBadgeClasses = (paymentStatus) => {
    const statusClasses = {
        'paid': 'bg-green-100 text-green-800',
        'partial': 'bg-orange-100 text-orange-800',
        'unpaid': 'bg-red-100 text-red-800'
    }
    return statusClasses[paymentStatus] || 'bg-gray-100 text-gray-800'
}

/**
 * Classes CSS pour badges de méthode de paiement
 * @param {string} method - Méthode de paiement
 * @returns {string} Classes CSS
 */
export const getPaymentMethodBadgeClasses = (method) => {
    const methodClasses = {
        'wave': 'bg-blue-100 text-blue-800',
        'momo': 'bg-yellow-100 text-yellow-800',
        'orange_money': 'bg-orange-100 text-orange-800',
        'zeepay': 'bg-purple-100 text-purple-800',
        'cash': 'bg-gray-100 text-gray-800'
    }
    return methodClasses[method] || 'bg-gray-100 text-gray-800'
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
 * Calcule le pourcentage de paiement
 * @param {number} amountPaid - Montant payé
 * @param {number} totalAmount - Montant total
 * @returns {number} Pourcentage (0-100)
 */
export const calculatePaymentProgress = (amountPaid, totalAmount) => {
    if (!totalAmount || totalAmount === 0) return 0
    return Math.min(Math.round((amountPaid / totalAmount) * 100), 100)
}

/**
 * Détermine si une facture est entièrement payée
 * @param {number} amountPaid - Montant payé
 * @param {number} totalAmount - Montant total
 * @returns {boolean} True si entièrement payée
 */
export const isFullyPaid = (amountPaid, totalAmount) => {
    return amountPaid >= totalAmount
}

/**
 * Calcule le montant restant à payer
 * @param {number} totalAmount - Montant total
 * @param {number} amountPaid - Montant payé
 * @returns {number} Montant restant
 */
export const calculateRemainingAmount = (totalAmount, amountPaid) => {
    return Math.max(totalAmount - amountPaid, 0)
}

/**
 * Formate une date en français
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

const invoiceDetailsApi = {
    getInvoiceDetails,
    formatInvoiceStatus,
    formatPaymentStatus,
    formatPaymentMethod,
    getInvoiceStatusBadgeClasses,
    getPaymentStatusBadgeClasses,
    getPaymentMethodBadgeClasses,
    formatCurrency,
    calculatePaymentProgress,
    isFullyPaid,
    calculateRemainingAmount,
    formatDate
}

export default invoiceDetailsApi