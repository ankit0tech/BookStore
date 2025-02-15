import { enqueueSnackbar } from "notistack";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";


interface OverlayProps {
    deleteUrl: string;
    itemName?: string;
    isOpen: boolean;
    onClose: () => void;
}

const DeleteOverlay: React.FC<OverlayProps> = ({ deleteUrl, itemName, isOpen, onClose }) => {
    
    const navigate = useNavigate();

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
    

    const handleDeleteReview = () => {

        api.delete(deleteUrl)
        .then((response) => {
            
            enqueueSnackbar(`Deleted ${itemName || 'item'} successfully`, { variant: 'success'});
            navigate(-1);
        })
        .catch((error: any) =>{
            enqueueSnackbar(`Error while deleting ${itemName || 'item'}`, {variant: 'error'});
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
                        {`Please confirm you want to delete ${itemName || "item"}`}
                    </div>
                    <button
                        className="rounded-full mt-2 text-white bg-red-500 px-4 py-2 border border-gray-300"
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

export default DeleteOverlay;