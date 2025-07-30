'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateInvoiceForm({ requestId, onSuccess }) {
    const router = useRouter()
    const [items, setItems] = useState([{ name: '', unit_price: 0, quantity: 1 }])
    const [fees, setFees] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [feeTypes] = useState([
        { id: '1', name: 'Livraison' },
        { id: '2', name: 'Emballage' }
    ])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount)
    }

    const addItem = () => setItems([...items, { name: '', unit_price: 0, quantity: 1 }])
    const removeItem = (index) => items.length > 1 && setItems(items.filter((_, i) => i !== index))

    const updateItem = (index, field, value) => {
        const newItems = [...items]
        newItems[index][field] = (field === 'unit_price' || field === 'quantity')
            ? parseFloat(value) || 0
            : value
        setItems(newItems)
    }

    const addFee = (feeTypeId) => {
        if (!fees.find(fee => fee.fee_type_id === feeTypeId)) {
            setFees([...fees, { fee_type_id: feeTypeId, amount: 0 }])
        }
    }

    const removeFee = (index) => setFees(fees.filter((_, i) => i !== index))
    const updateFee = (index, amount) => {
        const newFees = [...fees]
        newFees[index].amount = amount
        setFees(newFees)
    }

    const calculateTotal = () => {
        const itemsTotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
        const feesTotal = fees.reduce((sum, fee) => sum + fee.amount, 0)
        return itemsTotal + feesTotal
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setTimeout(() => {
            setIsSubmitting(false)
            if (onSuccess) onSuccess()
        }, 1000)
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Créer la facture</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
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
                                            Prix unitaire
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
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            placeholder="1"
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatCurrency(item.unit_price * item.quantity)}
                                        </span>
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
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
                                                onChange={(e) => updateFee(index, parseFloat(e.target.value) || 0)}
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

                {/* Total */}
                <div className="bg-gray-50 p-4 rounded-lg border-t-2 border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-900">Total de la facture</span>
                        <span className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotal())}</span>
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