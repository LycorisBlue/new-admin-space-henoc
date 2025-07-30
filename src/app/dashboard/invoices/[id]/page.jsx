'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function InvoiceDetailsPage() {
    const params = useParams()
    const invoiceId = params.id
    const [invoice, setInvoice] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadInvoiceDetails = async () => {
            try {
                setIsLoading(true)
                setTimeout(() => {
                    setInvoice({
                        id: invoiceId,
                        number: 'F-2024-001',
                        status: 'en_attente',
                        total_amount: 1250.00,
                        created_at: new Date().toISOString(),
                        request: {
                            id: 'req123',
                            client: { full_name: 'Client Test', whatsapp_number: '+1234567890' }
                        },
                        items: [
                            { name: 'Smartphone XYZ', unit_price: 500, quantity: 2 },
                            { name: 'Accessoire ABC', unit_price: 25, quantity: 10 }
                        ],
                        fees: [
                            { fee_type: { name: 'Livraison' }, amount: 50 }
                        ]
                    })
                    setIsLoading(false)
                }, 1000)
            } catch (err) {
                setError("Impossible de charger les détails de la facture.")
                setIsLoading(false)
            }
        }

        loadInvoiceDetails()
    }, [invoiceId])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount)
    }

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Détails de la facture</h1>
                <p className="mt-1 text-sm text-gray-500">Consultez les informations de cette facture</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <nav className="flex text-sm text-gray-500">
                    <Link href="/dashboard" className="hover:text-gray-700">Administration</Link>
                    <span className="mx-2">/</span>
                    <Link href="/dashboard/invoices" className="hover:text-gray-700">Factures</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">#{invoiceId?.substring(0, 8)}</span>
                </nav>
                <div className="flex gap-3">
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        Télécharger PDF
                    </button>
                    <Link
                        href="/dashboard/invoices"
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Retour
                    </Link>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="space-y-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {!isLoading && error && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <Link
                        href="/dashboard/invoices"
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        Retour aux factures
                    </Link>
                </div>
            )}

            {/* Content */}
            {!isLoading && !error && invoice && (
                <>
                    {/* Informations générales */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Facture {invoice.number}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">ID: {invoice.id}</p>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    {invoice.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client</p>
                                    <p className="text-sm font-semibold text-gray-900">{invoice.request.client.full_name}</p>
                                    <p className="text-sm text-gray-600">{invoice.request.client.whatsapp_number}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date de création</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Demande liée</p>
                                    <Link
                                        href={`/dashboard/requests/${invoice.request.id}`}
                                        className="text-sm font-semibold text-gray-900 hover:text-gray-700"
                                    >
                                        #{invoice.request.id.substring(0, 8)}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Articles */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900">Articles</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {invoice.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatCurrency(item.unit_price)} × {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">
                                                {formatCurrency(item.unit_price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Frais et total */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="p-6">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Sous-total articles</span>
                                    <span className="font-medium">
                                        {formatCurrency(invoice.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0))}
                                    </span>
                                </div>

                                {invoice.fees.map((fee, index) => (
                                    <div key={index} className="flex justify-between">
                                        <span className="text-gray-600">{fee.fee_type.name}</span>
                                        <span className="font-medium">{formatCurrency(fee.amount)}</span>
                                    </div>
                                ))}

                                <div className="border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-medium text-gray-900">Total</span>
                                        <span className="text-xl font-bold text-gray-900">
                                            {formatCurrency(invoice.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions sur la facture */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900">Actions</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-3">
                                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                                    Marquer comme payée
                                </button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Envoyer par email
                                </button>
                                <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                                    Annuler la facture
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}