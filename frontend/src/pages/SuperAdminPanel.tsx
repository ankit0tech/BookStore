import { MdOutlineAdminPanelSettings, MdOutlineAnalytics, MdOutlinePersonAdd, MdOutlineSettings } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const SuperAdminPanel = () => {

    const navigate = useNavigate();

    const superAdminOptions = [
        {
            icon: <MdOutlinePersonAdd className="text-2xl" />,
            title: 'Add New Admin',
            description: 'Register a new administrator to manage the bookstore',
            style: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
            redirectUrl: '/dashboard/superadmin/register-admin'
        },
        {
            icon: <MdOutlineAdminPanelSettings className="text-2xl" />,
            title: 'Manage Admins',
            description: 'View and manage existing administrators',
            style: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
            redirectUrl: '/dashboard/superadmin/manage-admins'
        },
        {
            icon: <MdOutlineSettings className="text-2xl" />,
            title: "System Settings",
            description: "Configure system-wide settings and preferences",
            style: 'text-green-600 bg-green-50 hover:bg-green-100',
            redirectUrl: '/dashboard/superadmin/settings',
        },
        {
            icon: <MdOutlineAnalytics className="text-2xl" />,
            title: 'Analytics',
            description: 'View system analytics and reports',
            style: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
            redirectUrl: '/dashboard/superadmin/analytics'
        }
    ]

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Super Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {superAdminOptions.map((item, index) => (
                    <button 
                        key={index} 
                        className={`flex flex-col items-center p-6 border rounded-lg ${item.style}`} 
                        onClick={() => navigate(item.redirectUrl)}
                    >
                        <div className="mb-3">{item.icon}</div>
                        <h3 className="mb-2 font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-600 text-center">{item.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );

}

export default SuperAdminPanel;