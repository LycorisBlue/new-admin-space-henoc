'use client'

import { useState, useEffect } from 'react'
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import {
    createPayment,
    validatePaymentData,
    getPaymentMethodOptions,
    formatPaymentMethod,
    formatCurrency,
    getTodayISODate
} from '../../lib/api/admin/create-payment'

export default function CreatePaymentForm({ invoiceId, invoiceData, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        amount_paid: '',
        method: '',
        reference: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [fieldErrors, setFieldErrors] = useState({})

    const paymentMethodOptions = getPaymentMethodOptions()

    // Validation en temps réel
    useEffect(() => {
        if (Object.keys(fieldErrors).length > 0) {
            const validation = validatePaymentData({
                ...formData,
                payment_date: getTodayISODate()
            })

            if (validation.valid) {
                setFieldErrors({})
                setError(null)
            }
        }
    }, [formData, fieldErrors])

    // Calculs pour l'affichage
    const remainingAmount = invoiceData ? invoiceData.total_amount - (invoiceData.total_paid || 0) : 0
    const enteredAmount = parseFloat(formData.amount_paid) || 0
    const willExceedRemaining = enteredAmount > remainingAmount

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Supprimer l'erreur de ce champ si elle existe
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const validateForm = () => {
        const errors = {}

        // Validation du montant
        if (!formData.amount_paid || isNaN(formData.amount_paid) || parseFloat(formData.amount_paid) <= 0) {
            errors.amount_paid = "Le montant doit être positif"
        } else if (parseFloat(formData.amount_paid) > remainingAmount) {
            errors.amount_paid = `Le montant ne peut pas dépasser ${formatCurrency(remainingAmount)}`
        }

        // Validation de la méthode
        if (!formData.method) {
            errors.method = "Sélectionnez une méthode de paiement"
        }

        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            // Utiliser la date actuelle
            const paymentData = {
                ...formData,
                payment_date: getTodayISODate(),
                amount_paid: parseFloat(formData.amount_paid)
            }

            const result = await createPayment(invoiceId, paymentData)

            if (result.success) {
                toast.success(result.message || 'Paiement enregistré avec succès')

                // Réinitialiser le formulaire
                setFormData({
                    amount_paid: '',
                    method: '',
                    reference: ''
                })

                if (onSuccess) {
                    onSuccess(result.data)
                }
            } else {
                // Gestion des erreurs spécifiques
                if (result.errorType === 'PAYMENT_EXCEEDS_REMAINING' && result.paymentDetails) {
                    setError(`Le montant saisi (${formatCurrency(result.paymentDetails.paymentAttempt)}) dépasse le solde restant (${formatCurrency(result.paymentDetails.remainingAmount)})`)
                } else if (result.needsLogin) {
                    toast.error('Session expirée, veuillez vous reconnecter')
                    // La redirection sera gérée par le hook useAuth
                } else {
                    setError(result.message)
                }
            }
        } catch (err) {
            console.error('Erreur lors de l\'enregistrement du paiement:', err)
            setError('Erreur lors de l\'enregistrement du paiement')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            amount_paid: '',
            method: '',
            reference: ''
        })
        setError(null)
        setFieldErrors({})

        if (onCancel) {
            onCancel()
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <h3 className="font-medium text-gray-900">Enregistrer un paiement</h3>
                </div>
            </div>

            <div className="p-6">
                {/* Informations de la facture */}
                {invoiceData && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Montant total</p>
                                <p className="font-semibold text-gray-900">
                                    {formatCurrency(invoiceData.total_amount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Déjà payé</p>
                                <p className="font-semibold text-gray-900">
                                    {formatCurrency(invoiceData.total_paid || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Restant à payer</p>
                                <p className="font-semibold text-gray-900">
                                    {formatCurrency(remainingAmount)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Montant et Méthode de paiement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Montant */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Montant du paiement
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.amount_paid}
                                    onChange={(e) => handleInputChange('amount_paid', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 ${fieldErrors.amount_paid ? 'border-red-300' : 'border-gray-300'
                                        } ${willExceedRemaining && enteredAmount > 0 ? 'border-orange-300 bg-orange-50' : ''}`}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                    disabled={isSubmitting}
                                />
                                {willExceedRemaining && enteredAmount > 0 && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="w-5 h-5 text-orange-500" />
                                    </div>
                                )}
                            </div>
                            {fieldErrors.amount_paid && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.amount_paid}</p>
                            )}
                            {willExceedRemaining && enteredAmount > 0 && !fieldErrors.amount_paid && (
                                <p className="mt-1 text-sm text-orange-600">
                                    Attention : ce montant dépasse le solde restant
                                </p>
                            )}
                        </div>

                        {/* Méthode de paiement */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Méthode de paiement
                            </label>
                            <select
                                value={formData.method}
                                onChange={(e) => handleInputChange('method', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 ${fieldErrors.method ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                disabled={isSubmitting}
                            >
                                <option value="">Sélectionnez une méthode</option>
                                {paymentMethodOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.method && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.method}</p>
                            )}
                        </div>
                    </div>

                    {/* Référence (optionnel) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Référence de transaction <span className="text-gray-400">(optionnel)</span>
                        </label>
                        <input
                            type="text"
                            value={formData.reference}
                            onChange={(e) => handleInputChange('reference', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="Ex: TRX123456789"
                            disabled={isSubmitting}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Numéro de transaction ou référence du paiement
                        </p>
                    </div>

                    {/* Erreur globale */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                            disabled={isSubmitting || Object.keys(fieldErrors).length > 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Enregistrer le paiement
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}