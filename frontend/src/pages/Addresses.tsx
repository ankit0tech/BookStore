import { useState, useEffect} from "react";
import Spinner from '../components/Spinner';
import api from '../utils/api';
import { Address } from "../types";
import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";



const Addresses = () => {

    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    
    useEffect(()=>{
        setLoading(true);
        const authToken = localStorage.getItem('authToken');
        const config = { headers: { Authorization: authToken } };
                
        api
        .get('http://localhost:5555/address', config)
        .then((response) => {
            setAddresses(response.data);
            setLoading(false);
        })
        .catch((error)=>{
            console.log(error);
            setLoading(false);
        });


    },[]);

    return (
        <div className="p-4">
            {loading ? 
            <Spinner /> :
            <div>
                <table className='w-full mx-auto max-w-[1000px] rounded-lg'>
                    <thead>
                        <tr className='rounded-full text-white bg-purple-500 h-8'>
                            <th className='rounded-full rounded-r-lg my-4 px-4 py-2'>No</th>
                            <th className=''>Street</th>
                            <th className=''>City</th>
                            <th className=''>State</th>
                            <th className='max-md:hidden'>Zip code</th>
                            <th className='max-md:hidden'>Country</th>
                            <th className='max-md:hidden'>Default</th>
                            <th className='rounded-full rounded-l-lg'>Opreations</th>
                        </tr>
                    </thead>
                    {addresses && addresses.map((address, index) => (
                        <tr key={address.id}>
                            <td className='text-center'>{index + 1}</td>
                            <td className='text-center'>{address.street_address}</td>
                            <td className='text-center'>{address.city}</td>
                            <td className='text-center'>{address.state}</td>
                            <td className='text-center max-md:hidden'>{address.zip_code}</td>
                            <td className='text-center max-md:hidden'>{address.country}</td>
                            <td className='text-center'>{address.is_default ? 'yes' : 'no'}</td>
                            <td className='text-center'>
                                <div className='flex justify-center gap-x-4'>
                                    <Link to={`/address/update/${address.id}`}>
                                        <AiOutlineEdit className='text-2x1 text-yellow-600' />
                                    </Link>
                                    <Link to={`/address/delete/${address.id}`}>
                                        <MdOutlineDelete className='text-2x1 text-red-600' />
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </table>

            </div>
            }
        </div>
    );
}

export default Addresses;