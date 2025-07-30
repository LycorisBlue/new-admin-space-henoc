'use client'

import { useState } from 'react'

export default function AdminLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulation d'une requête
        await new Promise(resolve => setTimeout(resolve, 1000))

        console.log('Admin Login:', { email, password })
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-white flex">
            {/* Section formulaire - Côté blanc */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative bg-white">
                {/* Formes géométriques blanches/grises */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-16 right-20 w-20 h-20 border-2 border-gray-200 transform rotate-45"></div>
                    <div className="absolute top-32 left-16 w-12 h-12 bg-gray-100 rounded-full"></div>
                    <div className="absolute bottom-40 right-32 w-0 h-0 border-l-[25px] border-r-[25px] border-b-[40px] border-l-transparent border-r-transparent border-b-gray-200"></div>
                    <div className="absolute bottom-20 left-20 w-16 h-16 bg-gray-50 transform rotate-12 border border-gray-200"></div>
                    <div className="absolute top-1/2 left-8 w-8 h-8 border-2 border-gray-300 transform rotate-45"></div>
                    <div className="absolute top-20 left-1/3 w-6 h-6 bg-gray-200 rounded-full"></div>
                </div>

                <div className="mx-auto w-full max-w-sm lg:w-96 relative z-10">
                    {/* Logo/Brand */}
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300 relative">
                            <div className="w-8 h-8 bg-white transform rotate-45"></div>
                            <div className="absolute inset-0 w-16 h-16 border-2 border-gray-300 rounded-2xl transform -rotate-3"></div>
                        </div>
                        <h2 className="text-4xl font-bold text-black mb-2">
                            Admin Panel
                        </h2>
                        <p className="mt-2 text-lg text-gray-600">
                            Connexion sécurisée
                        </p>
                    </div>

                    {/* Formulaire */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                                Email Administrateur
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-black transition-all duration-300 bg-gray-50"
                                    placeholder="admin@dashboard.com"
                                />
                                <div className="absolute top-0 right-0 w-3 h-3 bg-black transform rotate-45 translate-x-1 -translate-y-1"></div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-black transition-all duration-300 bg-gray-50 pr-12"
                                    placeholder="••••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-black focus:outline-none transition-colors"
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                                <div className="absolute bottom-0 left-0 w-2 h-2 bg-gray-400 rounded-full transform translate-y-1 -translate-x-1"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="relative">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-5 w-5 text-black focus:ring-gray-300 border-gray-300 rounded"
                                    />
                                    <div className="absolute -top-1 -right-1 w-2 h-2 border border-gray-400 transform rotate-45"></div>
                                </div>
                                <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-700">
                                    Se souvenir de moi
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-semibold text-gray-600 hover:text-black transition-colors focus:outline-none relative group">
                                    Mot de passe oublié ?
                                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300"></div>
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            onClick={handleSubmit}
                            className="group relative w-full flex justify-center py-4 px-4 border-2 border-black rounded-xl text-lg font-bold text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-4 h-4 border-2 border-white transform rotate-45 translate-x-2 -translate-y-2"></div>

                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin mr-3"></div>
                                    CONNEXION...
                                </div>
                            ) : (
                                <>
                                    ACCÉDER AU DASHBOARD
                                </>
                            )}

                            <div className="absolute bottom-0 left-0 w-3 h-3 bg-white transform rotate-45 -translate-x-1 translate-y-1"></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Section droite - Côté noir */}
            <div className="hidden lg:block relative w-0 flex-1">
                <div className="absolute inset-0 bg-black">
                    {/* Formes géométriques noires/grises */}
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Grands éléments */}
                        <div className="absolute top-20 right-24 w-32 h-32 border-2 border-gray-800 transform rotate-45"></div>
                        <div className="absolute top-40 left-16 w-24 h-24 border border-gray-700 rounded-full"></div>
                        <div className="absolute bottom-32 right-20 w-28 h-28 bg-gray-900 transform rotate-12"></div>

                        {/* Moyens éléments */}
                        <div className="absolute top-60 right-40 w-16 h-16 border-2 border-gray-600 transform rotate-45 bg-gray-900"></div>
                        <div className="absolute bottom-48 left-32 w-20 h-20 rounded-full border border-gray-700"></div>
                        <div className="absolute top-32 left-1/2 w-12 h-12 bg-gray-800 transform rotate-45"></div>

                        {/* Triangles */}
                        <div className="absolute top-1/3 right-16 w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-gray-800"></div>
                        <div className="absolute bottom-40 left-20 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-gray-700"></div>

                        {/* Petits éléments */}
                        <div className="absolute top-16 left-24 w-8 h-8 border border-gray-600 transform rotate-45"></div>
                        <div className="absolute top-2/3 left-12 w-6 h-6 bg-gray-800 rounded-full"></div>
                        <div className="absolute bottom-16 right-32 w-10 h-10 border-2 border-gray-700 transform rotate-45"></div>
                        <div className="absolute top-1/2 right-8 w-4 h-4 bg-gray-700 transform rotate-45"></div>

                        {/* Hexagones simulés */}
                        <div className="absolute top-44 left-40 w-14 h-14 border border-gray-600 transform rotate-45 relative">
                            <div className="absolute inset-2 border border-gray-700 transform -rotate-45"></div>
                        </div>
                        <div className="absolute bottom-24 right-16 w-10 h-10 border border-gray-700 transform rotate-45 relative">
                            <div className="absolute inset-1 border border-gray-800 transform -rotate-45"></div>
                        </div>

                        {/* Lignes et connections */}
                        <div className="absolute top-1/4 left-1/4 w-px h-16 bg-gray-800 transform rotate-45"></div>
                        <div className="absolute bottom-1/3 right-1/3 w-12 h-px bg-gray-700"></div>
                        <div className="absolute top-3/4 left-1/3 w-px h-12 bg-gray-800 transform -rotate-45"></div>
                    </div>

                    {/* Grille subtile en arrière-plan */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
                            {[...Array(144)].map((_, i) => (
                                <div key={i} className="border border-gray-700"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}