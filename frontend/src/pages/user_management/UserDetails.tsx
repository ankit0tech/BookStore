import { useEffect, useState } from "react";
import { RootState, UserInterface } from "../../types";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { AxiosResponse } from "axios";
import { enqueueSnackbar } from "notistack";
import Spinner from "../../components/Spinner";
import { formatDateTime } from "../../utils/formatUtils";
import { FaUser, FaEnvelope, FaUserTag, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaCalendarAlt } from "react-icons/fa";
import { MdAccountCircle, MdLockClock } from "react-icons/md";
import { prettifyString } from "../../utils/formatUtils";
import { useSelector } from "react-redux";


const UserDetails = () => {

    const { id } = useParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [user, setUser] = useState<UserInterface|null>(null);

    const userinfo = useSelector((state: RootState) => state.userinfo)
    const isAdmin: boolean = userinfo.userRole === 'admin' || userinfo.userRole === 'superadmin';
    const navigate = useNavigate();

    const fetchUser = () => {
        setLoading(true);

        const apiUrl = (id && isAdmin) ? `/user-management/${id}` : '/users/details'

        api.get(apiUrl)
        .then((response: AxiosResponse) => {
            setUser(response.data.data);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar('Error while loading user details', { variant: 'error' });
        })
        .finally(() => {
            setLoading(false);
        });
    }

    useEffect(() => {
        fetchUser();
    }, [id]);


    const handleEditClick = () => {
        if(id && isAdmin) {
            navigate(`/admin-dashboard/user/edit/${id}`);
        } else {
            navigate('/dashboard/user/edit/');
        }
    }


    return (
        <div className="p-2 md:p-4 min-w-[320px]">
            {loading || !user ? (
                <Spinner />
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1 _mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
                        <p className="text-sm text-gray-600">View and manage user information</p>
                    </div>

                    <div className="flex flex-col gap-6 divide-y">
                        <div className="flex gap-4 pb-6">
                            <div className="rounded-md p-4 sm:p-8 h-fit shadow-sm">
                                <FaUser className="text-4xl sm:text-6xl text-orange-500"/>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="text-xl font-medium text-gray-900">
                                    {[user.first_name, user.last_name].filter((item) => Boolean(item)).join(' ') || '(No Name)'}
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className="text-gray-600 text-sm"><FaEnvelope/></span>
                                    <span className="text-gray-700">{user.email}</span>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 py-2">
                                    <div className="flex gap-2">
                                        {user.verified ? (
                                            <div className="flex gap-1 items-center py-1.5 px-2.5 size-fit text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                                <FaCheckCircle />
                                                <span>Verified</span>
                                            </div>
                                        ) : (
                                            <div className="flex gap-1 items-center py-1.5 px-2.5 size-fit text-xs font-medium text-red-700 bg-red-100 rounded-full">
                                                <FaTimesCircle />
                                                <span>Unverified</span>
                                            </div>
                                        )}
                                        {!user.deactivated ? (
                                            <div className="flex gap-1 items-center py-1.5 px-2.5 size-fit text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                                <FaCheckCircle />
                                                <span>Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex gap-1 items-center py-1.5 px-2.5 size-fit text-xs font-medium text-red-700 bg-red-100 rounded-full">
                                                <FaTimesCircle />
                                                <span>Deactivated</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1 items-center py-1.5 px-2.5 size-fit text-xs font-medium text-amber-700 text-blue-800 bg-blue-100 rounded-full">
                                        <FaUserTag/>
                                        <span>{user.role}</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                            
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2 items-center text-sm font-medium text-gray-700">
                                    <FaEnvelope />
                                    <span className="text-sm font-medium">Email Address</span>
                                </div>
                                <div className="text-gray-800 bg-gray-50 py-2 px-4 rounded-md border line-clamp-1">
                                    {user.email}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2 items-center text-sm font-medium text-gray-700">
                                    <MdAccountCircle className="text-lg" />
                                    <span className="text-sm font-medium">Full Name</span>
                                </div>
                                <div className="text-gray-800 bg-gray-50 py-2 px-4 rounded-md border line-clamp-2">
                                    {(user.first_name || user.last_name) ? `${user.first_name} ${user.last_name}` : 'Not Provided'}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2 items-center text-sm font-medium text-gray-700">
                                    <FaUserTag />
                                    <span className="text-sm font-medium">Role</span>
                                </div>
                                <div className="text-gray-800 bg-gray-50 py-2 px-4 rounded-md border line-clamp-1">
                                    {prettifyString(user.role)}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2 items-center text-gray-600">
                                    <FaShieldAlt />
                                    <span className="text-sm font-medium">Authentication Provider</span>
                                </div>
                                <div className="text-gray-800 bg-gray-50 py-2 px-4 rounded-md border line-clamp-1">
                                    {prettifyString(user.provider)}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2 items-center text-gray-600">
                                    <FaCheckCircle />
                                    <span className="text-sm font-medium">Verification Status</span>
                                </div>
                                {user.verified ? (
                                    <div className="text-gray-800 bg-gray-50 py-2 px-4 rounded-md border line-clamp-1">
                                        Verified
                                    </div>
                                ) : (
                                    <div className="text-red-700 bg-red-50 py-2 px-4 rounded-md border border-red-200">
                                        Unverified
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2 items-center text-gray-600">
                                    <MdAccountCircle className="text-lg" />
                                    <span className="text-sm font-medium">Account Status</span>
                                </div>
                                {!user.deactivated ? (
                                    <div className="text-gray-800 bg-gray-50 py-2 px-4 rounded-md border line-clamp-1">
                                        Active
                                    </div>
                                ) : (
                                    <div className="text-red-700 bg-red-50 py-2 px-4 rounded-md border border-red-200">
                                        Deactivated
                                    </div>
                                )}
                            </div>
                            
                            {(user.deactivated && user.deactivated_at) && (
                                <div className="flex flex-col gap-4 col-span-2">
                                    <div className="flex gap-2 items-center text-gray-600">
                                        <MdLockClock />
                                        <span className="text-sm font-medium">Deactivated At</span>
                                    </div>
                                    <div className="flex gap-2 items-center bg-gray-50 py-2 px-4 rounded-md border">
                                        <FaCalendarAlt className="text-gray-500"/>
                                        <span className="text-gray-900 font-medium_">{formatDateTime(user.deactivated_at)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="">
                            <button
                                className="whitespace-nowrap w-fit py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                // className={`flex items-center justify-center gap-2 w-fit text-sm text-sky-800 font-medium px-4 py-2 ${loading ? 'cursor-not-allowed' : 'cursor-pointer'} bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(148,217,247,0.6)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out`}
                                type="button"
                                disabled={loading}
                                onClick={() => handleEditClick()}
                            >
                                Edit Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserDetails;