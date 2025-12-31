import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";


const UserMailVerification = () => {

    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            verificationToken: searchParams.get('verificationToken')
        };

        api.post('/users/verify-mail', data)
        .then(() => {
            enqueueSnackbar('Verification successful please proceed with login', { variant: 'success' });
            navigate('/login');
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar('Error while verification', { variant: 'error' });
        }).finally(() => {
            setLoading(false);
        });
    }


    return (
        <div className="p-6">
            <form
                className="flex flex-col gap-6 items-center"
                onSubmit={(e) => handleFormSubmit(e)}
            >
                <div className="flex flex-col gap-2">
                    <div className="text-2xl text-gray-800 font-semibold">Verify your Email address for BookStore</div>
                    <div className="text-sm text-gray-600">Please verify your email address by clicking below button</div>
                </div>

                <button
                    className={`flex items-center justify-center gap-2 w-fit text-sm text-sky-800 font-medium px-4 py-2 ${loading ? 'cursor-not-allowed' : 'cursor-pointer'} bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(148,217,247,0.6)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out`}
                    type="submit"
                    disabled={loading}
                >
                    Verify Email Address
                </button>
            </form>
        </div>
    );
};

export default UserMailVerification;