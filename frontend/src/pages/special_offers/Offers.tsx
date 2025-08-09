import { useEffect, useState } from 'react';
import { Offer } from '../../types';
import api from '../../utils/api';
import { Link, useOutletContext } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { MdOutlineDelete } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import DeleteOverlay from '../../components/DeleteOverlay';

const Offers = () => {


    const [offers, setOffers] = useState<Offer[]|null>(null);
    const [offerToDelete, setOfferToDelete] = useState<number|null>(null);
    const { isSidebarOpen } = useOutletContext<{ isSidebarOpen: boolean }>();
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
                    className='flex flex-row items-center py-2 px-4 gap-2 text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200 rounded-lg'
                    to='/admin-dashboard/offer/create'
                >
                    <FaPlus className='inline'/> Create new offer
                </Link>
            </div>
                
            {offers ? 
            <div className={`grid grid-cols-1 ${ isSidebarOpen ? 'md:grid-cols-1 lg:grid-cols-2': 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                    {offers.map((offer, index) => (
                        <div key={offer.id} className='p-6 flex flex-col border rounded-lg hover:shadow-md transition-shadow duration-100'>
                            <div className='space-y-2'>
                                <div className='flex flex-row justify-between items-center'>
                                    <div className='text-lg font-medium text-gray-800'>{offer.offer_type}</div>
                                    <div className='px-2 py-1 text-white font-medium bg-red-600 rounded-md'>{offer.discount_percentage}%</div>
                                </div>
                                <div className='text-gray-600'>{offer.description}</div>
                                <div className='text-gray-500 text-sm'>Offer Valid from: {new Date(offer.offer_valid_from).toLocaleString('en-US', dateFormat)}</div>
                                <div className='text-gray-500 text-sm'>Offer Valid until: {new Date(offer.offer_valid_until).toLocaleString('en-US', dateFormat)}</div>
                            </div>
                            
                            <div className='flex flex-row gap-2 mt-4'>
                                <Link className='rounded-lg hover:bg-yellow-50 p-2' to ={`/admin-dashboard/offer/edit/${offer.id}`}>
                                    <AiOutlineEdit className='text-xl text-yellow-600' />
                                </Link>
                                <button 
                                        className='rounded-lg hover:bg-red-50 p-2'
                                        onClick={() => setOfferToDelete(offer.id)}>
                                    <MdOutlineDelete className='text-xl text-red-600' />
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