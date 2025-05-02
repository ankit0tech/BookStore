import React, { useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const CreateAddress = () => {
    
    const [loading, setLoading] = useState(false);
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipcode] = useState('');
    const [country, setCountry] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const [houseNumber, setHouseNumber] = useState('');

    const navigate = useNavigate();

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        
        try {

            const data = {
                house_number: houseNumber,
                street_address: street,
                city: city,
                state: state,
                zip_code: zipCode,
                country: country,
                is_default: isDefault
            };
    
            setLoading(true);
            
            api.post('http://localhost:5555/address', data)
            .then(() => {
                setLoading(false);
                enqueueSnackbar('Address added Successfully', {variant: 'success'});
                navigate('/dashboard/addresses');
            })
            .catch((error) => {
                setLoading(false);
                enqueueSnackbar('Error', {variant: 'error'});
                console.log(error);
            });
            
        } catch(error: any) {
            enqueueSnackbar("Error occurred while saving address", {variant: 'error'});
        }

    }

    return (
    <div className="p-6 max-w-2xl mx-auto">
        {loading ? <Spinner /> : ''}
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Add New Address</h1>
        
        <form 
            onSubmit={handleSaveAddress} 
            className="space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">House Number / Apartment </label>
                    <input
                        className="w-full px-4 py-2 rounded-lg border border-1 border-gray-300 focus:border-blue-400 outline-none"
                        type="text"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        required
                        >
                    </input>
                </div>

                <div className='space-y-2'>
                    <label className="block text-sm font-medium text-gray-700">Street</label>
                    <input
                        className="w-full px-4 py-2 rounded-lg border border-1 border-gray-300 focus:border-blue-400 outline-none"
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        >
                    </input>
                </div>

                <div className='space-y-2'>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                        className="w-full px-4 py-2 rounded-lg border border-1 border-gray-300 focus:border-blue-400 outline-none"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    >
                    </input>
                </div>

                <div className='space-y-2'>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                        className="w-full px-4 py-2 rounded-lg border border-1 border-gray-300 focus:border-blue-400 outline-none"
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        >
                    </input>
                </div>

                <div className='space-y-2'>
                    <label className="block text-sm font-medium text-gray-700">Zip code </label>
                    <input
                        className="w-full px-4 py-2 rounded-lg border border-1 border-gray-300 focus:border-blue-400 outline-none"
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipcode(e.target.value)}
                    >
                    </input>
                </div>

                <div className='space-y-2'>
                    <label className="block text-sm font-medium text-gray-700">Country </label>
                    <input
                        className="w-full px-4 py-2 rounded-lg border border-1 border-gray-300 focus:border-blue-400 outline-none"
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    >
                    </input>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <input 
                    type="checkbox"
                    id="defaultAddress"
                    checked={isDefault}
                    onChange={() => setIsDefault(!isDefault)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="defaultAddress" className="text-sm text-gray-700">
                    Make address default
                </label>
            </div>

            <div className="flex justify-end space-x-4"> 
                <button
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={() => navigate('/dashboard/addresses')}
                    type="button"
                >
                    Cancel
                </button>

                <button 
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                    > 
                        {loading ? <Spinner /> : 'Save Address'} 
                </button>
            </div>

        </form>

    </div>
    );
}

export default CreateAddress;