import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook personnalisé pour gérer l'authentification
 * @param {boolean} requireAuth - true pour les pages protégées, false pour les pages publiques
 * @returns {Object} { isLoading, isAuthenticated, userRole }
 */
export const useAuth = (requireAuth = true) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userRole, setUserRole] = useState(null)

    useEffect(() => {
        const checkAuth = () => {
            try {
                // Vérification côté client uniquement (pour éviter les erreurs SSR)
                if (typeof window === 'undefined') return

                const accessToken = localStorage.getItem('accessToken')
                const role = localStorage.getItem('userRole')

                // Si pas de token
                if (!accessToken) {
                    setIsAuthenticated(false)
                    setUserRole(null)

                    // Redirection vers login si page protégée
                    if (requireAuth) {
                        router.push('/login')
                        return
                    }
                } else {
                    // Token présent - vérification basique
                    try {
                        // Vérification simple du format JWT (3 parties séparées par des points)
                        const tokenParts = accessToken.split('.')
                        if (tokenParts.length !== 3) {
                            throw new Error('Token invalide')
                        }

                        // Décodage du payload pour vérifier l'expiration
                        const payload = JSON.parse(atob(tokenParts[1]))
                        const currentTime = Math.floor(Date.now() / 1000)

                        // Vérification de l'expiration
                        if (payload.exp && payload.exp < currentTime) {
                            throw new Error('Token expiré')
                        }

                        // Token valide
                        setIsAuthenticated(true)
                        setUserRole(role)

                        // Redirection vers dashboard si sur page publique (login)
                        if (!requireAuth) {
                            router.push('/dashboard')
                            return
                        }

                    } catch (error) {
                        console.error('Token invalide:', error)

                        // Nettoyage des tokens invalides
                        localStorage.removeItem('accessToken')
                        localStorage.removeItem('refreshToken')
                        localStorage.removeItem('userRole')

                        setIsAuthenticated(false)
                        setUserRole(null)

                        // Redirection vers login si page protégée
                        if (requireAuth) {
                            router.push('/login')
                            return
                        }
                    }
                }

                setIsLoading(false)

            } catch (error) {
                console.error('Erreur lors de la vérification d\'authentification:', error)
                setIsLoading(false)

                // En cas d'erreur, considérer comme non authentifié
                setIsAuthenticated(false)
                setUserRole(null)

                if (requireAuth) {
                    router.push('/login')
                }
            }
        }

        checkAuth()

        // Écouter les changements dans localStorage (connexion/déconnexion dans d'autres onglets)
        const handleStorageChange = (e) => {
            if (e.key === 'accessToken' || e.key === 'userRole') {
                checkAuth()
            }
        }

        window.addEventListener('storage', handleStorageChange)

        // Nettoyage
        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }

    }, [requireAuth, router])

    return {
        isLoading,
        isAuthenticated,
        userRole
    }
}

export default useAuth