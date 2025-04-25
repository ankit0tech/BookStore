import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../types";
import { getDashboardMenuItems } from "../config/dashboardMenu";


const Dashboard = () => {

    const navigate = useNavigate();
    const userRole = useSelector((state: RootState) => state.userinfo.userRole);
    
    const handleNavigate = (url: string) => {
        navigate(`/dashboard${url}`);
    }

    const isActive = (path: string) => {
        return location.pathname.startsWith(`/dashboard${path}`)
    }

    const menuItems = getDashboardMenuItems(userRole ?? '');


    return (
        <div className="h-full flex">
            <aside className="w-56 p-4 overflow-y-auto h-full">
                <button 
                    className="text-2xl mb-6 m-2 px-4 py-3"
                    onClick={() => handleNavigate('/')}> 
                        Dashboard 
                </button>
                <nav>
                    <ul className="">
                        {menuItems.map((item) => (
                            <li>
                                <button 
                                    className={`w-full text-left m-2 px-4 py-3 border-none rounded-[8px] ${isActive(item.path) ? 'bg-[#e0e7ff]' : 'bg-[#f8f9fa]'} cursor-pointer transition duration-200 hover:bg-[#e0e7ff]`} 
                                    onClick={() => handleNavigate(item.path)}>
                                        {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="p-6 flex-1 overflow-y-auto h-full">
                <Outlet/>
            </main>
        </div>
    );
}

export default Dashboard;