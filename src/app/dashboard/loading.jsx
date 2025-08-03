import Loading from '../../components/ui/Loading'

/**
 * Composant loading spécialisé pour la section dashboard
 * Automatiquement utilisé par Next.js pendant le chargement des pages dashboard
 */
export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Simulation sidebar (pour maintenir la structure visuelle) */}
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-200">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="px-6 py-8 border-b border-gray-100">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                <div className="w-4 h-4 bg-white rounded-sm"></div>
                            </div>
                            <span className="ml-3 text-xl font-semibold text-gray-900">Dashboard</span>
                        </div>
                    </div>

                    {/* Navigation skeleton */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center px-4 py-3">
                                <div className="w-5 h-5 bg-gray-200 rounded mr-3 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                            </div>
                        ))}
                    </nav>

                    {/* Profil skeleton */}
                    <div className="px-4 py-4 border-t border-gray-100">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                            <div className="ml-3">
                                <div className="h-3 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                                <div className="h-2 bg-gray-200 rounded w-12 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Header mobile */}
            <header className="lg:hidden fixed top-0 inset-x-0 z-20 bg-white border-b border-gray-200">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-200 rounded mr-3 animate-pulse"></div>
                        <div className="flex items-center">
                            <div className="w-7 h-7 bg-gray-200 rounded-lg mr-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </header>

            {/* Contenu principal avec loading */}
            <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
                <div className="p-6">
                    {/* Loading principal */}
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Loading
                            type="fade"
                            size={15}
                            color="#374151"
                            text="Chargement des données..."
                            fullScreen={false}
                        />
                    </div>

                    {/* Skeleton optionnel pour maintenir la structure */}
                    <div className="space-y-8 opacity-30">
                        {/* Header skeleton */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                                <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Métriques skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                                            <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                                        </div>
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Graphique skeleton */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
                            <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}