import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../types";
import { getDashboardMenuItems } from "../config/dashboardMenu";
import { iconMap } from "../config/dashboardIcons";


const DashboardHome = () => {

    const navigate = useNavigate();
    const userRole = useSelector((state: RootState) => state.userinfo.userRole);

    const handleNavigate = (url: string) => {
        navigate(`/dashboard${url}`);
    }

    const menuItems = getDashboardMenuItems(userRole ?? '');


    return (
        <div className="p-6">
            <div>Dashboard</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center gap-2"
                        onClick={() => handleNavigate(item.path)}
                    >
                        {iconMap[item.path.replace('/', '') as keyof typeof iconMap]}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default DashboardHome;