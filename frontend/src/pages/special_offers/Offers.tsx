import { useEffect, useState } from 'react';
import { Offer } from '../../types';
import api from '../../utils/api';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { AiOutlineEdit, AiOutlinePlus } from 'react-icons/ai';
import { MdOutlineDelete } from 'react-icons/md';
import DeleteOverlay from '../../components/DeleteOverlay';
import { FaCalendarAlt } from 'react-icons/fa';
import { CiCalendar } from 'react-icons/ci';

const Offers = () => {


    const [offers, setOffers] = useState<Offer[]|null>(null);
    const [offerToDelete, setOfferToDelete] = useState<number|null>(null);
    const { isSidebarOpen } = useOutletContext<{ isSidebarOpen: boolean }>();
    const navigate = useNavigate();
    const dateFormat : Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short', // "Feb"
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // AM/PM format
    }

    const onClose = ()=> {
        setOfferToDelete(null);
    }

    const fetchOffers = () => {

        api.get('http://localhost:5555/offers')
        .then((response) => {
            setOffers(response.data);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    useEffect(()=>{
        fetchOffers();
    }, []);

    return (
        <div className='p-4'>
            <div className='flex flex-row justify-between items-center py-6 mb-6'>
                <h2 className='font-semibold text-2xl'>Special offers</h2>
                <Link 
                    // className='flex flex-row items-center py-2 px-4 gap-2 text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200 rounded-lg'
                    className="flex gap-1 items-center w-fit text-sm text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(148,217,247,0.6)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                    to='/admin-dashboard/offer/create'
                >
                    <AiOutlinePlus className="inline"/>
                    Create new offer
                </Link>
            </div>
                
            {offers ? 
            <div className={`grid grid-cols-1 ${ isSidebarOpen ? 'md:grid-cols-2 lg:grid-cols-3': 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                    {offers.map((offer, index) => (
                        <div 
                            key={offer.id} 
                            className='relative p-6 flex flex-col gap-4 _divide-y _divide-gray-200 border rounded-lg hover:shadow-md transition-shadow duration-100'
                        >
                            {(new Date(offer.offer_valid_until) < new Date) && 
                                <div className='absolute -top-3 -right-3 px-2 py-1 font-semibold text-xs bg-red-100 inset-shadow-sm _inset-shadow-gray-100 rounded-full _border _border-gray-300 text-red-600'>
                                    expired
                                </div>
                            }
                            
                            <div className='border-b pb-4'>
                                <div className='flex flex-row justify-between items-center'>
                                    <div className='text-xl font-semibold text-gray-800'>{offer.offer_type}</div>
                                    <div className='px-2 py-1 text-gray-950 font-semibold bg-gray-100 rounded-lg border border-gray-300'>{offer.discount_percentage}% off</div>
                                </div>
                                <div className='text-sm text-gray-500'>{offer.description}</div>
                            </div>
                            <div className='flex flex-col gap-1 border-b pb-4 mb-2'>
                                <div className='flex items-center gap-2'>
                                    <span className='flex items-center space-between gap-1 text-gray-800 text-sm font-medium'><CiCalendar className='text-base font-semibold'></CiCalendar> Valid from: </span>
                                    <span className='text-sm text-gray-500'>{new Date(offer.offer_valid_from).toLocaleString('en-US', dateFormat)}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='flex items-center space-between gap-1 text-gray-800 text-sm font-medium'><CiCalendar className='text-base font-semibold'></CiCalendar> Valid until: </span>
                                    <span className='text-sm text-gray-500'> {new Date(offer.offer_valid_until).toLocaleString('en-US', dateFormat)}</span>
                                </div>
                            </div>
                            
                            <div className='flex flex-row gap-4 pb-4'>
                                <button 
                                    className="flex items-center justify-center gap-2 w-fit text-sm text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(148,217,247,0.6)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                    // className="flex items-center justify-center gap-2 w-fit text-sm font-medium px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(212,212,218,1.0)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,1.0)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"

                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-amber-700 font-medium px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(251,191,36,0.4)] active:shadow-[1px_1px_0px_0px_rgba(251,191,36,0.4)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-slate-600 font-medium px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(212,212,218,1.0)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,1.0)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                    // className="flex gap-2 w-fit text-sm text-yellow-800 font-medium px-4 py-2 bg-yellow-50/40 hover:bg-yellow-50 border border-yellow-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(255,224,32,1.0)] active:shadow-[1px_1px_0px_0px_rgba(255,224,32,1.0)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                    // className="flex items-center justify-center gap-2 w-full text-sm text-white font-medium px-4 py-2 bg-gray-900 hover:bg-[#2e2f36] _border _border-gray-800 rounded-md hover:shadow-[0px_1px_8px_0px_rgba(34,35,40,0.3)] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200 ease-in-out"
                                    
                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-gray-700 font-medium px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-400 rounded-md active:scale-99 _hover:text-white _hover:border-blue-500 _hover:bg-blue-500 transition-all duration-200 ease-in-out"
                                    
                                    
                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-sky-700 font-medium px-4 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-md active:scale-99 _hover:text-white _hover:border-blue-500 _hover:bg-blue-500 transition-all duration-200 ease-in-out"
                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-gray-700 font-medium px-4 py-2 bg-gray-50 hover:text-blue-700 hover:bg-sky-100 border border-gray-300 hover:border-blue-300 rounded-md active:scale-99 _hover:text-white _hover:border-blue-500 _hover:bg-blue-500 transition-all duration-200 ease-in-out"
                                     
 
                                    onClick={() => navigate(`/admin-dashboard/offer/edit/${offer.id}`)}
                                >
                                    <AiOutlineEdit className='text-lg _text-sky-600' />
                                    <p className='_text-sky-600'>Edit</p>
                                </button>

                                <button
                                    className="flex items-center justify-center gap-2 w-fit text-sm font-medium px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(212,212,218,1.0)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,1.0)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out" 
                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-red-600 font-medium px-4 py-2 bg-red-50/40 hover:bg-red-50 border border-red-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(251,43,55,0.4)] active:shadow-[1px_1px_0px_0px_rgba(251,43,55,0.4)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                    // className="flex items-center justify-center gap-2 w-full text-sm text-red-500 font-medium px-4 py-2 bg-red-50/40 border border-red-200 rounded-md active:scale-99 hover:bg-red-50 transition-all duration-200 ease-in-out"
                                    
                                    // className="flex items-center justify-center gap-2 w-full text-sm text-white font-medium px-4 py-2 bg-gray-900 hover:bg-[#2e2f36] _border _border-gray-800 rounded-md hover:shadow-[0px_1px_8px_0px_rgba(34,35,40,0.3)] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200 ease-in-out"
                                    
                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-red-700 font-medium px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(239,68,68,0.4)] active:shadow-[1px_1px_0px_0px_rgba(239,68,68,0.4)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out" 
                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-slate-600 font-medium px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(212,212,218,1.0)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,1.0)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out" 
                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-slate-900 font-medium px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(212,212,218,1.0)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,1.0)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out" 
                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-slate-700 font-medium px-4 py-2 bg-slate-50 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-slate-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(212,212,218,1.0)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,1.0)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(148,217,247,0.6)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                    
                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-red-600 font-medium px-4 py-2 bg-red-50/70 hover:bg-red-100/70 border border-red-300 rounded-md active:scale-99 _hover:text-white _hover:bg-red-500 _hover:border-red-500 transition-all duration-200 ease-in-out"
                                    // className="flex items-center justify-center gap-2 w-fit text-sm text-gray-700 font-medium px-4 py-2 bg-gray-50/80 hover:text-red-700 hover:bg-red-100/80 border border-gray-300 hover:border-red-300 rounded-md active:scale-99 _hover:text-white _hover:bg-red-500 _hover:border-red-500 transition-all duration-200 ease-in-out"

                                    onClick={() => setOfferToDelete(offer.id)}
                                >
                                    <MdOutlineDelete className='text-lg _text-red-600' /> 
                                    <p>Delete</p>
                                </button>

                                <DeleteOverlay
                                    itemName='offer'
                                    deleteUrl={`http://localhost:5555/offers/${offer.id}`}
                                    isOpen={offerToDelete === offer.id}
                                    onClose={onClose}
                                    onDeleteSuccess={fetchOffers}
                                />

                            </div>
                        </div>
                    ))}
            </div>
            :
            <div className='p-4 text-xl font-semibold'> No Offers </div>}
        </div>
    );
}

export default Offers;