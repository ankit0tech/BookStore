
export const getDashboardMenuItems = (userRole: string): {label: string, path: string, style: string, description: string}[] => {
    return [
        { 
            label: 'Addresses', 
            path: 'addresses',
            style:'',
            description: ''
        },
        { 
            label: 'Cart', 
            path: 'cart',
            style:'',
            description: ''
        },
        { 
            label: 'Orders', 
            path: 'orders',
            style:'',
            description: ''
        },
        { 
            label: 'Wishlist', 
            path: 'wishlist',
            style:'',
            description: ''
        },
        { 
            label: 'Recently Viewed', 
            path: 'recently-viewed',
            style:'',
            description: ''
        },

        ...(userRole === 'admin' || userRole == 'superadmin' ? [
            {
                label: 'Admin Dashboard',
                path: '/admin-dashboard',
                style: '',
                description: ''
            }
        ] : []),

        ...(userRole === 'superadmin' ? [
            { 
                label: 'Superadmin Dashboard', 
                path: '/superadmin-dashboard',
                style: '',
                description: ''
            },
        ]: [])
    ];
}


export const getSuperAdminMenuItems = (): {label: string, path: string, style: string, description: string}[] => {
    return [
        { 
            label: 'Register Admin', 
            path: 'register-admin',
            style: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
            description: 'Register a new administrator to manage the bookstore'
        },
        { 
            label: 'Manage Admins', 
            path: 'manage-admins',
            style: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
            description: 'View and manage existing administrators'
        },
        { 
            label: 'System Settings', 
            path: 'settings',
            style: 'text-green-600 bg-green-50 hover:bg-green-100',
            description: "Configure system-wide settings and preferences"
        },
        { 
            label: 'Analytics', 
            path:'analytics',
            style: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
            description: 'View system analytics and reports'
        }
    ];
}


export const getAdminMenuItems = (): {label: string, path: string, style: string, description: string}[] => {
    return [
        { 
            label: 'Categories', 
            path: 'categories',
            style:'',
            description: ''
        },
        { 
            label: 'Offers', 
            path: 'offers',
            style:'',
            description: ''    
        },
        { 
            label: 'Add new book', 
            path: 'books/create',
            style:'',
            description: ''    
        },
        { 
            label: 'Order management', 
            path: 'order-management',
            style:'',
            description: ''
        },
        {
            label: 'Book management',
            path: 'book-management',
            style: '',
            description: ''
        },
        {
            label: 'User management',
            path: 'user-management',
            style: '',
            description: ''
        }
    ];
}
