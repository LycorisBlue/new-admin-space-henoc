'use client'

import { useState, useEffect } from 'react'
import { Edit, Trash2, Plus, Search, Shield, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../../lib/api/superadmin/admins'
import { useAuth } from '../../../lib/hooks/useAuth'
import { InlineLoading } from '../../../components/ui/Loading'

export default function AdminsPage() {
    const { userRole } = useAuth(true)
    const [admins, setAdmins] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // États des modales
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedAdmin, setSelectedAdmin] = useState(null)

    // États des formulaires
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin'
    })

    // Vérification des permissions
    useEffect(() => {
        if (userRole && userRole !== 'superadmin') {
            toast.error('Accès refusé - Rôle super-administrateur requis')
            return
        }
    }, [userRole])

    // Chargement initial des données
    useEffect(() => {
        if (userRole === 'superadmin') {
            loadAdmins()
        }
    }, [userRole])

    const loadAdmins = async () => {
        try {
            setIsLoading(true)
            const result = await getAllAdmins()

            if (result.success) {
                setAdmins(result.data || [])
            } else {
                if (result.needsLogin) {
                    return
                }
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Erreur lors du chargement des administrateurs:', error)
            toast.error('Erreur lors du chargement des données')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await loadAdmins()
        setTimeout(() => setIsRefreshing(false), 1000)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatRole = (role) => {
        return role === 'superadmin' ? 'Super Admin' : 'Admin'
    }

    // Filtrage des administrateurs
    const filteredAdmins = admins.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Gestionnaires des modales
    const openCreateModal = () => {
        setFormData({ name: '', email: '', password: '', role: 'admin' })
        setShowCreateModal(true)
    }

    const openEditModal = (admin) => {
        setSelectedAdmin(admin)
        setFormData({
            name: admin.name,
            email: admin.email,
            password: '',
            role: admin.role
        })
        setShowEditModal(true)
    }

    const openDeleteModal = (admin) => {
        setSelectedAdmin(admin)
        setShowDeleteModal(true)
    }

    const closeModals = () => {
        setShowCreateModal(false)
        setShowEditModal(false)
        setShowDeleteModal(false)
        setSelectedAdmin(null)
        setFormData({ name: '', email: '', password: '', role: 'admin' })
    }

    // Gestionnaires des actions
    const handleCreate = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const result = await createAdmin(formData)

            if (result.success) {
                toast.success(result.message)
                closeModals()
                await loadAdmins()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Erreur lors de la création:', error)
            toast.error('Erreur lors de la création')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const updateData = { ...formData }
            if (!updateData.password) {
                delete updateData.password
            }

            const result = await updateAdmin(selectedAdmin.id, updateData)

            if (result.success) {
                toast.success(result.message)
                closeModals()
                await loadAdmins()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Erreur lors de la modification:', error)
            toast.error('Erreur lors de la modification')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setIsSubmitting(true)

        try {
            const result = await deleteAdmin(selectedAdmin.id)

            if (result.success) {
                toast.success(result.message)
                closeModals()
                await loadAdmins()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
            toast.error('Erreur lors de la suppression')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (userRole !== 'superadmin') {
        return null
    }

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Gestion des Administrateurs</h1>
                <p className="mt-1 text-sm text-gray-500">Gérez les comptes administrateurs du système</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <nav className="flex text-sm text-gray-500">
                    <span>Administration</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">Administrateurs</span>
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
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvel administrateur
                    </button>
                </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">Aperçu</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Total administrateurs</p>
                            <p className="text-3xl font-bold text-gray-900">{admins.length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Super administrateurs</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {admins.filter(admin => admin.role === 'superadmin').length}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Administrateurs</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {admins.filter(admin => admin.role === 'admin').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-lg font-medium text-gray-900">Liste des administrateurs</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 w-64"
                            />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center">
                        <InlineLoading text="Chargement..." />
                    </div>
                ) : filteredAdmins.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                            <Shield className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">
                            {searchTerm ? 'Aucun administrateur trouvé' : 'Aucun administrateur enregistré'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nom
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rôle
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date de création
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAdmins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{admin.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{admin.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${admin.role === 'superadmin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {admin.role === 'superadmin' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                                {formatRole(admin.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {formatDate(admin.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(admin)}
                                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(admin)}
                                                    className="text-gray-600 hover:text-red-600 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Création */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Créer un administrateur</h3>
                                <button
                                    onClick={closeModals}
                                    className="text-gray-400 hover:text-gray-600"
                                    disabled={isSubmitting}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        required
                                        disabled={isSubmitting}
                                        minLength={8}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        disabled={isSubmitting}
                                    >
                                        <option value="admin">Administrateur</option>
                                        <option value="superadmin">Super Administrateur</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModals}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                        disabled={isSubmitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Création...' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Modification */}
            {showEditModal && selectedAdmin && (
                <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Modifier l'administrateur</h3>
                                <button
                                    onClick={closeModals}
                                    className="text-gray-400 hover:text-gray-600"
                                    disabled={isSubmitting}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nouveau mot de passe <span className="text-gray-500">(laisser vide pour ne pas changer)</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        disabled={isSubmitting}
                                        minLength={8}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        disabled={isSubmitting}
                                    >
                                        <option value="admin">Administrateur</option>
                                        <option value="superadmin">Super Administrateur</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModals}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                        disabled={isSubmitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Modification...' : 'Modifier'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Suppression */}
            {showDeleteModal && selectedAdmin && (
                <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
                                <button
                                    onClick={closeModals}
                                    className="text-gray-400 hover:text-gray-600"
                                    disabled={isSubmitting}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <Trash2 className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Supprimer l'administrateur</p>
                                        <p className="text-sm text-gray-500">Cette action est irréversible</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        Êtes-vous sûr de vouloir supprimer l'administrateur{' '}
                                        <span className="font-medium">{selectedAdmin.name}</span>{' '}
                                        ({selectedAdmin.email}) ?
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModals}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Suppression...' : 'Supprimer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}