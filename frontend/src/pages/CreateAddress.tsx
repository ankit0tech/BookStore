import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import { useNavigate, useParams } from "react-router-dom";

const CreateAddress = () => {
    
    const { id } = useParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [houseNumber, setHouseNumber] = useState<string>('');
    const [street, setStreet] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [state, setState] = useState<string>('');
    const [zipCode, setZipcode] = useState<string>('');
    const [country, setCountry] = useState<string>('');
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [updateAddress, setUpdateAddress] = useState<boolean>(false);

    const navigate = useNavigate();

    const fetchAddress = () => {
        
        api.get(`/addresses/${id}`)
        .then((response) => {
            setName(response.data.name || '');
            setHouseNumber(response.data.house_number || '');
            setStreet(response.data.street_address || '');
            setCity(response.data.city || '');
            setState(response.data.state || '');
            setZipcode(response.data.zip_code || '');
            setCountry(response.data.country || '');
            setIsDefault(response.data.is_default || false);
            setUpdateAddress(true);
            setLoading(false);
        })
        .catch((error: any) => {
            enqueueSnackbar('Error while fetching address');
            console.log(error.message);
            setLoading(false);
        });

    }

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        
        try {

            const data = {
                name: name,
                house_number: houseNumber,
                street_address: street,
                city: city,
                state: state,
                zip_code: zipCode,
                country: country,
                is_default: isDefault
            };
    
            setLoading(true);

            const apiCall = updateAddress ? 
                api.put(`/addresses/${id}`, data) 
                : 
                api.post('/addresses', data);
            
            apiCall
            .then(() => {
                setLoading(false);
                enqueueSnackbar('Success', {variant: 'success'});
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

    useEffect(()=> {
        if(id) {
            fetchAddress();
        }

    }, []);

    return (
    <div className="p-6 max-w-2xl mx-auto">
        {loading ? <Spinner /> : (
        <>
            <h1 className="text-xl font-semibold text-gray-800 mb-6">Add New Address</h1>
            
            <form 
                onSubmit={handleSaveAddress} 
                className="flex flex-col gap-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                    
                    <div className="flex flex-col gap-1 w-full">
                        <label htmlFor="input-name" className="block text-sm font-medium text-gray-700">Name </label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-color duration-200"
                            type="text"
                            id="input-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            >
                        </input>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <label htmlFor="input-house-number" className="block text-sm font-medium text-gray-700">House Number / Apartment </label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-color duration-200"
                            type="text"
                            id="input-house-number"
                            value={houseNumber}
                            onChange={(e) => setHouseNumber(e.target.value)}
                            required
                            >
                        </input>
                    </div>

                    <div className='flex flex-col gap-1 w-full'>
                        <label htmlFor="input-street" className="block text-sm font-medium text-gray-700">Street</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-color duration-200"
                            type="text"
                            id="input-street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            >
                        </input>
                    </div>

                    <div className='flex flex-col gap-1 w-full'>
                        <label htmlFor="input-city" className="block text-sm font-medium text-gray-700">City</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-color duration-200"
                            type="text"
                            id="input-city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        >
                        </input>
                    </div>

                    <div className='flex flex-col gap-1 w-full'>
                        <label htmlFor="input-state" className="block text-sm font-medium text-gray-700">State</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-color duration-200"
                            type="text"
                            id="input-state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            >
                        </input>
                    </div>

                    <div className='flex flex-col gap-1 w-full'>
                        <label htmlFor="input-zipcode" className="block text-sm font-medium text-gray-700">Zip code </label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-color duration-200"
                            type="text"
                            id="input-zipcode"
                            value={zipCode}
                            onChange={(e) => setZipcode(e.target.value)}
                        >
                        </input>
                    </div>

                    <div className='flex flex-col gap-1 w-full'>
                        <label id="input-country" className="block text-sm font-medium text-gray-700">Country </label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-color duration-200"
                            type="text"
                            id="input-country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                        >
                        </input>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox"
                        id="defaultAddress"
                        checked={isDefault}
                        onChange={() => setIsDefault(!isDefault)}
                        className="appearance-none bg-white checked:bg-amber-600 current-color w-[16px] h-[16px] border-[1.5px] border-amber-900 rounded-sm grid place-items-center 
                                    before:content-[''] before:w-[5px] before:h-[9px] before:scale-0 before:border-b-2 before:border-r-2 before:rotate-40 before:border-white before:inset-shadow-[8px_8px_0px_0px] before:inset-shadow-amber-600
                                    checked:before:scale-100 before:translate-x-[0.5px] before:-translate-y-[0.5px]
                                    hover:ring hover:ring-amber-300"
                    />
                    <label htmlFor="defaultAddress" className="text-sm text-gray-700">
                        Make address default
                    </label>
                </div>

                <div className="flex justify-end gap-4"> 

                    <button 
                        className="whitespace-nowrap w-fit py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                        type="submit"
                        disabled={loading}
                        > 
                            {loading ? <Spinner /> : 'Save Address'} 
                    </button>
                    <button
                        className="whitespace-nowrap w-fit py-2 px-4 font-medium text-gray-800 hover:text-gray-900 hover:bg-orange-50 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                        onClick={() => navigate(-1)}
                        type="button"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </>
        )}
    </div>);
}

export default CreateAddress;