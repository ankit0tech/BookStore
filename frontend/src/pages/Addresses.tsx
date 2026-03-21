import { useState, useEffect} from "react";
import Spinner from '../components/Spinner';
import api from '../utils/api';
import { Address } from "../types";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import BackButton from "../components/BackButton";
import { enqueueSnackbar } from "notistack";
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
            .get('/addresses')
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
        
        api.put(`/addresses/${address_id}`, {is_default: true})
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
            <div className="flex flex-col sm:flex-row items-start gap-2 justify-between sm:items-center mb-6">
                <h1 className="font-semibold text-xl text-gray-900">My Addresses</h1>
                <Link
                    to='/dashboard/address/create'  
                    className="w-fit flex flex-row gap-2 items-center py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                >
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
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-w-max'>
                        {addresses && addresses.map((address, index) => (
                            <div key={index} className="p-6 flex flex-col gap-2 border rounded-lg hover:shadow-sm ">
                                <div className="space-y-1">
                                    <div className="font-medium my-2">{address.name}</div>
                                    <div className="text-sm text-gray-600">{address.house_number}</div>
                                    <div className="text-sm text-gray-600">{address.street_address}</div>
                                    <div className="text-sm text-gray-600 w-full">{address.city}, {address.state} {address.zip_code}</div>
                                    <div className="text-sm text-gray-600">{address.country}</div>
                                </div>

                                <div className="flex gap-2 justify-between">
                                    <div className="flex gap-2 items-center">
                                        <button 
                                            className="px-2 py-[8px] h-fit text-amber-600 hover:text-amber-700 rounded-lg transition-colors duration-200" 
                                            onClick={() => navigate(`/dashboard/address/update/${address.id}`)}
                                            >
                                            <AiOutlineEdit className="text-xl" />
                                        </button>

                                        <button
                                            className="px-2 py-[8px] h-fit text-red-500 hover:text-red-600 rounded-lg transition-colors duration-200"
                                            onClick={() => setShowAddressToDelete(address.id)}
                                            >
                                            <MdOutlineDelete className="text-xl"/>
                                        </button>
                                        
                                        <DeleteOverlay
                                            itemName='address'
                                            deleteUrl={`/addresses/${address.id}`}
                                            isOpen={showAddressToDelete === address.id}
                                            onClose={onClose}
                                            onDeleteSuccess={fetchAddresses}
                                            />
                                    </div>

                                    {!address.is_default ? (
                                        <button 
                                            className="text-sm px-4 py-2 w-fit rounded-md text-blue-500 _bg-blue-50 _hover:bg-blue-100 transition-colors duration-00"
                                            onClick={() => handleMakeAddressDefault(address.id)}
                                        >
                                            Make default
                                        </button> 
                                    ): (
                                        <div className="text-sm px-4 py-2 w-fit rounded-md inline-block text-green-600 _bg-green-100 _hover:bg-green-100 transition-colors duration-200">
                                            Default Address
                                        </div>
                                    )}
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