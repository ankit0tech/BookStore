import { useEffect, useState } from "react";
import { RootState, UserInterface } from "../../types";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { AxiosResponse } from "axios";
import { enqueueSnackbar } from "notistack";
import Spinner from "../../components/Spinner";
import { useSelector } from "react-redux";

const userRoles: string[] = ['user', 'admin', 'superadmin'];

const UserUpdate = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [deactivated, setDeactivated] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const userinfo = useSelector((state: RootState) => state.userinfo);
    const isAdmin: boolean = userinfo.userRole === 'admin' || userinfo.userRole === 'superadmin';

    const navigate = useNavigate();
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;


    const handleLoadUser = (id: number|undefined) => {
        setLoading(true);

        const apiUrl = (id && isAdmin) ? `http://localhost:5555/user-management/${id}` : 'http://localhost:5555/users/details';

        api.get(apiUrl)
        .then((response: AxiosResponse) => {
            const user: UserInterface = response.data.data;
            setEmail(user.email);
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setRole(user.role || 'user');
            setDeactivated(user.deactivated);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar('Error while loading user details', { variant: 'error' });
        }).finally(() => {
            setLoading(false);
        });
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if(!email.trim()) {
            newErrors.email = 'Email is required';
        }
        if(!emailRegex.test(email.trim())) {
            newErrors.email = 'Email is invalid';
        }

        setFormErrors(newErrors);
        
        return Object.keys(newErrors).length == 0;
    }

    const handleUserUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if(!validateForm) {
            return;
        }

        setLoading(true);

        const data: Record<string, string|boolean|null|undefined> = {
            email: email,
            first_name: firstName.trim() === '' ? null : (firstName.trim() || undefined),
            last_name: lastName.trim() === '' ? null : (lastName.trim() || undefined),
        };

        if(id && isAdmin) {
            data.role = role.trim() || undefined
            data.deactivated = deactivated
        }

        const apiUrl = (id && isAdmin) ? `http://localhost:5555/user-management/${id}` : 'http://localhost:5555/users/update';

        api.put(apiUrl, data)
        .then((response: AxiosResponse) => {
            const user = response.data.data;
            setEmail(user.email);
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setRole(user.role);
            setDeactivated(user.deactivated);

            enqueueSnackbar('User updated successfully', { variant: 'success' });
        })
        .catch((error: any) => {
            console.log(error);
            enqueueSnackbar('Error while updating user details', { variant: 'error' });
        }).finally(() => {
            setLoading(false);
        });
    }

    useEffect(() => {
        handleLoadUser(Number(id));
    }, [id]);

    return (
        <div className='p-4 max-w-2xl mx-auto'>
            <h1 className='my-4 text-2xl font-semibold'>Update User</h1>
            {loading ? <Spinner />:''}

            <form className='space-y-6' onSubmit={handleUserUpdate}>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    
                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Email</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-hidden focus:border-blue-400`}
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            >
                        </input>
                        { formErrors.email && (<p className='text-sm text-red-500 mt-1'> {formErrors.title} </p>)}
                    </div>

                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>First Name</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} focus:outline-hidden focus:border-blue-400`}
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        >
                        </input>
                        { formErrors.firstName && (<p className='text-sm text-red-500 mt-1'> {formErrors.firstName} </p>)}
                    </div>
                    
                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Last Name</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.LastName ? 'border-red-500' : 'border-gray-300'} focus:outline-hidden focus:border-blue-400`}
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        >
                        </input>
                        { formErrors.firstName && (<p className='text-sm text-red-500 mt-1'> {formErrors.firstName} </p>)}
                   </div>

                    {(id && isAdmin) && (
                    <>
                        <div className=''>
                            <label className='text-sm font-semibold text-gray-600'>Role</label>
                            <select
                                className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.selectedCategory ? 'border-red-500' : 'border-gray-300'} focus:outline-hidden focus:border-blue-400`}
                                value={role}
                                onChange={(e) => {setRole(e.target.value)}}
                                disabled={!userRoles.length}
                            >
                                {userRoles?.map((role) => (
                                    <option 
                                        key={role}
                                        value={role}
                                    >
                                        {role}
                                    </option>
                                ))}
                            </select>
                            { formErrors.price && (<p className='text-sm text-red-500 mt-1'> {formErrors.price} </p>)}
                        </div>
                        
                        <div className=''>
                            <label className='text-sm font-semibold text-gray-600'>User Status</label>
                            <div className='flex items-center mt-2 space-x-3'>
                                <button 
                                    className={`inline-flex items-center rounded-full transition-colors w-11 h-6 ${deactivated ? 'bg-gray-200' : 'bg-blue-600' } focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                    type='button'  
                                    onClick={() => setDeactivated(!deactivated)}  
                                    >
                                    <span className={`inlne-block rounded-full h-4 w-4 bg-white transform transition-transform ${deactivated ? 'translate-x-1' : 'translate-x-6' }`}></span>
                                </button>
                                <span className={`text-md ${deactivated ? 'text-gray-500' : 'text-green-500'}`}>{deactivated ? 'Deactivated' : 'Active'}</span>
                            </div>
                            {formErrors.deactivated && (
                                <p className='text-sm text-red-500 mt-1'>{formErrors.deactivated}</p>
                            )}
                        </div>
                    </>
                    )}
                </div>

                <div className=" flex flex-row justify-start gap-4">
                    <button
                        // className="rounded-lg mt-2 text-white bg-purple-500 px-4 py-2 hover:bg-purple-600 h-auto"
                        className={`flex items-center justify-center gap-2 w-fit text-sm text-sky-800 font-medium px-4 py-2 ${loading ? 'cursor-not-allowed' : 'cursor-pointer'} bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(148,217,247,0.6)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out`}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        // className="rounded-lg mt-2 text-gray-700 bg-white px-4 py-2 border border-gray-300 hover:bg-gray-50 h-auto"
                        className="flex items-center justify-center gap-2 w-fit text-sm font-medium px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(212,212,218,1.0)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,1.0)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out" 
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </div>

           </form>

        </div>
    );
}

export default UserUpdate;