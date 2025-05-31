import { useSelector } from "react-redux";
import { RootState } from "../types";
import api from "../utils/api";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";


const RegisterAdmin = () => {

    const [ email, setEmail ] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const userRole = useSelector((state: RootState) => state.userinfo.userRole);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if(!email.trim()) {
            newErrors.email = 'Email is requierd';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(email)) {
                newErrors.email = 'Please enter a valid email address';
            }
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();

            if(!validateForm()) {
                return;
            }

            await api.post('http://localhost:5555/admin/generate-admin-signup-token', {
                email: email
            });
            enqueueSnackbar(`Sent admin registration mail to ${email}`, { variant: 'success' });
            setEmail('');

        } catch(error: any) {
            enqueueSnackbar('Error occurred please try again later', { variant: 'error' });
        }
    }



    return ( 
        <div className="max-w-md mx-auto p-6">
            {userRole == 'superadmin' ? 
                (<div>
                <h2 className="text-2xl text-gray-800 font-semibold my-6">Register new admin user</h2>
                <form 
                    onSubmit={ handleSubmit }
                    className="flex flex-col space-y-2"
                >
                    <label className="text-sm font-medium text-gray-700" htmlFor='adminEmail'>Enter mail to send invite</label>
                    <input 
                        className={`rounded-lg px-4 py-2 border ${formErrors.email ? 'border-red-500':'border-gray-300'} focus:outline-none focus:border-blue-400`}
                        type='email'
                        id='adminEmail'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    >
                    </input>
                    {formErrors.email && (<p className="text-sm text-red-500">{formErrors.email}</p>)}
                    
                    <button 
                        className="w-max px-4 py-2 my-6 rounded-lg text-white bg-purple-500 border border-gray-300 hover:bg-purple-600"
                        type='submit'
                    >
                        Send invite
                    </button>
                </form>
                </div>)
            :
                (<div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center p-8 bg-red-50 rounded-lg">
                        <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
                        <p className="text-gray-600">You don't have permission to access this page.</p>
                    </div>
                </div>)}
        </div>
    );
}

export default RegisterAdmin;