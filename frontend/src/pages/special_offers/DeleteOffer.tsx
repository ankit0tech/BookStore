import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";


const DeleteOffer = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const handleDeleteOffer = () => {
        
        api.delete(`http://localhost:5555/offer/${id}`)
        .then((response) => {
            enqueueSnackbar('Successfully deleted offer', {variant: 'success'});
            navigate(-1);
        })
        .catch((error: any) => {
            console.log(error);
            enqueueSnackbar('Error while deleting offer', {variant: 'error'});
        })
    }


    return (
        <div className="p-4">
            <div className='flex flex-col items-center border-2 border-sky-400 rounded-xl w-[600px] p-8 mx-auto'>
                <h3 className='text-2xl'>Are you sure you want to delete this offer?</h3>
                <button 
                    className='p-4 bg-red-600 text-white m-8 w-full'
                    onClick={handleDeleteOffer}
                >
                    Yes, Delete it
                </button>

            </div>
        </div>
    );
}

export default DeleteOffer;