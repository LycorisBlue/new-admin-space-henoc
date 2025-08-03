import {
    ClipLoader,
    FadeLoader,
    PulseLoader,
    BeatLoader,
    DotLoader,
    RingLoader,
    ScaleLoader
} from 'react-spinners'

/**
 * Composant Loading professionnel avec react-spinners
 * @param {string} type - Type de spinner ('clip', 'fade', 'pulse', 'beat', 'dot', 'ring', 'scale')
 * @param {number|string} size - Taille du spinner
 * @param {string} color - Couleur du spinner
 * @param {string} text - Texte à afficher sous le spinner
 * @param {boolean} fullScreen - Affichage plein écran ou inline
 * @param {string} className - Classes CSS additionnelles
 */
export default function Loading({
    type = 'clip',
    size = 35,
    color = '#000000',
    text = 'Chargement...',
    fullScreen = false,
    className = ''
}) {

    const containerClasses = fullScreen
        ? `min-h-screen flex items-center justify-center ${className}`
        : `flex items-center justify-center p-4 ${className}`

    const getSpinner = () => {
        const commonProps = {
            color,
            loading: true,
            size,
            'aria-label': 'Chargement en cours'
        }

        switch (type) {
            case 'clip':
                return <ClipLoader {...commonProps} />

            case 'fade':
                return <FadeLoader {...commonProps} height={15} width={5} radius={2} margin={2} />

            case 'pulse':
                return <PulseLoader {...commonProps} size={size || 15} margin={2} />

            case 'beat':
                return <BeatLoader {...commonProps} size={size || 15} margin={3} />

            case 'dot':
                return <DotLoader {...commonProps} size={size || 60} />

            case 'ring':
                return <RingLoader {...commonProps} size={size || 60} />

            case 'scale':
                return <ScaleLoader {...commonProps} height={35} width={4} radius={2} margin={2} />

            default:
                return <ClipLoader {...commonProps} />
        }
    }

    // Styles selon le contexte
    const getBackgroundStyle = () => {
        if (fullScreen) {
            return {
                background: "linear-gradient(135deg, #f9fafb, #e5e7eb)"
            }
        }
        return {}
    }

    return (
        <div
            className={containerClasses}
            style={getBackgroundStyle()}
        >
            <div className="text-center">
                {/* Logo/Icône pour le fullScreen */}
                {fullScreen && (
                    <div className="w-16 h-16 mx-auto bg-black rounded-lg flex items-center justify-center mb-6 shadow-sm">
                        <div className="w-8 h-8 bg-white transform rotate-45"></div>
                    </div>
                )}

                {/* Spinner */}
                <div className="flex justify-center mb-4">
                    {getSpinner()}
                </div>

                {/* Texte */}
                {text && (
                    <p className="text-gray-600 text-sm font-medium">
                        {text}
                    </p>
                )}
            </div>
        </div>
    )
}

// Composants spécialisés pour des cas d'usage fréquents
export const AuthLoading = ({ text = "Vérification en cours..." }) => (
    <Loading
        type="pulse"
        size={15}
        color="#000000"
        text={text}
        fullScreen={true}
    />
)

export const DashboardLoading = ({ text = "Chargement des données..." }) => (
    <Loading
        type="fade"
        size={15}
        color="#374151"
        text={text}
        fullScreen={true}
    />
)

export const ButtonLoading = ({ color = "#ffffff" }) => (
    <Loading
        type="beat"
        size={8}
        color={color}
        text=""
        fullScreen={false}
        className="py-0"
    />
)

export const InlineLoading = ({ text = "Chargement...", color = "#6B7280" }) => (
    <Loading
        type="pulse"
        size={12}
        color={color}
        text={text}
        fullScreen={false}
    />
)