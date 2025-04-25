import { FaAddressCard, FaBook, FaGift, FaHeart, FaHistory, FaList, FaShoppingCart, FaTags, FaUserShield } from "react-icons/fa";

export const iconMap = {
    'addresses': <FaAddressCard className="text-4xl text-purple-600" />,
    'cart': <FaShoppingCart className="text-4xl text-blue-600" />,
    'orders': <FaList className="text-4xl text-blue-600" />,
    'wishlist': <FaHeart className="text-4xl text-blue-600" />,
    'recently-viewed': <FaHistory className="text-4xl text-orange-600" />,
    'categories': <FaTags className="text-4xl text-indigo-600" />,
    'offers': <FaGift className="text-4xl text-pink-600" />,
    'books/create': <FaBook className="text-4xl text-teal-600" />,
    'superadmin-panel': <FaUserShield className="text-4xl text-gray-600" />
} as const;
