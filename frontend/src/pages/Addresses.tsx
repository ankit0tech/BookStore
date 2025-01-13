import { useState, useEffect} from "react";
import Spinner from '../components/Spinner';
import api from '../utils/api';
import { Address } from "../types";
import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import BackButton from "../components/BackButton";
import { enqueueSnackbar } from "notistack";



const Addresses = () => {

    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    
    useEffect(()=>{
        try {
            setLoading(true);
            
            api
            .get('http://localhost:5555/address')
            .then((response) => {
                setAddresses(response.data);
                setLoading(false);
            })
            .catch((error)=>{
                console.log(error);
                setLoading(false);
            });
            
        } catch(error: any) {
            enqueueSnackbar("Issue while retrieving addresses", { variant: 'error' });
        }

    },[]);

    return (
        <div className="p-4">
            <BackButton />
            <div className="text-2xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto my-2">
                    <Link to='/address/create'>
                        Add new address
                    </Link>
                </div>
            {loading ? 
            <Spinner /> :
            addresses.length == 0  ? 
            <div className="p-4">No Addresses added</div> :
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
                                <th className=''>Default</th>
                                <th className='rounded-full rounded-l-lg'>Opreations</th>
                            </tr>
                        </thead>
                        <tbody>
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
                        </tbody>
                    </table>

                </div>
            }
        </div>
    );
}

export default Addresses;