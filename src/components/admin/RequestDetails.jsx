import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    User,
    FileText,
    ExternalLink,
    Clock,
    Calendar,
    CheckCircle,
    AlertCircle
} from 'lucide-react'
import {
    getRequestDetails,
    formatPaymentMethod,
    formatInvoiceStatus,
    getInvoiceStatusBadgeClasses,
    getPaymentMethodBadgeClasses,
    formatCurrency,
    calculateTotalPaid,
    isFullyPaid,
    formatDate
} from '../../lib/api/admin/request-details'
import { formatRequestStatus, getStatusBadgeClasses } from '../../lib/api/admin/requests'
import { assignToMe } from '../../lib/api/admin/assign-request'
import { updateRequestStatus, getNextStatuses } from '../../lib/api/admin/update-status'

export default function RequestDetails({ requestId }) {
    const [request, setRequest] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAssigning, setIsAssigning] = useState(false)
    const [error, setError] = useState(null)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [newStatus, setNewStatus] = useState('')
    const [statusComment, setStatusComment] = useState('')
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    const handleAssignToMe = async () => {
        setIsAssigning(true)
        try {
            const result = await assignToMe(requestId)
            if (result.success) {
                window.location.reload()
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError('Erreur lors de l\'assignation')
        } finally {
            setIsAssigning(false)
        }
    }

    const handleStatusUpdate = async () => {
        setIsUpdatingStatus(true)
        try {
            const result = await updateRequestStatus(requestId, newStatus, statusComment)
            if (result.success) {
                setShowStatusModal(false)
                setNewStatus('')
                setStatusComment('')
                window.location.reload()
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError('Erreur lors de la mise à jour du statut')
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const openStatusModal = () => {
        setNewStatus('')
        setStatusComment('')
        setShowStatusModal(true)
    }

    useEffect(() => {
        if (!requestId) return

        const loadRequestDetails = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const result = await getRequestDetails(requestId)

                if (result.success) {
                    setRequest(result.data)
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

        loadRequestDetails()
    }, [requestId])

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
                    href="/dashboard/requests"
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                    Retour aux demandes
                </Link>
            </div>
        )
    }

    if (!request) return null

    return (
        <div className="space-y-6">
            {/* Informations principales */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Demande #{request.id.substring(0, 8)}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Créée le {formatDate(request.created_at)}
                            </p>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClasses(request.status)}`}>
                            {formatRequestStatus(request.status)}
                        </span>
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
                                    <p className="text-sm font-semibold text-gray-900 mt-1">{request.client.full_name}</p>
                                </div>
                                <div className="pb-3 border-b border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">WhatsApp</p>
                                    <p className="text-sm text-gray-900 mt-1">{request.client.whatsapp_number}</p>
                                </div>
                                {request.client.email && (
                                    <div className="pb-3 border-b border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                                        <p className="text-sm text-gray-900 mt-1">{request.client.email}</p>
                                    </div>
                                )}
                                {request.client.adresse && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adresse</p>
                                        <p className="text-sm text-gray-900 mt-1">{request.client.adresse}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Admin assigné */}
                        <div className="space-y-3 pt-6 md:pt-0 md:px-8">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                <h3 className="font-medium text-gray-900">Administrateur</h3>
                            </div>
                            <div className="space-y-4">
                                {request.assigned_admin ? (
                                    <>
                                        <div className="pb-3 border-b border-gray-100">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigné à</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-sm font-semibold text-gray-900">{request.assigned_admin.name}</p>
                                                {request.assigned_admin.is_current_admin && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        Vous
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                                            <p className="text-sm text-gray-900 mt-1">{request.assigned_admin.email}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</p>
                                        <p className="text-sm text-amber-600 mt-1">Non assignée</p>
                                    </div>
                                )}
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
                                    <p className="text-sm text-gray-900 mt-1">{formatDate(request.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mise à jour</p>
                                    <p className="text-sm text-gray-900 mt-1">{formatDate(request.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {request.description && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="font-medium text-gray-900 mb-3">Description</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">{request.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Liens produits */}
            {request.product_links && request.product_links.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <ExternalLink className="w-5 h-5 text-gray-400" />
                            <h3 className="font-medium text-gray-900">Liens produits</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {request.product_links.map((link) => (
                                <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:text-blue-800 break-all"
                                            >
                                                {link.url}
                                            </a>
                                            {link.note && (
                                                <p className="text-sm text-gray-600 mt-2">{link.note}</p>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 ml-4">
                                            {formatDate(link.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Facture et paiements */}
            {request.invoice && (
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <h3 className="font-medium text-gray-900">Facture</h3>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getInvoiceStatusBadgeClasses(request.invoice.status)}`}>
                                {formatInvoiceStatus(request.invoice.status)}
                            </span>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="space-y-4">
                                    <div className="pb-3 border-b border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Montant total</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            {formatCurrency(request.invoice.total_amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Créée le</p>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {formatDate(request.invoice.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Paiements */}
                            {request.invoice.payments && request.invoice.payments.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-4">Paiements</h4>
                                    <div className="space-y-3">
                                        {request.invoice.payments.map((payment) => (
                                            <div key={payment.id} className="border border-gray-200 rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodBadgeClasses(payment.method)}`}>
                                                            {formatPaymentMethod(payment.method)}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {formatCurrency(payment.amount_paid)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {formatDate(payment.payment_date)} • Confirmé par {payment.confirmed_by.name}
                                                </p>
                                            </div>
                                        ))}

                                        <div className="flex items-center justify-between pt-3 mt-4 border-t border-gray-200">
                                            <span className="font-medium text-gray-900">Total payé</span>
                                            <span className="font-bold text-gray-900">
                                                {formatCurrency(calculateTotalPaid(request.invoice.payments))}
                                            </span>
                                        </div>

                                        {isFullyPaid(request.invoice.total_amount, request.invoice.payments) && (
                                            <div className="flex items-center gap-2 text-green-600 text-sm">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Facture entièrement payée</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <Link
                                href={`/dashboard/invoices/${request.invoice.id}`}
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                                <FileText className="w-4 h-4" />
                                Voir la facture complète
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Historique */}
            {request.status_history && request.status_history.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <h3 className="font-medium text-gray-900">Historique des statuts</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {request.status_history.map((entry, index) => (
                                <div key={entry.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        {index < request.status_history.length - 1 && (
                                            <div className="w-px h-6 bg-gray-200 mt-2"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatRequestStatus(entry.previous_status)} → {formatRequestStatus(entry.new_status)}
                                            </span>
                                        </div>
                                        {entry.comment && (
                                            <p className="text-sm text-gray-600 mb-2">{entry.comment}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            {formatDate(entry.created_at)} • {entry.admin.name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        {/* Assignation */}
                        {(!request.assigned_admin || request.status === 'en_attente') && (
                            <button
                                onClick={handleAssignToMe}
                                disabled={isAssigning}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                            >
                                {isAssigning ? 'Assignation...' : 'M\'assigner cette demande'}
                            </button>
                        )}

                        {/* Actions pour admin assigné */}
                        {request.assigned_admin?.is_current_admin && (
                            <>
                                <button
                                    onClick={openStatusModal}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Changer le statut
                                </button>
                                {!request.invoice && (
                                    <Link
                                        href={`/dashboard/invoices/create/${request.id}`}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Créer une facture
                                    </Link>
                                )}
                            </>
                        )}

                        {/* Réassignation */}
                        {request.assigned_admin && !request.assigned_admin.is_current_admin && (
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Assigner à un autre admin
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal changement de statut */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Changer le statut</h3>
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                    disabled={isUpdatingStatus}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Statut actuel: <span className="font-semibold">{formatRequestStatus(request.status)}</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nouveau statut
                                    </label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isUpdatingStatus}
                                    >
                                        <option value="">Sélectionner un statut</option>
                                        {getNextStatuses(request.status).map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Commentaire (optionnel)
                                    </label>
                                    <textarea
                                        value={statusComment}
                                        onChange={(e) => setStatusComment(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ajouter un commentaire sur ce changement..."
                                        disabled={isUpdatingStatus}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={isUpdatingStatus}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={!newStatus || isUpdatingStatus}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isUpdatingStatus ? 'Mise à jour...' : 'Mettre à jour'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}