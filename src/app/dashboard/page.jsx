'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/hooks/useAuth'
import { getAnalytics, validateAnalyticsData } from '../../lib/api/admin/analytics'
import toast from 'react-hot-toast'

// Import des 4 composants dashboard
import MetricsCards from '../../components/admin/MetricsCards'
import WeeklyChart from '../../components/admin/WeeklyChart'
import RecentActivity from '../../components/admin/RecentActivity'
import StatsOverview from '../../components/admin/StatsOverview'

export default function DashboardPage() {
    const { isLoading: authLoading, isAuthenticated, userRole } = useAuth(true)

    // États pour les données analytics
    const [analyticsData, setAnalyticsData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)

    // Chargement des données analytics
    const loadAnalytics = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setIsRefreshing(true)
            } else {
                setIsLoading(true)
            }
            setError(null)

            const result = await getAnalytics()

            if (result.success) {
                // Validation des données avant de les utiliser
                if (validateAnalyticsData(result.data)) {
                    setAnalyticsData(result.data)
                    setLastUpdated(new Date())
                } else {
                    throw new Error('Données analytics invalides')
                }
            } else {
                if (result.needsLogin) {
                    // La redirection sera gérée par useAuth
                    return
                }
                setError(result.message)
                toast.error(result.message)
            }
        } catch (err) {
            console.error('Erreur lors du chargement des analytics:', err)
            const errorMessage = 'Erreur lors du chargement du dashboard'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    // Chargement initial
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            loadAnalytics()
        }
    }, [isAuthenticated, authLoading])

    // Actualisation manuelle
    const handleRefresh = () => {
        loadAnalytics(true)
        toast.success('Dashboard actualisé')
    }

    // Auto-refresh toutes les 5 minutes
    useEffect(() => {
        if (!analyticsData) return

        const interval = setInterval(() => {
            loadAnalytics(true)
        }, 5 * 60 * 1000) // 5 minutes

        return () => clearInterval(interval)
    }, [analyticsData])

    // Gestion des cas de loading et d'erreur d'auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                        <div className="w-8 h-8 bg-white rounded-sm"></div>
                    </div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Redirection en cours...</p>
                </div>
            </div>
        )
    }

    // Formatage de la dernière mise à jour
    const formatLastUpdated = () => {
        if (!lastUpdated) return ''

        return lastUpdated.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="space-y-8">
            {/* En-tête avec informations utilisateur */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Vue d'ensemble de votre activité
                        {lastUpdated && (
                            <span className="ml-2">• Dernière mise à jour : {formatLastUpdated()}</span>
                        )}
                    </p>
                </div>
                {userRole && (
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Connecté en tant que</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                            {userRole === 'superadmin' ? 'Super Administrateur' : 'Administrateur'}
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <nav className="flex text-sm text-gray-500">
                    <span>Administration</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">Tableau de bord</span>
                </nav>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Exporter les données
                    </button>
                </div>
            </div>

            {/* Gestion des erreurs */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <h3 className="font-medium text-red-900">Erreur de chargement</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => loadAnalytics()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            )}

            {/* Contenu principal du dashboard */}
            {!error && (
                <>
                    {/* 1. Métriques principales */}
                    <MetricsCards metrics={analyticsData?.metrics} />

                    {/* 2. Graphique d'évolution hebdomadaire */}
                    <WeeklyChart weeklyEvolution={analyticsData?.weeklyEvolution} />

                    {/* 3. Activité récente */}
                    <RecentActivity recentActivity={analyticsData?.recentActivity} />

                    {/* 4. Statistiques complémentaires */}
                    {/* <StatsOverview
                        paymentMethods={analyticsData?.paymentMethods}
                        requestsDistribution={analyticsData?.requestsDistribution}
                        additionalStats={analyticsData?.additionalStats}
                    /> */}

                    {/* Informations de debug (seulement en développement) */}
                    {process.env.NODE_ENV === 'development' && analyticsData?.metadata && (
                        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600">
                            <p>
                                <strong>Données générées :</strong> {new Date(analyticsData.metadata.generated_at).toLocaleString('fr-FR')} |
                                <strong> Période :</strong> {analyticsData.metadata.period} |
                                <strong> Enregistrements analysés :</strong> {analyticsData.metadata.total_records_analyzed}
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Guide d'utilisation (masqué si données chargées) */}
            {!isLoading && !error && !analyticsData && (
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900">Bienvenue sur votre dashboard</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Métriques en temps réel</h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Suivi des demandes et factures</li>
                                    <li>• Évolution des revenus</li>
                                    <li>• Activité des clients</li>
                                    <li>• Analyse des tendances</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Fonctionnalités</h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Actualisation automatique</li>
                                    <li>• Graphiques interactifs</li>
                                    <li>• Activité en temps réel</li>
                                    <li>• Export des données</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}