import { enqueueSnackbar } from "notistack";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
                enqueueSnackbar(`Deleted ${itemName || 'item'} successfully`, { variant: 'success' });
                navigate(-1);
            })
            .catch((error: any) => {
                enqueueSnackbar(`Error while deleting ${itemName || 'item'}`, { variant: 'error' });
            });
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4"
                    >
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Confirm Deletion
                            </h3>
                            <p className="text-gray-600">
                                {`Are you sure you want to delete ${itemName || "this item"}? This action cannot be undone.`}
                            </p>
                        </div>
                        
                        <div className="flex justify-end gap-4">
                            <button
                                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                                onClick={handleDeleteReview}
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default DeleteOverlay;