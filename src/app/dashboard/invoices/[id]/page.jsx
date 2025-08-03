'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import InvoiceDetails from '../../../../components/admin/InvoiceDetails'

export default function InvoiceDetailsPage() {
    const params = useParams()
    const invoiceId = params.id
    const [refreshKey, setRefreshKey] = useState(0)

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1)
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
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Actualiser
                    </button>
                    <Link
                        href="/dashboard/invoices"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour
                    </Link>
                </div>
            </div>

            {/* Détails de la facture */}
            <InvoiceDetails invoiceId={invoiceId} />
        </div>
    )
}