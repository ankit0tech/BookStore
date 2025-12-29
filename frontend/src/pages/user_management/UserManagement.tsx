import { useState, useEffect, useRef } from "react";
import { UserInterface } from "../../types";
import api from "../../utils/api";
import { AxiosResponse } from "axios";
import { enqueueSnackbar } from "notistack";
import { FaUserFriends } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { MdDeleteOutline } from "react-icons/md";
import DeleteOverlay from "../../components/DeleteOverlay";


const UserManagement = () => {
    const [users, setUsers] = useState<UserInterface[]>([]);
    const [nextCursor, setNextCursor] = useState<number|null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterUserRole, setFilterUserRole] = useState<string>('');
    const [filterVerified, setFilterVerified] = useState<string>('');

    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [activeUsers, setActiveUsers] = useState<number>(0);
    const [verifiedUsers, setVerifiedUsers] = useState<number>(0);
    const [normalUsers, setNormalUsers] = useState<number>(0);
    const [adminUsers, setAdminUsers] = useState<number>(0);
    const [superadminUsers, setSuperadminUsers] = useState<number>(0);

    const [showDeleteOption, setShowDeleteOption] = useState<boolean>(false);
    const [userToBeDeleted, setUserToBeDeleted] = useState<number|null>(null);

    const observeRef = useRef(null);
    const navigate = useNavigate();

    const handleFetchUsers = (prevUsers: UserInterface[], nextCursor: number|null) => {
        const params = new URLSearchParams();

        if(nextCursor) {
            params.append('cursor', String(nextCursor));
        }
        if(searchQuery.trim()) {
            params.append('searchQuery', searchQuery.trim());
        }
        if(filterStatus.trim()) {
            params.append('filterStatus', filterStatus.trim());
        }
        if(filterUserRole.trim()) {
            params.append('filterUserRole', filterUserRole.trim());
        }
        if(filterVerified.trim()) {
            params.append('filterVerified', filterVerified.trim());
        }

        
        api.get(`http://localhost:5555/user-management?${params.toString()}`)
        .then((response: AxiosResponse) => {
            setUsers(() => {
                const prevUserIds = new Set(prevUsers.map((u) => u.id));
                const newUsers = response.data.users.filter((user: UserInterface) => !prevUserIds.has(user.id));
                return [...prevUsers, ... newUsers];
            });
            setNextCursor(response.data.nextCursor);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar('Error while loading users', {variant: 'error'});
        });
    }

    const handleFetchUserStats = () => {
        api.get('http://localhost:5555/user-management/user-stats')
        .then((response: AxiosResponse) => {
            setTotalUsers(response.data.totalUsers);
            setActiveUsers(response.data.activeUsers);
            setVerifiedUsers(response.data.verifiedUsers);
            setNormalUsers(response.data.normalUsers);
            setAdminUsers(response.data.adminUsers);
            setSuperadminUsers(response.data.superadminUsers);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar('Error while loading user stats', {variant: 'error'});
        });
    }

    useEffect(() => {
        handleFetchUserStats();
        handleFetchUsers([], null);
    }, [searchQuery, filterStatus, filterUserRole, filterVerified]);

    useEffect(() => {
        if(!nextCursor || !observeRef.current) return;
        
        const observer = new IntersectionObserver(
            (entries: IntersectionObserverEntry[]) => {
                if(entries[0].isIntersecting) {
                    handleFetchUsers(users, nextCursor);
                }
            },
            { threshold: 1 }
        );

        if(observeRef.current) observer.observe(observeRef.current);

        return () => {
            if(observeRef.current) observer.unobserve(observeRef.current);
            observer.disconnect();
        }
    }, [users.length, nextCursor]);


    return (
        <div className="w-full min-w-[850px]">
            <div className="flex flex-col gap-4 mb-8">
                <div  className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-2 mt-4 text-2xl font-semibold"><FaUserFriends className="inline text-2xl text-violet-700"/> User Management</div>
                </div>

                <div className="my-2 flex items-center gap-2">
                    <div className="relative flex items-center w-full">
                        <BiSearch className="mx-3 mt-0.5 absolute text-md text-gray-400"/>
                        <input 
                            className="w-full min-w-48 pl-9 py-2 rounded-md border outline-hidden"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') handleFetchUsers([], null);
                            }}
                        ></input>
                    </div>
                    <div className="px-4 py-2 outline-hidden border focus:border-blue-300 rounded-md">
                        <select 
                            className=""
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="deactivated">Deactivated</option>
                        </select>
                    </div>
                    <div className="px-4 py-2 outline-hidden border focus:border-blue-300 rounded-md">
                        <select 
                            className=""
                            value={filterUserRole}
                            onChange={(e) => setFilterUserRole(e.target.value)}
                        >
                            <option value="">All Roles</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                    </div>
                    <div className="px-4 py-2 outline-hidden border focus:border-blue-300 rounded-md">
                        <select
                            className=""
                            value={filterVerified}
                            onChange={(e) => setFilterVerified(e.target.value)}
                        >
                            <option value="">All Verification Status</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                        </select>
                    </div>
                </div>

                <div className="my-2 flex flex-row gap-2">
                    <div className="flex flex-col bg-blue-50 p-4 w-full rounded-lg">
                        <div className="text-sm text-blue-600">Total Users</div>
                        <div className="font-bold text-xl text-blue-800">{totalUsers}</div>
                    </div>
                    <div className="flex flex-col bg-green-50 p-4 w-full rounded-lg">
                        <div className="text-sm text-green-600">Active Users</div>
                        <div className="font-bold text-xl text-green-800">{activeUsers}</div>
                    </div>
                    <div className="flex flex-col bg-sky-50 p-4 w-full rounded-lg">
                        <div className="text-sm text-sky-600">Verified Users</div>
                        <div className="font-bold text-xl text-sky-800">{verifiedUsers}</div>
                    </div>
                    <div className="flex flex-col bg-teal-50 p-4 w-full rounded-lg">
                        <div className="text-sm text-teal-600">Normal Users</div>
                        <div className="font-bold text-xl text-teal-800">{normalUsers}</div>
                    </div>
                    <div className="flex flex-col bg-yellow-50 p-4 w-full rounded-lg">
                        <div className="text-sm text-yellow-600">Admin Users</div>
                        <div className="font-bold text-xl text-yellow-800">{adminUsers}</div>
                    </div>
                    <div className="flex flex-col bg-red-50 p-4 w-full rounded-lg">
                        <div className="text-sm text-red-600">Superadmin Users</div>
                        <div className="font-bold text-xl text-red-800">{superadminUsers}</div>
                    </div>
                </div>

            </div>

            <table className="border border-gray-200 w-full">
                <thead className="">
                    <tr className="text-gray-700 bg-gray-100 text-xs text-left">
                        <th className="px-8 py-4 font-normal">EMAIL</th>
                        <th className="px-2 py-4 font-normal">ROLE</th>
                        <th className="px-2 py-4 font-normal">ACTIVATION STATUS</th>
                        <th className="px-2 py-4 font-normal">VERIFICATION STATUS</th>
                        <th className="px-2 py-4 font-normal">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {users && users.map((user) => (
                        <tr className="text-sm border" key={user.id}>
                            <td className="px-8 py-4">
                                <div className="font-medium _text-gray-500"> {user.email}</div>
                                <div className="_font-medium text-gray-500">{user.first_name} {user.last_name}</div>
                            </td>
                            <td className="px-2 py-4">{user.role || "Uncategorized"}</td>
                            <td className="px-2 py-4">
                                <div className={`px-2 py-0.5 rounded-full size-fit text-xs font-medium ${user.deactivated ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {user.deactivated ? "deactivated" : "active"}
                                </div>
                            </td>
                            <td className="px-2 py-4"> 
                                <div className={`px-2 py-0.5 rounded-full size-fit text-xs font-medium ${user.verified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {user.verified ? 'verified' : 'unverified'}
                                </div>
                            </td>
                            <td>
                                <div className="flex items-center gap-2">
                                    <button 
                                        className="text-yellow-600 text-lg"
                                        onClick={() => navigate(`/admin-dashboard/users/edit/${user.id}`)}
                                    >
                                        <AiOutlineEdit/>
                                    </button>
                                    <button 
                                        className={`${user.deactivated ? 'text-red-400' : 'text-red-600'} text-lg`}
                                        onClick={() => {setUserToBeDeleted(user.id); setShowDeleteOption(true)}}
                                        disabled={user.deactivated}
                                    >
                                        <MdDeleteOutline/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <DeleteOverlay
                deleteUrl={`http://localhost:5555/user-management/${userToBeDeleted}`}
                itemName='user'
                isOpen={showDeleteOption}
                onClose={()=>setShowDeleteOption(false)}
            />

            {nextCursor && <div id='loadNextPage' ref={observeRef} className="h-10 w-full"></div>}
        </div>
    );
}

export default UserManagement;