import { useEffect, useState } from "react";
import { RootState, user_roles, UserInterface } from "../../types";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { AxiosResponse } from "axios";
import { enqueueSnackbar } from "notistack";
import Spinner from "../../components/Spinner";
import { useSelector } from "react-redux";
import DropDownMenu from "../../components/DropDownMenu";
import { prettifyString } from "../../utils/formatUtils";


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

        const apiUrl = (id && isAdmin) ? `/user-management/${id}` : '/users/details';

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

        const apiUrl = (id && isAdmin) ? `/user-management/${id}` : '/users/update';

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
        <div className='p-2 md:p-4 flex flex-col gap-4 min-w-[320px] max-w-2xl mx-auto'>
            <h1 className='text-xl font-semibold text-gray-800'>Update User</h1>
            { loading ? <Spinner /> : '' }

            <form 
                className="flex flex-col gap-4" 
                onSubmit={handleUserUpdate}
            >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    
                    <div className='flex flex-col gap-1 w-full'>
                        <label htmlFor="input-email" className="block text-sm font-medium text-gray-700">Email </label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="text"
                            id="input-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            >
                        </input>
                        { formErrors.email && (<p className='text-sm text-red-500 mt-1'> {formErrors.title} </p>)}
                    </div>

                    <div className='flex flex-col gap-1 w-full'>
                        <label htmlFor="input-first-name" className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="text"
                            id="input-first-name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        >
                        </input>
                        { formErrors.firstName && (<p className='text-sm text-red-500 mt-1'> {formErrors.firstName} </p>)}
                    </div>
                    
                    <div className='flex flex-col gap-1 w-full'>
                        <label htmlFor="input-last-name" className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="text"
                            id="input-last-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        >
                        </input>
                        { formErrors.lastName && (<p className='text-sm text-red-500 mt-1'> {formErrors.lastName} </p>)}
                   </div>

                    {(id && isAdmin) && (
                    <>
                        <div className='flex flex-col gap-1 w-full'>
                            <label htmlFor="input-last-name" className="block text-sm font-medium text-gray-700">Role</label>
                            <DropDownMenu 
                                title="Role"
                                selectedOptionStatus={role}
                                setSelectedOptionStatus={setRole}
                                options={user_roles}
                                getLabel={(status) => prettifyString(status)}                                
                            />
                            {formErrors.userRole && (<p className='text-sm text-red-500 mt-1'> {formErrors.userRole} </p>)}
                        </div>
                        
                        <div className='flex flex-col gap-1 w-full'>
                            <label htmlFor="input-last-name" className="block text-sm font-medium text-gray-700">User Status</label>
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
                            {formErrors.deactivated && (<p className='text-sm text-red-500 mt-1'>{formErrors.deactivated}</p>)}
                        </div>
                    </>
                    )}
                </div>

                <div className=" flex flex-row justify-end gap-4">
                    <button
                        className="w-fit py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        className="w-fit py-2 px-4 font-medium text-gray-800 hover:text-gray-900 hover:bg-orange-50 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
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