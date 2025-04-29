import { useState, useEffect} from "react";
import Spinner from '../components/Spinner';
import api from '../utils/api';
import { Address } from "../types";
import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import BackButton from "../components/BackButton";
import { enqueueSnackbar } from "notistack";
import { FaPlus } from "react-icons/fa";



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
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-semibold text-2xl">My Addresses</h1>
                <Link
                    to='/dashboard/address/create'  
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 p-2"  
                >
                    <FaPlus />
                    Add new address
                </Link>
            </div>

            {loading ? ( 
                <Spinner /> 
            ) : addresses.length == 0  ? (
                <div> 
                    <p className="p-4">No Addresses added yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 transition-all duration-500 ">
                    {addresses && addresses.map((address, index) => (
                        <div key={index} className="m-4 p-6 flex flex-col border rounded-lg hover:shadow">
                            <div className="space-y-2">
                                <div className="font-medium">{address.house_number}</div>
                                <div className="text-gray-600">{address.street_address}</div>
                                <div className="text-gray-600 w-full">{address.city}, {address.state} {address.zip_code}</div>
                                <div className="text-gray-600">{address.country}</div>
                            </div>

                            {!address.is_default ? (
                                <button 
                                    className="mt-4 px-4 py-2 w-fit rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                                    onClick={() => handleMakeAddressDefault(address.id)}
                                >
                                    Make default
                                </button> 
                            ): (
                                <div className="mt-4 px-4 py-2 w-fit rounded-md inline-block text-green-600 bg-green-50 hover:bg-green-100">
                                    Default Address
                                </div>
                            )}
                            
                            <div className="flex mt-4 gap-4">
                                <Link 
                                    className="tex-xl text-yellow-600 hover:text-yellow-700" 
                                    to={`/dashboard/address/update/${address.id}`}
                                >
                                    <AiOutlineEdit className="text-xl" />
                                </Link>
                                <Link 
                                    className="tex-xl text-red-600 hover:text-red-700" 
                                    to={`/dashboard/address/delete/${address.id}`}
                                >
                                    <MdOutlineDelete className="text-xl" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Addresses;