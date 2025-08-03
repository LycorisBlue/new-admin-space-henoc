import Constants from '../../const.js'

/**
 * Crée une nouvelle facture pour une demande
 * @param {string} requestId - ID de la demande
 * @param {Object} invoiceData - Données de la facture
 * @param {Array} invoiceData.items - Articles de la facture
 * @param {Array} [invoiceData.fees] - Frais additionnels (optionnel)
 * @returns {Promise<Object>} Résultat de la création
 */
export const createInvoice = async (requestId, invoiceData) => {
    try {
        if (!requestId) {
            return {
                success: false,
                message: "ID de la demande requis"
            }
        }

        const { items, fees = [] } = invoiceData

        // Validation des articles
        if (!items || !Array.isArray(items) || items.length === 0) {
            return {
                success: false,
                message: "Au moins un article est requis"
            }
        }

        // Validation de chaque article
        for (const item of items) {
            if (!item.name || !item.unit_price || !item.quantity) {
                return {
                    success: false,
                    message: "Chaque article doit avoir un nom, un prix unitaire et une quantité"
                }
            }

            if (item.unit_price <= 0 || item.quantity <= 0) {
                return {
                    success: false,
                    message: "Le prix unitaire et la quantité doivent être des valeurs positives"
                }
            }
        }

        // Validation des frais si fournis
        for (const fee of fees) {
            if (!fee.fee_type_id || fee.amount === undefined) {
                return {
                    success: false,
                    message: "Chaque frais doit avoir un type et un montant"
                }
            }

            if (fee.amount < 0) {
                return {
                    success: false,
                    message: "Le montant des frais ne peut pas être négatif"
                }
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
            `${Constants.API.BASE_URL}/admin/requests/${requestId}/invoice`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ items, fees })
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
            case 400:
                const errorType = data.data?.errorType

                return {
                    success: false,
                    message: data.message,
                    errorType: errorType,
                    details: data.data
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
                    message: data.message || "Vous n'êtes pas autorisé à créer une facture pour cette demande",
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
        console.error('Erreur lors de la création de la facture:', error)
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Valide les données d'un article
 * @param {Object} item - Article à valider
 * @returns {Object} Résultat de la validation
 */
export const validateItem = (item) => {
    if (!item.name || item.name.trim() === '') {
        return {
            valid: false,
            message: "Le nom de l'article est requis"
        }
    }

    if (!item.unit_price || isNaN(item.unit_price) || item.unit_price <= 0) {
        return {
            valid: false,
            message: "Le prix unitaire doit être un nombre positif"
        }
    }

    if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0 || !Number.isInteger(Number(item.quantity))) {
        return {
            valid: false,
            message: "La quantité doit être un nombre entier positif"
        }
    }

    return {
        valid: true
    }
}

/**
 * Valide les données d'un frais
 * @param {Object} fee - Frais à valider
 * @returns {Object} Résultat de la validation
 */
export const validateFee = (fee) => {
    if (!fee.fee_type_id) {
        return {
            valid: false,
            message: "Le type de frais est requis"
        }
    }

    if (fee.amount === undefined || isNaN(fee.amount) || fee.amount < 0) {
        return {
            valid: false,
            message: "Le montant des frais doit être un nombre positif ou zéro"
        }
    }

    return {
        valid: true
    }
}

/**
 * Calcule le total d'une facture
 * @param {Array} items - Articles de la facture
 * @param {Array} fees - Frais de la facture
 * @returns {number} Total calculé
 */
export const calculateInvoiceTotal = (items = [], fees = []) => {
    const itemsTotal = items.reduce((sum, item) => {
        const unitPrice = parseFloat(item.unit_price) || 0
        const quantity = parseInt(item.quantity) || 0
        return sum + (unitPrice * quantity)
    }, 0)

    const feesTotal = fees.reduce((sum, fee) => {
        const amount = parseFloat(fee.amount) || 0
        return sum + amount
    }, 0)

    return itemsTotal + feesTotal
}

const createInvoiceApi = {
    createInvoice,
    validateItem,
    validateFee,
    calculateInvoiceTotal
}

export default createInvoiceApi