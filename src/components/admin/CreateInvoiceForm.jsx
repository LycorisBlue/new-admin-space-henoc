'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createInvoice, validateItem, validateFee, calculateInvoiceTotal } from '../../lib/api/admin/create-invoice'

export default function CreateInvoiceForm({ requestId, onSuccess }) {
    const router = useRouter()

    // État principal
    const [items, setItems] = useState([{ name: '', unit_price: '', quantity: 1 }])
    const [fees, setFees] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)

    // Types de frais (simulation - à remplacer par API)
    const [feeTypes] = useState([
        { id: '1', name: 'Livraison', description: 'Frais de livraison standard' },
        { id: '2', name: 'Emballage', description: 'Frais d\'emballage' },
        { id: '3', name: 'Installation', description: 'Frais d\'installation' }
    ])

    // Redistribution des frais
    const [redistribution, setRedistribution] = useState({
        enabled: false,
        amount: '',
        method: 'proportional'
    })

    // État d'affichage pour éviter le problème des inputs number
    const [displayValues, setDisplayValues] = useState({})

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    // Gestion articles
    const addItem = () => {
        setItems([...items, { name: '', unit_price: '', quantity: 1 }])
    }

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const updateItem = (index, field, value) => {
        const newItems = [...items]

        if (field === 'unit_price' || field === 'quantity') {
            // Gérer la valeur vide pour éviter le problème du 0
            newItems[index][field] = value === '' ? '' : parseFloat(value) || 0
        } else {
            newItems[index][field] = value
        }

        setItems(newItems)
    }

    // Gestion frais
    const addFee = (feeTypeId) => {
        if (fees.find(fee => fee.fee_type_id === feeTypeId)) {
            setError('Ce type de frais est déjà ajouté')
            return
        }
        setFees([...fees, { fee_type_id: feeTypeId, amount: '' }])
    }

    const removeFee = (index) => {
        setFees(fees.filter((_, i) => i !== index))
    }

    const updateFee = (index, amount) => {
        const newFees = [...fees]
        newFees[index].amount = amount === '' ? '' : parseFloat(amount) || 0
        setFees(newFees)
    }

    // Calculs redistribution
    const calculateRedistribution = () => {
        if (!redistribution.enabled || !redistribution.amount) return []

        const validItems = items.filter(item => item.name.trim() && item.unit_price > 0 && item.quantity > 0)
        const totalOriginal = validItems.reduce((sum, item) => sum + (parseFloat(item.unit_price) * item.quantity), 0)
        const redistributionAmount = parseFloat(redistribution.amount) || 0

        if (totalOriginal === 0) return []

        return validItems.map((item, index) => {
            const originalSubtotal = parseFloat(item.unit_price) * item.quantity
            const weight = originalSubtotal / totalOriginal

            const redistributedAmount = redistribution.method === 'proportional'
                ? redistributionAmount * weight
                : redistributionAmount / validItems.length

            const newUnitPrice = (originalSubtotal + redistributedAmount) / item.quantity

            return {
                index,
                originalSubtotal,
                redistributedAmount,
                newUnitPrice,
                weight: weight * 100
            }
        })
    }

    const getAdjustedPrice = (item, index) => {
        if (!redistribution.enabled) return parseFloat(item.unit_price) || 0

        const redistributionDetails = calculateRedistribution()
        const detail = redistributionDetails.find(d => d.index === index)
        return detail ? detail.newUnitPrice : parseFloat(item.unit_price) || 0
    }

    const getRedistributedAmount = (index) => {
        if (!redistribution.enabled) return 0
        const redistributionDetails = calculateRedistribution()
        const detail = redistributionDetails.find(d => d.index === index)
        return detail ? detail.redistributedAmount : 0
    }

    // Calculs totaux
    const calculateItemsTotal = () => {
        return items.reduce((sum, item, index) => {
            const adjustedPrice = getAdjustedPrice(item, index)
            return sum + (adjustedPrice * item.quantity)
        }, 0)
    }

    const calculateFeesTotal = () => {
        return fees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0)
    }

    const calculateOriginalTotal = () => {
        return items.reduce((sum, item) => sum + ((parseFloat(item.unit_price) || 0) * item.quantity), 0)
    }

    const calculateGrandTotal = () => {
        return calculateItemsTotal() + calculateFeesTotal()
    }

    // Validation
    const validateForm = () => {
        setError(null)

        // Validation articles
        for (const [index, item] of items.entries()) {
            const validation = validateItem({
                name: item.name,
                unit_price: parseFloat(item.unit_price) || 0,
                quantity: item.quantity
            })

            if (!validation.valid) {
                setError(`Article ${index + 1}: ${validation.message}`)
                return false
            }
        }

        // Validation frais
        for (const [index, fee] of fees.entries()) {
            const validation = validateFee({
                fee_type_id: fee.fee_type_id,
                amount: parseFloat(fee.amount) || 0
            })

            if (!validation.valid) {
                const feeType = feeTypes.find(t => t.id === fee.fee_type_id)
                setError(`Frais ${feeType?.name || index + 1}: ${validation.message}`)
                return false
            }
        }

        // Validation redistribution
        if (redistribution.enabled && (!redistribution.amount || parseFloat(redistribution.amount) <= 0)) {
            setError('Le montant à redistribuer doit être supérieur à 0')
            return false
        }

        return true
    }

    // Soumission
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        setError(null)

        try {
            // Préparer les données
            const finalItems = items.map((item, index) => {
                const baseItem = {
                    name: item.name,
                    unit_price: getAdjustedPrice(item, index),
                    quantity: item.quantity
                }

                // Ajouter métadonnées si redistribution
                if (redistribution.enabled) {
                    baseItem.original_unit_price = parseFloat(item.unit_price) || 0
                    baseItem.redistributed_amount = getRedistributedAmount(index)
                }

                return baseItem
            })

            const finalFees = fees.map(fee => ({
                fee_type_id: fee.fee_type_id,
                amount: parseFloat(fee.amount) || 0
            }))

            const result = await createInvoice(requestId, {
                items: finalItems,
                fees: finalFees.length > 0 ? finalFees : undefined
            })

            if (result.success) {
                if (onSuccess) {
                    onSuccess()
                } else {
                    router.push(`/dashboard/requests/${requestId}`)
                }
            } else {
                setError(result.message)
            }
        } catch (err) {
            console.error('Erreur création facture:', err)
            setError('Erreur lors de la création de la facture')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Créer la facture</h2>
                <p className="text-sm text-gray-500 mt-1">Ajoutez les articles et frais pour cette demande</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Redistribution des frais */}
                <div className="border border-gray-200 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Redistribution des frais</h3>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={redistribution.enabled}
                                onChange={(e) => setRedistribution(prev => ({
                                    ...prev,
                                    enabled: e.target.checked
                                }))}
                                className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Activer</span>
                        </label>
                    </div>

                    {redistribution.enabled && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Montant à redistribuer
                                    </label>
                                    <input
                                        type="number"
                                        value={redistribution.amount}
                                        onChange={(e) => setRedistribution(prev => ({
                                            ...prev,
                                            amount: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Méthode
                                    </label>
                                    <select
                                        value={redistribution.method}
                                        onChange={(e) => setRedistribution(prev => ({
                                            ...prev,
                                            method: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="proportional">Proportionnelle</option>
                                        <option value="equal">Égale</option>
                                    </select>
                                </div>
                            </div>

                            {redistribution.amount && parseFloat(redistribution.amount) > 0 && (
                                <div className="bg-blue-100 p-3 rounded-md">
                                    <p className="text-sm text-gray-800">
                                        {formatCurrency(parseFloat(redistribution.amount))} seront répartis
                                        {redistribution.method === 'proportional' ? ' proportionnellement' : ' également'}
                                        sur les articles
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Articles */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Articles</h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Ajouter un article
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="grid grid-cols-12 gap-4 items-end">
                                    <div className="col-span-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nom de l'article
                                        </label>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            placeholder="ex: Smartphone XYZ"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Prix unitaire {redistribution.enabled ? '(original)' : ''}
                                        </label>
                                        <input
                                            type="number"
                                            value={item.unit_price}
                                            onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantité
                                        </label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            placeholder="1"
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center justify-between">
                                        <div className="text-right">
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatCurrency(getAdjustedPrice(item, index) * item.quantity)}
                                            </span>
                                            {redistribution.enabled && (
                                                <div className="text-xs text-gray-500">
                                                    Original: {formatCurrency((parseFloat(item.unit_price) || 0) * item.quantity)}
                                                </div>
                                            )}
                                        </div>
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="text-gray-400 hover:text-red-500 ml-2"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Détails redistribution */}
                                {redistribution.enabled && redistribution.amount && parseFloat(redistribution.amount) > 0 && (
                                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <div className="text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Prix ajusté:</span>
                                                <span className="font-medium text-gray-800">
                                                    {formatCurrency(getAdjustedPrice(item, index))}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Frais redistribués:</span>
                                                <span className="text-gray-800">
                                                    +{formatCurrency(getRedistributedAmount(index))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Frais */}
                <div>
                    <h3 className="font-medium text-gray-900 mb-4">Frais additionnels</h3>

                    {fees.length > 0 && (
                        <div className="space-y-4 mb-4">
                            {fees.map((fee, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-8">
                                            <span className="text-sm font-medium text-gray-900">
                                                {feeTypes.find(type => type.id === fee.fee_type_id)?.name}
                                            </span>
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="number"
                                                value={fee.amount}
                                                onChange={(e) => updateFee(index, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                placeholder="0"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeFee(index)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                addFee(e.target.value)
                                e.target.value = ''
                            }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        <option value="">Ajouter un frais...</option>
                        {feeTypes.map((type) => (
                            <option
                                key={type.id}
                                value={type.id}
                                disabled={fees.some(fee => fee.fee_type_id === type.id)}
                            >
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Récapitulatif */}
                <div className="border border-gray-200 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Récapitulatif</h3>

                    <div className="space-y-2">
                        {redistribution.enabled && redistribution.amount && parseFloat(redistribution.amount) > 0 && (
                            <>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Total original articles:</span>
                                    <span>{formatCurrency(calculateOriginalTotal())}</span>
                                </div>
                                <div className="flex justify-between text-sm text-blue-600">
                                    <span>+ Frais redistribués:</span>
                                    <span>{formatCurrency(parseFloat(redistribution.amount))}</span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Total articles:</span>
                            <span className="text-sm font-medium">{formatCurrency(calculateItemsTotal())}</span>
                        </div>

                        {fees.length > 0 && (
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Total frais:</span>
                                <span className="text-sm font-medium">{formatCurrency(calculateFeesTotal())}</span>
                            </div>
                        )}

                        <div className="border-t pt-3">
                            <div className="flex justify-between">
                                <span className="text-lg font-medium text-gray-900">Total facture</span>
                                <span className="text-2xl font-bold text-gray-900">{formatCurrency(calculateGrandTotal())}</span>
                            </div>
                        </div>

                        {redistribution.enabled && redistribution.amount && parseFloat(redistribution.amount) > 0 && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-700">
                                    <strong>Client :</strong> Les frais de {formatCurrency(parseFloat(redistribution.amount))} sont
                                    intégrés dans les prix. Total visible : {formatCurrency(calculateGrandTotal())}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.push(`/dashboard/requests/${requestId}`)}
                        className="px-6 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Création...' : 'Créer la facture'}
                    </button>
                </div>
            </form>
        </div>
    )
}