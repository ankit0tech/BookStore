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
        <div className="flex flex-col items-center w-full p-6">
            <form
                className="flex flex-col items-center max-w-sm min-w-[280px] _sm:min-w-[320px] gap-6 items-center"
                onSubmit={(e) => handleFormSubmit(e)}
            >
                <div className="flex flex-col gap-2">
                    <div className="text-2xl text-gray-800 font-semibold">Verify your Email address for BookStore</div>
                    <div className="text-sm text-gray-600">Please verify your email address by clicking below button</div>
                </div>

                <button
                    className="w-full py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
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