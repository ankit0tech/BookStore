import { useEffect, useState } from 'react';
import { Offer } from '../../types';
import api from '../../utils/api';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { AiOutlineEdit, AiOutlinePlus } from 'react-icons/ai';
import { MdOutlineDelete } from 'react-icons/md';
import DeleteOverlay from '../../components/DeleteOverlay';
import { FaCalendarAlt } from 'react-icons/fa';
import { CiCalendar } from 'react-icons/ci';
import { BiSearch } from 'react-icons/bi';
import { prettifyString } from '../../utils/formatUtils';
import { enqueueSnackbar } from 'notistack';

const expiry_statuses = ['expired', 'valid'];
type ExpiryStatus = typeof expiry_statuses[number];

const percentage_filters = [10, 15, 20, 30, 50]
type PercentageFilter = typeof percentage_filters[number];


const Offers = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [offers, setOffers] = useState<Offer[]|null>(null);
    const [offerToDelete, setOfferToDelete] = useState<number|null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expiryStatus, setExpiryStatus] = useState<ExpiryStatus|''>('');
    const [percentageFilter, setPercentageFilter] = useState<PercentageFilter>(0);

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
        setLoading(true);

        const params = new URLSearchParams();

        if(searchQuery) params.append('query', searchQuery);
        if(expiryStatus) params.append('expiryStatus', expiryStatus);
        if(percentageFilter) params.append('percentageFilter', percentageFilter.toString());

        api.get(`http://localhost:5555/offers?${params.toString()}`)
        .then((response) => {
            setOffers(response.data);
            setLoading(false);
        })
        .catch((error) => {
            console.log(error);
            setLoading(false);
            enqueueSnackbar('Failed to load offers', {variant: "error"});
        })
    }

    useEffect(() => {
        fetchOffers();
    }, [expiryStatus, percentageFilter]);

    return (
        <div className='max-w-6xl mx-auto'>
            <div className='flex flex-row justify-between items-center mb-6'>
                <div className='flex flex-col'>
                    <h2 className='text-3xl font-semibold text-gray-900'>Special offers</h2>
                    <p className='mt-2 text-sm text-gray-600'>Manage special offers</p>
                </div>
                <Link 
                    // className='flex flex-row items-center py-2 px-4 gap-2 text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200 rounded-lg'
                    className="flex gap-1 items-center w-fit text-sm text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(148,217,247,0.6)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                    to='/admin-dashboard/offer/create'
                >
                    <AiOutlinePlus className="inline"/>
                    Create new offer
                </Link>
            </div>

            <div className='mb-6'>
                <form
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                    onSubmit={(e) => {e.preventDefault(); fetchOffers();}}
                >
                    <div className="relative flex items-center flex-1 min-w-0">
                        <BiSearch className="absolute mt-0.5 mx-3 text-gray-400"></BiSearch>
                        <input
                            className="w-full py-2 pl-9 outline-hidden border hover:border-gray-400 rounded-md transition-border duration-300"
                            placeholder="Search offers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') fetchOffers();
                            }}
                            aria-label="Search offers"
                        ></input>
                    </div>

                    <div 
                        // className='relative flex items-center'
                        className="px-4 py-2 outline-hidden border hover:border-gray-400 rounded-md transition-border duration-300 cursor-pointer"
                    >
                        <select 
                            className='outline-hidden w-full'
                            // className="py-2 px-4 outline-hidden border hover:border-gray-400 rounded-md transition-border duration-300 cursor-pointer"
                            value={expiryStatus}
                            onChange={(e) => {setExpiryStatus(e.target.value as ExpiryStatus || '')}}
                            aria-label='Filter by expiry status'
                        >
                            <option value="">All Statuses</option>
                            {expiry_statuses.map((expiry_status) => (
                                <option key={expiry_status} value={expiry_status}>{prettifyString(expiry_status)}</option>
                            ))}
                        </select>
                    </div>

                    <div 
                        className="py-2 px-4 outline-hidden border hover:border-gray-400 rounded-md transition-border duration-300"
                        >
                        <select 
                            className='outline-hidden w-full'
                            value={percentageFilter}
                            onChange={(e) => {setPercentageFilter(parseInt(e.target.value))}}
                            aria-label='Filter by discount percentage'
                        >
                            <option value="">All Percentages</option>
                            {percentage_filters.map((percentage_filter) => (
                                <option key={percentage_filter} value={percentage_filter}> {`≥ ${percentage_filter}%`}</option>
                            ))}
                        </select>
                    </div>
                </form>
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
                                <div className='flex flex-row justify-between items-center mb-2'>
                                    <div className='text-xl font-semibold text-gray-800'>{offer.offer_type}</div>
                                    <div className='px-2 py-1 text-gray-950 font-semibold bg-gray-100 rounded-lg border border-gray-300'>{offer.discount_percentage}% off</div>
                                </div>
                                <div className='text-sm text-gray-500'>{offer.description}</div>
                            </div>
                            <div className='flex flex-col gap-1 border-b pb-4'>
                                <div className='flex items-center gap-2'>
                                    <span className='flex items-center space-between gap-1 text-gray-800 text-sm font-medium'><CiCalendar className='text-base font-semibold'></CiCalendar> Valid from: </span>
                                    <span className='text-sm text-gray-500'>{new Date(offer.offer_valid_from).toLocaleString('en-US', dateFormat)}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='flex items-center space-between gap-1 text-gray-800 text-sm font-medium'><CiCalendar className='text-base font-semibold'></CiCalendar> Valid until: </span>
                                    <span className='text-sm text-gray-500'> {new Date(offer.offer_valid_until).toLocaleString('en-US', dateFormat)}</span>
                                </div>
                            </div>
                            
                            <div className='flex flex-row gap-4'>
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
            <div className='text-xl font-semibold'> No Offers </div>}
        </div>
    );
}

export default Offers;