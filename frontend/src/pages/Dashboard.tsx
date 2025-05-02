import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../types";
import { getDashboardMenuItems } from "../config/dashboardMenu";
import { FaBars, FaTimes } from "react-icons/fa";
import { useState } from "react";


const Dashboard = () => {

    const navigate = useNavigate();
    const userRole = useSelector((state: RootState) => state.userinfo.userRole);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    
    const handleNavigate = (url: string) => {
        navigate(`/dashboard${url}`);
    }

    const isActive = (path: string) => {
        return location.pathname.startsWith(`/dashboard${path}`)
    }

    const menuItems = getDashboardMenuItems(userRole ?? '');


    return (
        <div className="h-full flex">
            <aside className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-56 p-4' : 'w-0'} overflow-y-auto`}>
                <div className="flex items-center justify-between mb-6">
                    <button 
                        className="text-2xl px-4 m-2 text-gray-800" 
                        onClick={() => navigate('/dashboard')}
                    >
                        Dashboard
                    </button>
                    
                    <button
                        className="p-2 rounded-lg hover:bg-gray-100"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <FaTimes className="text-gray-600" />
                    </button>
                </div>

                <nav>
                    <ul className="">
                        {menuItems.map((item) => (
                            <li key={item.label}>
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

            <main className='flex-1 p-6 overflow-y-auto'>
                {!isSidebarOpen && (
                    <button
                        className="p-2 rounded-lg hover:bg-gray-50"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <FaBars className="text-gray-600" />
                    </button>
                )}
                <Outlet context={{ isSidebarOpen }}/>
            </main>
        </div>
    );
}

export default Dashboard;