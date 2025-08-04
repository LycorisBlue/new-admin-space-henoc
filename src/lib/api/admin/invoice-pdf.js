import Constants from '../../const.js'

/**
 * Génère et télécharge le PDF d'une facture
 * @param {string} invoiceId - ID de la facture
 * @returns {Promise<Object>} Résultat de la génération
 */
export const downloadInvoicePdf = async (invoiceId) => {
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
            `${Constants.API.BASE_URL}/admin/invoices/${invoiceId}/pdf`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        )

        // Succès - fichier PDF reçu
        if (response.ok) {
            // Récupérer le nom du fichier depuis les headers
            const contentDisposition = response.headers.get('Content-Disposition')
            let filename = `facture_${invoiceId.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
                if (filenameMatch) {
                    filename = filenameMatch[1]
                }
            }

            // Convertir la réponse en blob
            const blob = await response.blob()

            // Créer un lien de téléchargement et le déclencher
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()

            // Nettoyer
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            return {
                success: true,
                message: "PDF téléchargé avec succès",
                filename: filename
            }
        }

        // Gestion des erreurs avec contenu JSON
        const data = await response.json()

        switch (response.status) {
            case 400:
                const errorType = data.data?.errorType

                if (errorType === 'NO_ITEMS') {
                    return {
                        success: false,
                        message: "La facture ne contient aucun article et ne peut pas être convertie en PDF",
                        errorType: errorType
                    }
                }

                return {
                    success: false,
                    message: data.message || "Données de facture invalides pour la génération PDF",
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

            case 403:
                return {
                    success: false,
                    message: data.message || "Accès refusé - Privilèges insuffisants",
                    errorType: data.data?.errorType || 'ACCESS_DENIED'
                }

            case 404:
                return {
                    success: false,
                    message: data.message || "Facture non trouvée",
                    errorType: data.data?.errorType || 'INVOICE_NOT_FOUND'
                }

            case 500:
                const serverErrorType = data.data?.errorType

                if (serverErrorType === 'PDF_GENERATION_ERROR') {
                    return {
                        success: false,
                        message: "Erreur lors de la génération du PDF. Veuillez réessayer.",
                        errorType: serverErrorType,
                        technicalError: data.data?.error
                    }
                }

                return {
                    success: false,
                    message: data.message || "Erreur interne du serveur",
                    errorType: serverErrorType || 'SERVER_ERROR'
                }

            default:
                return {
                    success: false,
                    message: "Une erreur inattendue s'est produite lors de la génération du PDF"
                }
        }

    } catch (error) {
        console.error('Erreur lors du téléchargement du PDF:', error)

        // Erreur réseau ou de parsing
        return {
            success: false,
            message: "Erreur de connexion. Vérifiez votre connexion internet."
        }
    }
}

/**
 * Génère l'URL de téléchargement PDF (pour liens directs)
 * @param {string} invoiceId - ID de la facture
 * @returns {string} URL de téléchargement
 */
export const getInvoicePdfUrl = (invoiceId) => {
    if (!invoiceId) {
        throw new Error('ID de facture requis pour générer l\'URL PDF')
    }

    return `${Constants.API.BASE_URL}/admin/invoices/${invoiceId}/pdf`
}

/**
 * Vérifie si le téléchargement PDF est disponible pour une facture
 * @param {Object} invoice - Objet facture
 * @returns {Object} Statut de disponibilité
 */
export const isPdfDownloadAvailable = (invoice) => {
    if (!invoice) {
        return {
            available: false,
            reason: "Facture non fournie"
        }
    }

    // Vérifier que la facture a des articles
    if (!invoice.items || invoice.items.length === 0) {
        return {
            available: false,
            reason: "La facture ne contient aucun article"
        }
    }

    // Vérifier que la facture n'est pas dans un état incompatible
    if (invoice.status === 'brouillon') {
        return {
            available: false,
            reason: "Les factures brouillon ne peuvent pas être téléchargées"
        }
    }

    return {
        available: true,
        reason: null
    }
}

/**
 * Formate le nom de fichier PDF selon les conventions
 * @param {string} invoiceId - ID de la facture
 * @param {string} [clientName] - Nom du client (optionnel)
 * @returns {string} Nom de fichier formaté
 */
export const formatPdfFilename = (invoiceId, clientName = null) => {
    const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const shortId = invoiceId.substring(0, 8)

    if (clientName) {
        // Nettoyer le nom du client pour le nom de fichier
        const cleanClientName = clientName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')

        return `facture_${shortId}_${cleanClientName}_${date}.pdf`
    }

    return `facture_${shortId}_${date}.pdf`
}

const invoicePdfApi = {
    downloadInvoicePdf,
    getInvoicePdfUrl,
    isPdfDownloadAvailable,
    formatPdfFilename
}

export default invoicePdfApi