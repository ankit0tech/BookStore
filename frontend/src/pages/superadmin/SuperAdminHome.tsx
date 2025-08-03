import { useNavigate } from "react-router-dom";
import { getSuperAdminMenuItems } from "../../config/dashboardMenu";
import { iconMap } from "../../config/dashboardIcons";


const SuperAdminHome = () => {

    const navigate = useNavigate();

    const handleNavigate = (url: string) => {
        if(url[0] != '/') {
            navigate(`/superadmin-dashboard/${url}`);
        } else {
            navigate(url);
        }
    }

    const superAdminMenuItems = getSuperAdminMenuItems();

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Super Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {superAdminMenuItems.map((item, index) => (
                    <button 
                        key={index} 
                        className={`flex flex-col items-center p-6 border rounded-lg ${item.style}`} 
                        onClick={() => handleNavigate(item.path)}
                    >
                        <div className="mb-3">{iconMap[item.path as keyof typeof iconMap]}</div>
                        <h3 className="mb-2 font-medium">{item.label}</h3>
                        <p className="text-sm text-gray-600 text-center">{item.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );

}

export default SuperAdminHome;