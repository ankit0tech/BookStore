import { useSelector } from "react-redux";
import { RootState } from "../types";
import api from "../utils/api";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";


const RegisterAdmin = () => {

    const [ email, setEmail ] = useState('');
    const userRole = localStorage.getItem('userRole');
    
    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            await api.post('http://localhost:5555/admin/generate-admin-signup-token', {
                email: email
            });
            enqueueSnackbar(`Sent admin registration mail to ${email}`, { variant: 'success' });

        } catch(error: any) {
            enqueueSnackbar('Error occurred please try again later', { variant: 'error' });
        }
    }



    return ( 
        <div className="p-4 my-4">
            {
                userRole == 'superadmin' ? 
                <form 
                    onSubmit={ handleSubmit }
                    className="flex flex-col min-w-1/4 max-w-[300px] mx-auto"
                >
                    <label htmlFor='adminEmail'>Enter mail to sent invite to register admin</label>
                    <input 
                        className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                        type='email'
                        id='adminEmail'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    >
                    </input>
                    <button 
                        className="rounded-full my-4 text-white bg-purple-500 my-3 px-4 py-2 border border-gray-300"
                        type='submit'>Send invite</button>
                </form> 
            :
                <div className="p-4">Access Denied</div>
            } 
        </div> 
    );
}

export default RegisterAdmin;