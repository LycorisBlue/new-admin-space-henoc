'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, MapPin, Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
    checkWhatsAppNumber,
    registerClient,
    validateWhatsAppNumber,
    validateEmail,
    cleanWhatsAppInput,
    getClientDisplayName
} from '../../lib/api/admin/client-management'

export default function ClientRegistrationModal({
    isOpen,
    onClose,
    initialWhatsApp = '',
    onSuccess
}) {
    const [step, setStep] = useState('check') // 'check', 'form', 'success'
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [existingClient, setExistingClient] = useState(null)

    // États du formulaire
    const [formData, setFormData] = useState({
        whatsapp_number: '',
        full_name: '',
        email: '',
        adresse: ''
    })

    const [fieldErrors, setFieldErrors] = useState({})

    // Initialisation quand le modal s'ouvre
    useEffect(() => {
        if (isOpen) {
            const cleanedNumber = cleanWhatsAppInput(initialWhatsApp)
            setFormData({
                whatsapp_number: cleanedNumber,
                full_name: '',
                email: '',
                adresse: ''
            })
            setStep('check')
            setError(null)
            setFieldErrors({})
            setExistingClient(null)

            // Vérifier automatiquement si un numéro est fourni
            if (cleanedNumber) {
                handleCheckWhatsApp(cleanedNumber)
            }
        }
    }, [isOpen, initialWhatsApp])

    // Vérification du numéro WhatsApp
    const handleCheckWhatsApp = async (number = formData.whatsapp_number) => {
        const validation = validateWhatsAppNumber(number)
        if (!validation.valid) {
            setError(validation.message)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const result = await checkWhatsAppNumber(number)

            if (result.success) {
                if (result.data.exists && result.data.client) {
                    // Client existe déjà - pré-remplir les données
                    setExistingClient(result.data.client)
                    setFormData({
                        whatsapp_number: result.data.client.whatsapp_number,
                        full_name: result.data.client.full_name || '',
                        email: result.data.client.email || '',
                        adresse: result.data.client.adresse || ''
                    })
                    setStep('form')
                } else {
                    // Nouveau client
                    setExistingClient(null)
                    setFormData(prev => ({ ...prev, whatsapp_number: number }))
                    setStep('form')
                }
            } else {
                if (result.needsLogin) {
                    onClose()
                    return
                }
                setError(result.message)
            }
        } catch (err) {
            setError('Erreur lors de la vérification du numéro')
        } finally {
            setIsLoading(false)
        }
    }

    // Validation en temps réel
    const validateField = (name, value) => {
        const errors = { ...fieldErrors }

        switch (name) {
            case 'whatsapp_number':
                const whatsappValidation = validateWhatsAppNumber(value)
                if (!whatsappValidation.valid) {
                    errors.whatsapp_number = whatsappValidation.message
                } else {
                    delete errors.whatsapp_number
                }
                break

            case 'email':
                if (value && !validateEmail(value)) {
                    errors.email = 'Format d\'email invalide'
                } else {
                    delete errors.email
                }
                break

            case 'full_name':
                if (value && value.trim().length < 2) {
                    errors.full_name = 'Le nom doit contenir au moins 2 caractères'
                } else {
                    delete errors.full_name
                }
                break

            default:
                break
        }

        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Gestion des changements de champs
    const handleInputChange = (name, value) => {
        let processedValue = value

        // Nettoyage spécial pour WhatsApp
        if (name === 'whatsapp_number') {
            processedValue = cleanWhatsAppInput(value)
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }))

        // Validation en temps réel
        validateField(name, processedValue)
    }

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation complète
        let hasErrors = false
        Object.keys(formData).forEach(key => {
            if (!validateField(key, formData[key])) {
                hasErrors = true
            }
        })

        if (hasErrors) {
            setError('Veuillez corriger les erreurs dans le formulaire')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const result = await registerClient(formData)

            if (result.success) {
                setStep('success')
                toast.success(
                    result.data.is_new_client
                        ? 'Client enregistré avec succès'
                        : 'Informations client mises à jour'
                )

                // Notifier le parent après un délai
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess(result.data.client, result.data.is_new_client)
                    }
                    handleClose()
                }, 2000)
            } else {
                if (result.needsLogin) {
                    onClose()
                    return
                }
                setError(result.message)
            }
        } catch (err) {
            setError('Erreur lors de l\'enregistrement du client')
        } finally {
            setIsLoading(false)
        }
    }

    // Fermeture du modal
    const handleClose = () => {
        setStep('check')
        setFormData({
            whatsapp_number: '',
            full_name: '',
            email: '',
            adresse: ''
        })
        setError(null)
        setFieldErrors({})
        setExistingClient(null)
        onClose()
    }

    // Retour à la vérification
    const handleBackToCheck = () => {
        setStep('check')
        setError(null)
        setExistingClient(null)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                {step === 'success' ? 'Succès' : 'Enregistrement client'}
                            </h3>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={isLoading}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Étape 1: Vérification */}
                    {step === 'check' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Entrez le numéro WhatsApp pour vérifier s'il est déjà enregistré
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Numéro WhatsApp
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={formData.whatsapp_number}
                                        onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 ${fieldErrors.whatsapp_number ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="+2250102030405"
                                        disabled={isLoading}
                                    />
                                </div>
                                {fieldErrors.whatsapp_number && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.whatsapp_number}</p>
                                )}
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => handleCheckWhatsApp()}
                                disabled={isLoading || !formData.whatsapp_number || fieldErrors.whatsapp_number}
                                className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Vérification...
                                    </>
                                ) : (
                                    'Vérifier le numéro'
                                )}
                            </button>
                        </div>
                    )}

                    {/* Étape 2: Formulaire */}
                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {existingClient && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                        <p className="text-sm text-blue-700">
                                            Client trouvé : {getClientDisplayName(existingClient)}
                                        </p>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Vous pouvez mettre à jour ses informations ci-dessous
                                    </p>
                                </div>
                            )}

                            {/* Numéro WhatsApp (lecture seule) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Numéro WhatsApp
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={formData.whatsapp_number}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                        disabled
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleBackToCheck}
                                    className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                                    disabled={isLoading}
                                >
                                    Modifier le numéro
                                </button>
                            </div>

                            {/* Nom complet */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom complet <span className="text-gray-400">(optionnel)</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 ${fieldErrors.full_name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Jean Dupont"
                                        disabled={isLoading}
                                    />
                                </div>
                                {fieldErrors.full_name && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.full_name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-gray-400">(optionnel)</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 ${fieldErrors.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="jean.dupont@example.com"
                                        disabled={isLoading}
                                    />
                                </div>
                                {fieldErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                                )}
                            </div>

                            {/* Adresse */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Adresse <span className="text-gray-400">(optionnel)</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                    <textarea
                                        value={formData.adresse}
                                        onChange={(e) => handleInputChange('adresse', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        placeholder="123 Rue Exemple, Abidjan"
                                        rows={2}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    disabled={isLoading}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || Object.keys(fieldErrors).length > 0}
                                    className="flex-1 py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        existingClient ? 'Mettre à jour' : 'Enregistrer'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Étape 3: Succès */}
                    {step === 'success' && (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    {existingClient ? 'Informations mises à jour' : 'Client enregistré'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {existingClient
                                        ? 'Les informations du client ont été mises à jour avec succès'
                                        : 'Le nouveau client a été enregistré dans le système'
                                    }
                                </p>
                            </div>
                            <div className="animate-pulse">
                                <p className="text-xs text-gray-500">Fermeture automatique...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}