'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import CreatePaymentForm from '../../../../../components/admin/CreatePaymentForm'
import { getInvoiceDetails, formatCurrency, formatDate } from '../../../../../lib/api/admin/invoice-details'

export default function CreatePaymentPage() {
    const params = useParams()
    const router = useRouter()
    const invoiceId = params.id

    const [invoice, setInvoice] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!invoiceId) return

        const loadInvoiceDetails = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const result = await getInvoiceDetails(invoiceId)

                if (result.success) {
                    setInvoice(result.data)
                } else {
                    if (result.needsLogin) {
                        return
                    }
                    setError(result.message)
                }
            } catch (err) {
                console.error('Erreur lors du chargement de la facture:', err)
                setError('Erreur lors du chargement des données')
            } finally {
                setIsLoading(false)
            }
        }

        loadInvoiceDetails()
    }, [invoiceId])

    const handlePaymentSuccess = (paymentData) => {
        // Rediriger vers la page de détails de la facture avec un indicateur de succès
        router.push(`/dashboard/invoices/${invoiceId}?payment_added=true`)
    }

    const handleCancel = () => {
        router.push(`/dashboard/invoices/${invoiceId}`)
    }

    // Vérifications de permission et d'état
    const canAddPayment = invoice &&
        invoice.status !== 'annulé' &&
        invoice.payment_info.payment_status !== 'paid'

    const remainingAmount = invoice ?
        invoice.total_amount - (invoice.payment_info.amount_paid || 0) : 0

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* En-tête skeleton */}
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>

                {/* Navigation skeleton */}
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-96"></div>
                </div>

                {/* Contenu skeleton */}
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
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Enregistrer un paiement</h1>
                    <p className="mt-1 text-sm text-gray-500">Ajouter un paiement à une facture</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <div className="flex justify-center gap-3">
                        <Link
                            href="/dashboard/invoices"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Retour aux factures
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!invoice) {
        return null
    }

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Enregistrer un paiement</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Ajouter un paiement pour la facture #{invoiceId?.substring(0, 8)}
                </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <nav className="flex text-sm text-gray-500">
                    <Link href="/dashboard" className="hover:text-gray-700">Administration</Link>
                    <span className="mx-2">/</span>
                    <Link href="/dashboard/invoices" className="hover:text-gray-700">Factures</Link>
                    <span className="mx-2">/</span>
                    <Link
                        href={`/dashboard/invoices/${invoiceId}`}
                        className="hover:text-gray-700"
                    >
                        #{invoiceId?.substring(0, 8)}
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">Paiement</span>
                </nav>

                <Link
                    href={`/dashboard/invoices/${invoiceId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la facture
                </Link>
            </div>

            {/* Informations de la facture */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Détails de la facture</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Informations client */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-4">Client</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {invoice.client.full_name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {invoice.client.whatsapp_number}
                                    </p>
                                </div>
                                {invoice.client.email && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                                        <p className="text-sm text-gray-900">{invoice.client.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informations de la facture */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-4">Facture</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Créée le
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        {formatDate(invoice.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Créée par
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        {invoice.admin.name}
                                        {invoice.admin.is_current_admin && (
                                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                Vous
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vérifications avant affichage du formulaire */}
            {invoice.status === 'annulé' ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-red-900">Facture annulée</h3>
                            <p className="text-sm text-red-700 mt-1">
                                Il n'est pas possible d'ajouter des paiements à une facture annulée.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            href={`/dashboard/invoices/${invoiceId}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour à la facture
                        </Link>
                    </div>
                </div>
            ) : invoice.payment_info.payment_status === 'paid' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-green-900">Facture entièrement payée</h3>
                            <p className="text-sm text-green-700 mt-1">
                                Cette facture a été entièrement payée ({formatCurrency(invoice.total_amount)}).
                                Aucun paiement supplémentaire n'est nécessaire.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            href={`/dashboard/invoices/${invoiceId}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour à la facture
                        </Link>
                    </div>
                </div>
            ) : remainingAmount <= 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-blue-900">Aucun montant restant</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Cette facture n'a plus de montant restant à payer.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Formulaire de paiement */
                <CreatePaymentForm
                    invoiceId={invoiceId}
                    invoiceData={{
                        total_amount: invoice.total_amount,
                        total_paid: invoice.payment_info.amount_paid || 0
                    }}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handleCancel}
                />
            )}

            {/* Historique des paiements existants */}
            {invoice.payments && invoice.payments.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-medium text-gray-900">
                            Paiements existants ({invoice.payments.length})
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {invoice.payments.map((payment, index) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {formatCurrency(payment.amount_paid)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {payment.method} • {formatDate(payment.payment_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-900">
                                            {payment.confirmed_by.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(payment.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}