import { useNavigate } from "react-router-dom";
import { getAdminMenuItems } from "../../config/dashboardMenu";
import { iconMap } from "../../config/dashboardIcons";


const AdminHome = () => {

    const navigate = useNavigate();

    const handleNavigate = (url: string) => {
        if(url[0] != '/') {
            navigate(`/admin-dashboard/${url}`);
        } else {
            navigate(url);
        }
    }

    const menuItems = getAdminMenuItems();


    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center gap-2"
                        onClick={() => handleNavigate(item.path)}
                    >
                        {iconMap[item.path as keyof typeof iconMap]}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default AdminHome;