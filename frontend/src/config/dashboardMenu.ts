
export const getDashboardMenuItems = (userRole: string): {label: string, path: string}[] => {
    return [
        { label: 'Addresses', path: '/addresses'},
        { label: 'Cart', path: '/cart'},
        { label: 'Orders', path: '/orders'},
        { label: 'Wishlist', path: '/wishlist'},
        { label: 'Recently Viewed', path: '/recently-viewed'},
        ...(userRole === 'admin' || userRole === 'superadmin' ? [
            { label: 'Categories', path: '/categories'},
            { label: 'Offers', path: '/offers'},
            { label: 'Add new book', path: '/books/create'}
        ] : []),
        ...(userRole === 'superadmin' ? [
            { label: 'Superadmin Panel', path: '/superadmin-panel'}
        ]: [])
    ];
} 