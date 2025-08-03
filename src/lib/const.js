class Constants {
    static API = {
        BASE_URL: "https://china-test.api-medev.com",
        ENDPOINTS: {
            AUTH: '/auth',
            USERS: '/users',
            REQUESTS: '/requests',
            INVOICES: '/invoices',
            PAYMENTS: '/payments'
        }
    }

    static HTTP = {
        TIMEOUT: 10000,
        HEADERS: {
            'Content-Type': 'application/json'
        }
    }
}

export default Constants