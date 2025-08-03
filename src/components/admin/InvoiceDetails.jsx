import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    User,
    FileText,
    Calendar,
    AlertCircle,
    Download,
    CheckCircle,
    CreditCard,
    Package
} from 'lucide-react'
import {
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
} from '../../lib/api/admin/invoice-details'

export default function InvoiceDetails({ invoiceId }) {
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
                console.error('Erreur:', err)
                setError('Erreur lors du chargement')
            } finally {
                setIsLoading(false)
            }
        }

        loadInvoiceDetails()
    }, [invoiceId])

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Link
                    href="/dashboard/invoices"
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                    Retour aux factures
                </Link>
            </div>
        )
    }

    if (!invoice) return null

    const paymentProgress = calculatePaymentProgress(invoice.payment_info.amount_paid, invoice.total_amount)
    const remainingAmount = calculateRemainingAmount(invoice.total_amount, invoice.payment_info.amount_paid)
    const fullyPaid = isFullyPaid(invoice.payment_info.amount_paid, invoice.total_amount)

    return (
        <div className="space-y-6">
            {/* Informations principales */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Facture #{invoice.id.substring(0, 8)}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Créée le {formatDate(invoice.created_at)}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getInvoiceStatusBadgeClasses(invoice.status)}`}>
                                {formatInvoiceStatus(invoice.status)}
                            </span>
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusBadgeClasses(invoice.payment_info.payment_status)}`}>
                                {formatPaymentStatus(invoice.payment_info.payment_status)}
                            </span>
                        </div>
                    </div>

                    {/* Montant total et progression paiement */}
                    <div className="border border-gray-200 p-6 rounded-lg mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600">Montant total</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(invoice.total_amount)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Progression du paiement</p>
                                <p className="text-xl font-semibold text-gray-900">{paymentProgress}%</p>
                            </div>
                        </div>

                        {/* Barre de progression */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Payé: {formatCurrency(invoice.payment_info.amount_paid)}</span>
                                <span>Restant: {formatCurrency(remainingAmount)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${fullyPaid ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${paymentProgress}%` }}
                                ></div>
                            </div>
                        </div>

                        {fullyPaid && (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                <span>Facture entièrement payée</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                        {/* Client */}
                        <div className="space-y-3 pt-6 md:pt-0 md:pr-8">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                <h3 className="font-medium text-gray-900">Client</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="pb-3 border-b border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nom</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-1">{invoice.client.full_name}</p>
                                </div>
                                <div className="pb-3 border-b border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">WhatsApp</p>
                                    <p className="text-sm text-gray-900 mt-1">{invoice.client.whatsapp_number}</p>
                                </div>
                                {invoice.client.email && (
                                    <div className="pb-3 border-b border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                                        <p className="text-sm text-gray-900 mt-1">{invoice.client.email}</p>
                                    </div>
                                )}
                                {invoice.client.adresse && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adresse</p>
                                        <p className="text-sm text-gray-900 mt-1">{invoice.client.adresse}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Administrateur */}
                        <div className="space-y-3 pt-6 md:pt-0 md:px-8">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                <h3 className="font-medium text-gray-900">Administrateur</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="pb-3 border-b border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Créée par</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-sm font-semibold text-gray-900">{invoice.admin.name}</p>
                                        {invoice.admin.is_current_admin && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                Vous
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                                    <p className="text-sm text-gray-900 mt-1">{invoice.admin.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="space-y-3 pt-6 md:pt-0 md:pl-8">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <h3 className="font-medium text-gray-900">Dates</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="pb-3 border-b border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Créée le</p>
                                    <p className="text-sm text-gray-900 mt-1">{formatDate(invoice.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mise à jour</p>
                                    <p className="text-sm text-gray-900 mt-1">{formatDate(invoice.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Demande associée */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="font-medium text-gray-900">Demande associée</h3>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">
                                Demande #{invoice.request.id.substring(0, 8)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{invoice.request.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Créée le {formatDate(invoice.request.created_at)}
                            </p>
                        </div>
                        <Link
                            href={`/dashboard/requests/${invoice.request.id}`}
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            <FileText className="w-4 h-4" />
                            Voir la demande
                        </Link>
                    </div>
                </div>
            </div>

            {/* Articles */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-400" />
                        <h3 className="font-medium text-gray-900">Articles ({invoice.items.length})</h3>
                    </div>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {invoice.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatCurrency(item.unit_price)} × {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">
                                        {formatCurrency(item.subtotal)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Sous-total articles</span>
                            <span className="font-medium text-gray-900">
                                {formatCurrency(invoice.totals.items_total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Frais */}
            {invoice.fees.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-medium text-gray-900">Frais additionnels ({invoice.fees.length})</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {invoice.fees.map((fee) => (
                                <div key={fee.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{fee.fee_type.name}</p>
                                        {fee.fee_type.description && (
                                            <p className="text-sm text-gray-500">{fee.fee_type.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            {formatCurrency(fee.amount)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-900">Total frais</span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(invoice.totals.fees_total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Paiements */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <h3 className="font-medium text-gray-900">
                            Paiements ({invoice.payments.length})
                        </h3>
                    </div>
                </div>
                <div className="p-6">
                    {invoice.payments.length > 0 ? (
                        <div className="space-y-4">
                            {invoice.payments.map((payment) => (
                                <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodBadgeClasses(payment.method)}`}>
                                                {formatPaymentMethod(payment.method)}
                                            </span>
                                            <span className="text-lg font-semibold text-gray-900">
                                                {formatCurrency(payment.amount_paid)}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-900">
                                                {formatDate(payment.payment_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Confirmé par {payment.confirmed_by.name} • {formatDate(payment.created_at)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Aucun paiement enregistré</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Total récapitulatif */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Sous-total articles</span>
                            <span className="font-medium">{formatCurrency(invoice.totals.items_total)}</span>
                        </div>
                        {invoice.totals.fees_total > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Frais additionnels</span>
                                <span className="font-medium">{formatCurrency(invoice.totals.fees_total)}</span>
                            </div>
                        )}
                        <div className="border-t pt-3">
                            <div className="flex justify-between">
                                <span className="text-lg font-medium text-gray-900">Total facture</span>
                                <span className="text-xl font-bold text-gray-900">
                                    {formatCurrency(invoice.totals.grand_total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                            <Download className="w-4 h-4" />
                            Télécharger PDF
                        </button>

                        {!fullyPaid && invoice.permissions.can_modify && (
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                <CheckCircle className="w-4 h-4" />
                                Marquer comme payée
                            </button>
                        )}

                        {invoice.status === 'en_attente' && invoice.permissions.can_modify && (
                            <button className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                                Annuler la facture
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}