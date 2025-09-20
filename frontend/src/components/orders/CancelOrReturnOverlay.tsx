import { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import api from '../../utils/api';
import { enqueueSnackbar } from 'notistack';

interface OverlayProps {
    // isOpen: boolean,
    onClose: () => void,
    handleRequestCancelOrReturn: (requestName: string, reason: string) => void,
    type?: 'cancel' | 'return'
}

export const CancelOrReturnOverlay: React.FC<OverlayProps> = ({ onClose, handleRequestCancelOrReturn, type='cancel' }) => {

    const [reason, setReason] = useState<string>('');
    const heading = type == 'cancel' ? 'Request Cancellation' : 'Request Return';
    const description = type == 'cancel' ? 
        'Please specify reason for cancellation, action might not be reversible' 
        : 
        'Please specify reason for return';

    
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    const handleSubmit = () => {
        // Send api call on the basis of type
        console.log('submitting');
        handleRequestCancelOrReturn(type, reason);
        onClose();
    }


    return (
        <div
            className='fixed inset-0 z-50 isolate flex justify-center bg-black bg-opacity-50 backdrop-blur-xs'
            onClick={handleOverlayClick}
        >
            <form 
                className='relative flex flex-col gap-4 m-4 p-6 h-fit max-h-[85vh] overflow-y-auto w-full max-w-md mt-[15vh] bg-white rounded-xl shadow-lg'
                onSubmit={handleSubmit}
            >
                <div className='flex flex-row justify-between items-center'>
                    <h2 className='text-xl font-semibold text-gray-900'>{heading}</h2>
                    <button
                        type='button'
                        className='text-gray-500 font-semibold hover:text-gray-700'
                        onClick={onClose}
                        aria-label="Close"
                        >
                        <RxCross2 className=""/>
                    </button>
                </div>
                
                <p className='text-sm text-gray-600'>{description}</p>
                

                <div className='flex flex-col gap-2'>
                    <label 
                        className='text-sm font-semibold text-gray-700'
                        htmlFor="reason-text"
                        >Reason <span className='text-red-500'>*</span>
                    </label> 
                    <textarea 
                        className='text-gray-700 px-2 py-1 min-h-48 border rounded-md focus:outline-hidden focus:border-blue-400'
                        placeholder='Please enter your reason...'
                        id="reason-text"
                        maxLength={500}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <p className='text-xs text-gray-500 ml-auto'>{reason.length}/500</p>
                </div>

                <div className='flex flex-row gap-4'>
                    <button
                        className='w-full px-6 py-2.5 rounded-lg text-gray-700 border hover:bg-gray-50 transition-all duration-200'
                        type='button'
                        onClick={onClose}
                        >
                        Cancel
                    </button>
                    <button 
                        className='w-full px-6 py-2.5 bg-blue-500 rounded-lg text-white hover:bg-blue-600 hover:shdow-lg tranistion-all duration-200'
                        type='submit'
                        >
                        Submit
                    </button>
                </div>

            </form>
        </div>
    );
}