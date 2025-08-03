'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { login } from '../../lib/api/auth/login'
import Toast from '../../components/ui/Toast'
import { useAuth } from '../../lib/hooks/useAuth'
import { AuthLoading, DashboardLoading, ButtonLoading } from '../../components/ui/Loading'


export default function AdminLoginPage() {
    const router = useRouter()
    const { isLoading: authLoading } = useAuth(false) // false = page publique, redirige si déjà connecté

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await login({ email, password })

            if (result.success) {
                toast.success(result.message || 'Connexion réussie!')

                // Redirection après un court délai pour que l'utilisateur voie la notification
                setTimeout(() => {
                    router.push('/dashboard')
                }, 1000)
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Erreur inattendue:', error)
            toast.error('Une erreur inattendue s\'est produite')
        } finally {
            setIsLoading(false)
        }
    }

    { authLoading && <AuthLoading text="Vérification en cours..." /> }

    return (
        <>
            <Toast />

            <div
                className="min-h-screen flex items-center justify-center px-4"
                style={{
                    background: "linear-gradient(135deg, #f9fafb, #e5e7eb)"
                }}
            >
                <div
                    className="border border-gray-200 shadow-sm rounded-lg p-8 w-full max-w-md"
                    style={{
                        background: "linear-gradient(135deg, #f9fafb, #e5e7eb)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                    }}
                >
                    {/* Logo / Titre */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto bg-black rounded-lg flex items-center justify-center mb-4 shadow-sm">
                            <div className="w-8 h-8 bg-white transform rotate-45"></div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Admin Panel</h2>
                        <p className="mt-1 text-gray-500">Connexion sécurisée</p>
                    </div>

                    {/* Formulaire */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                                Email Administrateur
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="admin@dashboard.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="••••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-black disabled:opacity-50"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    disabled={isLoading}
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded disabled:opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700">Se souvenir de moi</span>
                            </label>
                            <a href="#" className="text-sm text-gray-500 hover:text-black">
                                Mot de passe oublié ?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-black text-white rounded-md font-bold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 transition disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Connexion..." : "Accéder au Dashboard"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}