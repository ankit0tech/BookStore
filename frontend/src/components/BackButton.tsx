import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";


const BackButton = ({ destination } : { destination?: string }) => {
    
    const navigate = useNavigate();
    const handleBackClick = () => {
        if (destination) {
            navigate(destination);
        } else if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    }

    return (
        <div className='flex'>
            <button
                onClick={handleBackClick}
                className='bg-sky-600 text-white px-4 py-1 rounded-lg w-fit'
            >
                <BsArrowLeft className='text-2xl' />
            </button>
        </div>
    );
}

export default BackButton;