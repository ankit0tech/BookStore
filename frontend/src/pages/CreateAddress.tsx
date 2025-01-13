import { useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";

const CreateAddress = () => {
    
    const [loading, setLoading] = useState(false);
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipcode] = useState('');
    const [country, setCountry] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    const handleSaveAddress = () => {
        try {

            const data = {
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
    <div className="p-4">
        <BackButton />
        <h1 className="text-3x1 my-4">Add Address</h1>
        {loading ? <Spinner /> : ''}
        
        <div className='flex flex-col min-w-1/4 max-w-[300px] mx-auto'>
            <label>Street</label>
            <input
                className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
            >
            </input>
        </div>

        <div className='flex flex-col min-w-1/4 max-w-[300px] mx-auto'>
            <label>City</label>
            <input
                className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            >
            </input>
        </div>

        <div className='flex flex-col min-w-1/4 max-w-[300px] mx-auto'>
            <label>State</label>
            <input
                className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
            >
            </input>
        </div>

        <div className='flex flex-col min-w-1/4 max-w-[300px] mx-auto'>
            <label>Zip code </label>
            <input
                className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                type="text"
                value={zipCode}
                onChange={(e) => setZipcode(e.target.value)}
            >
            </input>
        </div>

        <div className='flex flex-col min-w-1/4 max-w-[300px] mx-auto'>
            <label>Country </label>
            <input
                className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
            >
            </input>
        </div>

        <div className='flex flex-col min-w-1/4 max-w-[300px] mx-auto'>
            <label>
                <input type="checkbox" onClick={() => setIsDefault(!isDefault)}/>
                &nbsp;&nbsp;Make address default
            </label>
        </div>

        <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
            <button 
                className="rounded-full my-4 text-white bg-purple-500 my-3 px-4 py-2 border border-gray-300 "
                onClick={handleSaveAddress}
            > 
                Save 
            </button>
        </div>


    </div>
    );
}

export default CreateAddress;