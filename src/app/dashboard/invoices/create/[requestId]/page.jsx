'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import CreateInvoiceForm from '../../../../../components/admin/CreateInvoiceForm'

export default function CreateInvoicePage() {
    const params = useParams()
    const requestId = params.requestId
    const router = useRouter()
    const [request, setRequest] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadRequestDetails = async () => {
            try {
                setIsLoading(true)
                setError(null)

                // Simulation - remplacer par vraie API
                setTimeout(() => {
                    setRequest({
                        id: requestId,
                        client: { full_name: 'Client Test', whatsapp_number: '+1234567890' },
                        created_at: new Date().toISOString(),
                        status: 'en_traitement',
                        description: 'Description de la demande'
                    })
                    setIsLoading(false)
                }, 1000)
            } catch (err) {
                setError("Impossible de charger les détails de la demande.")
                setIsLoading(false)
            }
        }

        loadRequestDetails()
    }, [requestId])

    const handleSuccess = () => {
        router.push(`/dashboard/requests/${requestId}?invoice_created=true`)
    }

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Créer une facture</h1>
                <p className="mt-1 text-sm text-gray-500">Créez une facture pour cette demande client</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <nav className="flex text-sm text-gray-500">
                    <Link href="/dashboard" className="hover:text-gray-700">Administration</Link>
                    <span className="mx-2">/</span>
                    <Link href="/dashboard/requests" className="hover:text-gray-700">Demandes</Link>
                    <span className="mx-2">/</span>
                    <Link href={`/dashboard/requests/${requestId}`} className="hover:text-gray-700">
                        #{requestId?.substring(0, 8)}
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">Facture</span>
                </nav>
                <Link
                    href={`/dashboard/requests/${requestId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour
                </Link>
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
                        href={`/dashboard/requests/${requestId}`}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        Retour à la demande
                    </Link>
                </div>
            )}

            {/* Content */}
            {!isLoading && !error && request && (
                <>
                    {/* Détails de la demande */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Demande #{requestId?.substring(0, 8)}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Informations de la demande client</p>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {request.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client</p>
                                    <p className="text-sm font-semibold text-gray-900">{request.client.full_name}</p>
                                    <p className="text-sm text-gray-600">{request.client.whatsapp_number}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date de création</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {new Date(request.created_at).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">ID Demande</p>
                                    <p className="text-sm font-mono font-semibold text-gray-900">{requestId}</p>
                                </div>
                            </div>

                            {request.description && (
                                <div className="border-t border-gray-100 pt-6 mt-6">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Description</p>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700">{request.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Formulaire */}
                    <CreateInvoiceForm requestId={requestId} onSuccess={handleSuccess} />
                </>
            )}
        </div>
    )
}