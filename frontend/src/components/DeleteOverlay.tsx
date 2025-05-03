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
            <div className="fixed inset-0 flex items-center justify-center z-50">
                {/* backdrop with fade animation */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
                    onClick={handleOverlayClick}
                />
                {/* Dialog with scale and fade animation */}
                <div className="relative flex flex-col bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 transition-all duration-300 ease-in-out">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-medium text-gray-800 mb-2">Confirm Deletion</h3>
                        <p className="text-gray-600">
                            {`Are you sure you want to delete ${itemName || "item"}? This action can't be undone.`}
                        </p>
                    </div>
                    <div className="flex gap-4 justify-end">
                        <button
                            className="py-2 px-6 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            onClick={() => onClose()}
                        >
                            Cancel
                        </button>
                        <button
                            className="py-2 px-6 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                            onClick={handleDeleteReview}
                        >
                            Delete
                        </button>
                    </div>
                </div>
                
            </div>: null
            }
        </>
    );
}

export default DeleteOverlay;