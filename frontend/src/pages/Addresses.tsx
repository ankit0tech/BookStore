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
    
    const fetchAddresses = () => {
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
    }

    useEffect(()=>{
        fetchAddresses();
    },[]);

    const handleMakeAddressDefault = (address_id: number) => {

        setAddresses(preAddresses => 
            preAddresses.map(address => ({
                ...address, 
                is_default: address.id === address_id
            }))
        );
        
        api.put(`http://localhost:5555/address/${address_id}`, {is_default: true})
            .then((address) => {
                enqueueSnackbar("Address set to default successfully", {variant: 'success'});
            })
            .catch((error) => {
                enqueueSnackbar(error.response?.data?.message || "Error updating default address", {variant: 'error'});
                fetchAddresses();
            });

    }

    return (
        <div className="p-4">
            <div className="text-2xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto my-2">
                    <Link to='/dashboard/address/create'>
                        Add new address
                    </Link>
                </div>
            {loading ? 
            <Spinner /> :
            addresses.length == 0  ? 
            <div className="p-4">No Addresses added</div> :
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 transition-all duration-500 ">
                        {addresses && addresses.map((address, index) => (
                            <div key={index} className="m-4 p-4 border rounded-lg">
                                <div>{address.house_number}</div>
                                <div>{address.street_address}</div>
                                <div className="w-full">{address.city}, {address.state} {address.zip_code}</div>
                                {!address.is_default && 
                                    <button 
                                        className="mt-2 border rounded-md px-2 hover:bg-gray-200 text-gray-800"
                                        onClick={() => handleMakeAddressDefault(address.id)}
                                    >
                                        Make default
                                    </button>}
                                {address.is_default && <div className="mt-2 text-gray-800">Default Address</div>}
                                <div className="flex py-4">
                                    <Link to={`/dashboard/address/update/${address.id}`}>
                                        <AiOutlineEdit className="m-1 text-xl text-yellow-600" />
                                    </Link>
                                    <Link to={`/dashboard/address/delete/${address.id}`}>
                                        <MdOutlineDelete className="m-1 text-xl text-red-600" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            }
        </div>
    );
}

export default Addresses;