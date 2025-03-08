import { useEffect, useState } from 'react';
import { Offer } from '../../types';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { MdOutlineDelete } from 'react-icons/md';

const Offers = () => {


    const [offers, setOffers] = useState<Offer[]|null>(null);
    const dateFormat : Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short', // "Feb"
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // AM/PM format
    }


    const loadOffers = () => {

        api.get('http://localhost:5555/offer')
        .then((response) => {
            setOffers(response.data);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    useEffect(()=>{
        loadOffers();
    }, []);

    return (
        <div>
            <div className='p-4'>Special offers</div>
            <div className='p-4'><Link to='/offer/create'>Create new offer</Link></div>
            {offers ? 
            <table className='w-full mx-auto max-w-[1000px] rounded-lg'>
                <thead>
                    <tr className='rounded-full text-white bg-purple-500 h-8'>
                        <th className='rounded-full rounded-r-lg my-4 px-4 py-2'>No</th>
                        <th className=''>Discount</th>
                        <th className=''>Offer Type</th>
                        <th className='max-md:hidden'>Description</th>
                        <th className=''>Valid From</th>
                        <th className=''>Valid Until</th>
                        <th className='rounded-full rounded-l-lg'>Operations</th>
                    </tr>
                </thead>
                <tbody>
                    {offers.map((offer, index) => (
                        <tr key={offer.id}>
                            <td className='text-center'>{index+1}</td>
                            <td className='text-center'>{offer.discount_percentage}</td>
                            <td className='text-center'>{offer.offer_type}</td>
                            <td className='text-center max-md:hidden'>{offer.description}</td>
                            <td className='text-center'>{new Date(offer.offer_valid_from).toLocaleString('en-US', dateFormat)}</td>
                            <td className='text-center'>{new Date(offer.offer_valid_until).toLocaleString('en-US', dateFormat)}</td>
                            <td>
                                <div className='flex justify-center gap-x-4'>
                                    <Link to ={`/offer/edit/${offer.id}`}>
                                        <AiOutlineEdit className='text-2x1 text-yellow-600' />
                                    </Link>
                                    <Link to={`/offer/delete/${offer.id}`}>
                                        <MdOutlineDelete className='text-2x1 text-red-600' />
                                    </Link>

                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            :
            <div> No Offers </div>}
        </div>
    );
}

export default Offers;