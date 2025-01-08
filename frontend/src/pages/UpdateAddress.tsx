import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';



const UpdateAddress = () => {

    const [loading, setLoading] = useState(false);
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipcode] = useState('');
    const [country, setCountry] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const { id } = useParams();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(()=>{
        setLoading(true);
        const authToken = localStorage.getItem('authToken');
        const config = { headers: { Authorization: authToken }};
        // console.log(`http://localhost:5555/address/${id}`);
        api
        .get(`http://localhost:5555/address/${id}`, config)
        .then((response) => {
            setStreet(response.data.street_address);
            setCity(response.data.city);
            setState(response.data.state);
            setZipcode(response.data.zip_code);
            setCountry(response.data.country);
            setIsDefault(response.data.is_default);
            setLoading(false);
        })
        .catch((error)=>{
            setLoading(false);
            alert("An error happened. Please check console")
            console.log(error);
        })
        
    }, []);

    const handleSaveAddress = () => {
        const authToken = localStorage.getItem('authToken');
        const data = {
            street_address: street,
            city: city,
            state: state,
            zip_code: zipCode,
            country: country,
            is_default: isDefault
        };

        const config = {headers: { Authorization: authToken }};
        setLoading(true);
        
        api.put(`http://localhost:5555/address/${id}`, data, config)
        .then(() => {
            setLoading(false);
            enqueueSnackbar('Address updated Successfully', {variant: 'success'});
        })
        .catch((error) => {
            setLoading(false);
            enqueueSnackbar('Error while updating address', {variant: 'error'});
        });

    }

    
    return (
        <div className='p-4'>
            <BackButton destination='/addresses' />
            <h1 className='text-3x1 my-4'>Edit Address</h1>
            {loading ? <Spinner />:''}

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
                    <input 
                        type="checkbox" 
                        onChange={() => setIsDefault(!isDefault)}
                        checked={isDefault}
                    />
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

export default UpdateAddress;