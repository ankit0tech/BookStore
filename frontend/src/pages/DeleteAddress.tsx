import { useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import api from "../utils/api";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";


const DeleteAddress = () => {
    const [ loading, setLoading ] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const { enqueueSnackbar } = useSnackbar();

    
    const handleDeleteAddress = () => {
        try {
            setLoading(loading);
    
            api
            .delete(`http://localhost:5555/address/${id}`)
            .then(()=>{
                setLoading(false);
                enqueueSnackbar('Address deleted Successfully', {variant: 'success'})
                navigate('/dashboard/addresses');
            })
            .catch((error)=>{
                setLoading(false);
                // alert('An error happened. Please check console');
                enqueueSnackbar('Error', {variant: 'error'});
                console.log(error);
            });

        } catch(error: any) {
            enqueueSnackbar("Error while deleting address", {variant: 'error'});
        }
    }

    return (
        <div className='p-4'>
            <BackButton />
            <h1 className='text-3xl my-4'>Delete Address</h1>
            {loading ? ( <Spinner /> ):''}
            <div className='flex flex-col items-center border-2 border-sky-400 rounded-xl w-[600px] p-8 mx-auto'>
                <h3 className='text-2xl'>Are you sure you want to delete this address?</h3>
                <button 
                    className='p-4 bg-red-600 text-white m-8 w-full'
                    onClick={handleDeleteAddress}
                >
                    Yes, Delete it
                </button>

            </div>
        </div>
    );
}

export default DeleteAddress;