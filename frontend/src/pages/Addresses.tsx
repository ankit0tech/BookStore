import { useState, useEffect} from "react";
import Spinner from '../components/Spinner';
import api from '../utils/api';
import { Address } from "../types";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import BackButton from "../components/BackButton";
import { enqueueSnackbar } from "notistack";
import { FaPlus } from "react-icons/fa";
import DeleteOverlay from "../components/DeleteOverlay";



const Addresses = () => {

    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const { isSidebarOpen } = useOutletContext<{ isSidebarOpen: boolean}>();
    const [showAddressToDelete, setShowAddressToDelete] = useState<number|null>(null);
    const navigate = useNavigate();

    const onClose = () => {
        setShowAddressToDelete(null);
    }
    
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
                <div className="overflow-x-auto">
                    <div className={`grid grid-cols-1 ${isSidebarOpen ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-4'} gap-6 min-w-max`}>
                        {addresses && addresses.map((address, index) => (
                            <div key={index} className="p-6 flex flex-col border rounded-lg hover:shadow ">
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
                                    <button 
                                        className="p-2 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors" 
                                        onClick={() => navigate(`/dashboard/address/update/${address.id}`)}
                                    >
                                        <AiOutlineEdit className="text-xl" />
                                    </button>

                                    <button
                                        className="p-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                        onClick={() => setShowAddressToDelete(address.id)}
                                    >
                                        <MdOutlineDelete className="text-xl"/>
                                    </button>
                                    
                                    <DeleteOverlay
                                        itemName='address'
                                        deleteUrl={`http://localhost:5555/address/${address.id}`}
                                        isOpen={showAddressToDelete === address.id}
                                        onClose={onClose}
                                        onDeleteSuccess={fetchAddresses}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Addresses;