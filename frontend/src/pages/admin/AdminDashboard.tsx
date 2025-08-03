import { Outlet, useNavigate } from "react-router-dom";
import { getAdminMenuItems } from "../../config/dashboardMenu";
import { FaBars, FaTimes } from "react-icons/fa";
import { useState } from "react";


const AdminDashboard = () => {

    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    
    const handleNavigate = (url: string) => {
        if(url[0] != '/') {
            navigate(`/admin-dashboard/${url}`);
        } else {
            navigate(url);
        }
    }

    const isActive = (path: string) => {
        return location.pathname.startsWith(`/admin-dashboard/${path}`)
    }

    const menuItems = getAdminMenuItems();


    return (
        <div className="h-full flex">
            <aside className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-56 p-4' : 'w-0'} overflow-y-auto`}>
                <div className="flex items-center justify-between mb-6">
                    <button 
                        className="text-xl font-semibold m-2 text-gray-800" 
                        onClick={() => navigate('/admin-dashboard')}
                    >
                        Admin Dashboard
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
                        className="p-2 mx-2 rounded-lg hover:bg-gray-50"
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

export default AdminDashboard;