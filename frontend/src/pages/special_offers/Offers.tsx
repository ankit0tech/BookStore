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
import DropDownMenu from '../../components/DropDownMenu';

const expiry_statuses = ['expired', 'valid'];
type ExpiryStatus = typeof expiry_statuses[number];

const percentage_filters = ['≥ 10%', '≥ 15%', '≥ 20%', '≥ 30%', '≥ 50%']
type PercentageFilter = typeof percentage_filters[number];


const Offers = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [offers, setOffers] = useState<Offer[]|null>(null);
    const [offerToDelete, setOfferToDelete] = useState<number|null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expiryStatus, setExpiryStatus] = useState<ExpiryStatus|''>('');
    const [percentageFilter, setPercentageFilter] = useState<PercentageFilter>('');

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
        const percentageFilterValue = percentageFilter.match(/(\d+(?:\.\d+)?)\s*%/);
        if(percentageFilterValue) params.append('percentageFilter', percentageFilterValue[1].toString());

        api.get(`/offers?${params.toString()}`)
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
        <div className='p-2 md:p-4 max-w-6xl flex flex-col gap-4 mx-auto min-w-[320px]'>
            <div className='flex flex-row gap-2 justify-between items-center mb-2'>
                <div className='flex flex-col'>
                    <h2 className='text-xl font-semibold text-gray-900'>Special offers</h2>
                    <p className='text-sm text-gray-600'>Manage special offers</p>
                </div>
                <button
                    className="w-fit py-2 px-4 flex flex-row items-center gap-2 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                    onClick={() => navigate('/admin-dashboard/offer/create')}
                >
                    <AiOutlinePlus className="inline"/>
                    Create offer
                </button>
            </div>

            <form
                className="flex flex-col md:flex-row _items-start md:items-center gap-2"
                onSubmit={(e) => {e.preventDefault(); fetchOffers();}}
            >
                <div className="relative flex items-center min-w-0 w-full">
                    <BiSearch className="absolute mt-0.5 mx-3 text-gray-400"></BiSearch>
                    <input
                        className="flex py-2 pl-9 outline-hidden border w-full border-gray-300 hover:border-gray-400 rounded-sm text-gray-800"
                        placeholder="Search offers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter') fetchOffers();
                        }}
                        aria-label="Search offers"
                    ></input>
                </div>

                <DropDownMenu
                    title="Filter Status"
                    defaultValue="All Statuses"
                    selectedOptionStatus={expiryStatus || ''} 
                    setSelectedOptionStatus={setExpiryStatus}
                    options={expiry_statuses || []}
                    getLabel={(status) => prettifyString(status)}
                />

                <DropDownMenu
                    title="Filter Percentage"
                    defaultValue="All Percentanges"
                    selectedOptionStatus={percentageFilter || ''} 
                    setSelectedOptionStatus={setPercentageFilter}
                    options={percentage_filters}
                />
            </form>
                
            {offers ? 
            <div className={`grid grid-cols-1 ${ isSidebarOpen ? 'md:grid-cols-1 lg:grid-cols-2': 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
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
                            <div className='flex flex-row justify-between items-center _mb-2'>
                                <div className='text-xl font-medium text-gray-800'>{offer.offer_type}</div>
                                <div className='px-2 py-1 text-sm text-gray-950 font-medium bg-gray-100 rounded-md border border-gray-300'>{offer.discount_percentage}% off</div>
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
                                className="w-fit flex gap-2 items-center py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                onClick={() => navigate(`/admin-dashboard/offer/edit/${offer.id}`)}
                            >
                                <AiOutlineEdit className='text-lg _text-sky-600' />
                                <p className='_text-sky-600'>Edit</p>
                            </button>

                            <button
                                className="w-fit flex gap-2 items-center py-2 px-4 font-medium text-gray-800 hover:text-gray-900 hover:bg-orange-50 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                onClick={() => setOfferToDelete(offer.id)}
                            >
                                <MdOutlineDelete className='text-lg _text-red-600' /> 
                                <p>Delete</p>
                            </button>

                            <DeleteOverlay
                                itemName='offer'
                                deleteUrl={`/offers/${offer.id}`}
                                isOpen={offerToDelete === offer.id}
                                onClose={onClose}
                                onDeleteSuccess={fetchOffers}
                            />

                        </div>
                    </div>
                ))}
            </div>
            :
            <div className='text-xl font-semibold font-gray-600'> No Offers </div>}
        </div>
    );
}

export default Offers;