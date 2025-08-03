import { FaAddressCard, FaBook, FaGift, FaHeart, FaHistory, FaList, FaShoppingCart, FaTags, FaTasks, FaUserEdit, FaUserShield } from "react-icons/fa";
import { MdOutlineAdminPanelSettings, MdOutlineAnalytics, MdOutlinePersonAdd, MdOutlineSettings } from "react-icons/md";

export const iconMap = {
    'addresses': <FaAddressCard className="text-4xl text-purple-600" />,
    'cart': <FaShoppingCart className="text-4xl text-blue-600" />,
    'orders': <FaList className="text-4xl text-blue-600" />,
    'wishlist': <FaHeart className="text-4xl text-blue-600" />,
    'recently-viewed': <FaHistory className="text-4xl text-orange-600" />,
    'categories': <FaTags className="text-4xl text-indigo-600" />,
    'offers': <FaGift className="text-4xl text-pink-600" />,
    'books/create': <FaBook className="text-4xl text-teal-600" />,
    'order-management': <FaTasks className="text-4xl text-sky-700"/>,
    'superadmin-dashboard': <FaUserShield className="text-4xl text-gray-600" />,
    'admin-dashboard': <FaUserEdit className="text-4xl text-cyan-700" />,
    'register-admin': <MdOutlinePersonAdd className="text-2xl" />,
    'manage-admins': <MdOutlineAdminPanelSettings className="text-2xl" />,
    'settings': <MdOutlineSettings className="text-2xl" />,
    'analytics': <MdOutlineAnalytics className="text-2xl" />
} as const;
