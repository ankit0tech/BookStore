import { enqueueSnackbar } from "notistack";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";


interface OverlayProps {
    id: string | undefined
    isOpen: boolean;
    onClose: () => void;
}

const DeleteReviewOverlay: React.FC<OverlayProps> = ({ id, isOpen, onClose }) => {
    
    const navigate = useNavigate();

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
    

    const handleDeleteReview = () => {

        api.delete(`http://localhost:5555/review/${id}`)
        .then((response) => {
            console.log(response.data);
            enqueueSnackbar('Deleted review successfully', { variant: 'success'});
            navigate(-1);
        })
        .catch((error: any) =>{
            enqueueSnackbar('Error while deleting review', {variant: 'error'});
        });
    }

    return (
        <>
            {isOpen ?
            <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 text-black font-normal"
                onClick={handleOverlayClick}
            >
                <div className="flex flex-col bg-white p-6 rounded-[18px] border border-b-2 border-black">
                    <div className="p-2">
                        Please confirm you want to delete the review
                    </div>
                    <button
                        className="rounded-full mt-2 text-white bg-red-600 px-4 py-2 border border-gray-300"
                        onClick={handleDeleteReview}
                    >
                        Confirm Delete
                    </button>
                </div>
                
            </div>: null
            }
        </>
    );
}

export default DeleteReviewOverlay;