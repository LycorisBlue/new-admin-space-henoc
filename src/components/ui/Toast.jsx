import { Toaster } from 'react-hot-toast'

export default function Toast() {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#363636',
                    color: '#fff',
                    fontSize: '14px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                success: {
                    style: {
                        background: '#10B981',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#10B981',
                    },
                },
                error: {
                    style: {
                        background: '#EF4444',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#EF4444',
                    },
                },
                loading: {
                    style: {
                        background: '#3B82F6',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#3B82F6',
                    },
                },
            }}
        />
    )
}