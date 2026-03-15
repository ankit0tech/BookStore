import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../types";
import { getDashboardMenuItems } from "../config/dashboardMenu";
import { FaBars, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";


const Dashboard = () => {

    const navigate = useNavigate();
    const userRole = useSelector((state: RootState) => state.userinfo.userRole);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(localStorage.getItem('showDashboardSidebar') === 'true');
    
    const handleNavigate = (url: string) => {
        if(url[0] != '/') {
            navigate(`/dashboard/${url}`);
        } else {
            navigate(url);
        }
    }

    const isActive = (path: string) => {
        return location.pathname.startsWith(`/dashboard/${path}`)
    }

    const menuItems = getDashboardMenuItems(userRole ?? '');

    useEffect(() => {
        localStorage.setItem('showDashboardSidebar', isSidebarOpen.toString());
    }, [isSidebarOpen]);

    return (
        <div className="isolate relative h-full flex flex-row h-full min-h-0">
            <button 
                className={`absolute z-40 inset-0 sm:opacity-0 sm:pointer-events-none transition-opacity duration-200 backdrop-blur-xs bg-black/50 ${!isSidebarOpen && 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)} 
            />
            <aside className={`absolute sm:relative z-50 bg-white h-full border-r-[1.5px] sm:border-none shadow-sm sm:shadow-none overflow-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-56 p-4' : 'w-0'}`}>
                <div className="flex items-center justify-between mb-6">
                    <button 
                        className="text-xl font-semibold px-4 text-gray-800" 
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
                    <ul className="flex flex-col gap-4">
                        {menuItems.map((item) => (
                            <li key={item.label}>
                                <button 
                                    className={`whitespace-nowrap w-full text-left px-4 py-3 border-none rounded-[8px] ${isActive(item.path) ? 'bg-gray-200' : 'bg-gray-50'} cursor-pointer transition duration-200 hover:bg-gray-200`}
                                    onClick={() => handleNavigate(item.path)}>
                                        {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <main className='flex-1 p-4 sm:p-6 overflow-auto'>
                <button
                    className={`p-2 mx-4 rounded-lg hover:bg-gray-50 ${isSidebarOpen ? 'invisible' : 'inline-block'}`}
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <FaBars className="text-gray-600" />
                </button>
                <Outlet context={{ isSidebarOpen }}/>
            </main>
        </div>
    );
}

export default Dashboard;