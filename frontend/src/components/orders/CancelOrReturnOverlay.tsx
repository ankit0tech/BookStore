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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Send api call on the basis of type
        console.log('submitting');
        handleRequestCancelOrReturn(type, reason);
        onClose();
    }


    return (
        <div
            className='fixed inset-0 z-50 isolate flex justify-center bg-black/50 bg-opacity-50 backdrop-blur-xs overflow-y-auto'
            onClick={handleOverlayClick}
        >
            <form 
                className='relative flex flex-col gap-4 m-4 p-6 h-fit max-h-[85vh] overflow-y-auto w-full max-w-md mt-[15vh] bg-white rounded-xl shadow-lg'
                onSubmit={(e) => handleSubmit(e)}
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
                        className='text-gray-700 px-2 py-1 min-h-48 border border-gray-300 rounded-md focus:outline-hidden focus:border-blue-400'
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
                        className='w-fit px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(102,178,255,1.0)] active:shadow-[1px_1px_0px_0px_rgba(102,178,255,1.0)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out'
                        type='submit'
                    >
                        Submit
                    </button>
                    <button
                        className='w-fit px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(96,96,96,1.0)] active:shadow-[1px_1px_0px_0px_rgba(96,96,96,1.0)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out'
                        type='button'
                        onClick={onClose}
                        >
                        Cancel
                    </button>
                </div>

            </form>
        </div>
    );
}