import React, { useEffect, useState } from "react";
import { Offer } from "../types";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import Spinner from "../components/Spinner";
import { useNavigate, useParams, useLocation } from "react-router-dom";


const AddOfferToBook = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
    const [selectedOffer, setSelectedOffer] = useState<string|null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const navigate = useNavigate();
    const location = useLocation();
    const book = location.state.book;
    const { id } = useParams();

    const loadActiveOffers = () => {
        
        setLoading(true);
        
        api.get('http://localhost:5555/offers/active-offers')
        .then((response) => {
            setLoading(false);
            setActiveOffers(response.data);            
        })
        .catch((error: any) => {
            setLoading(false);
            console.log(error);
            enqueueSnackbar('Error while loading offers', { variant: 'error'});
        })
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if(!selectedOffer) {
            newErrors.selectedOffer = 'Please select an offer';
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!validateForm()) {
            return;
        }

        const data = {
            "offerId": Number(selectedOffer),
        }

        api.post(`http://localhost:5555/books/add-offer-for-book/${id}`, data)
        .then((response) => {
            console.log(response);
            enqueueSnackbar('Offer add successfully', { variant: "success" });
            navigate(-1);
        })
        .catch((error: any) => {
            console.log(error);
            enqueueSnackbar('Error while adding offer', { variant: "error" });
        });

    }


    useEffect(() => {
        loadActiveOffers();
    }, []);


    return (
        <div className="p-4">
            {loading ? 
                <Spinner/>
                :
                <form 
                    className="p-4 flex flex-col justify-between min-w-1/4 max-w-[450px] mx-auto space-y-2"
                    onSubmit={(e) => handleFormSubmit(e)}    
                > 
                    <div className="p-4 text-white rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-500 space-y-1">
                        <div className="text-xl font-semibold">Add Offer</div>
                        <div className="text-sm">Please Select an offer to apply to this book</div>
                    </div>
                    <div className="my-4 flex flex-row gap-4">
                        <div className="h-40 w-32 p-2 bg-gray-100 border-2 border-gray-100 rounded-lg flex items-center justify-between">
                            <img 
                                className="object-contain max-w-full max-h-full"
                                src={book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'} 
                                alt={book.title}
                                onError={(e) => {
                                    e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                                }}
                            />
                        </div>
                        <div>
                            <div className="text-2xl font-medium text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-600">by {book.author}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="">
                            <label className="inline-block my-2 text-sm font-medium text-gray-700">Select offer</label>
                            <select 
                                className="py-2 w-full rounded-md border border-gray-200 hover:border-gray-300 focus:outline-hidden"
                                value = {selectedOffer || ""}
                                onChange={(e) => setSelectedOffer(e.target.value)}
                            >
                                <option value="" disabled>Select an offer</option>
                                { activeOffers?.map((offer) => (
                                    <option key={offer.id} value={offer.id} >
                                        {offer.description}
                                    </option>
                                ))}
                            </select>
                            {formErrors.selectedOffer && 
                                <div className="text-sm text-red-500 mt-1">Please select a valid option</div>
                            }

                        </div>
                    
                        <div className="w-full flex gap-2">
                            <button
                                className="w-full my-1 px-4 py-2 font-medium text-sm text-gray-800 active:scale-98 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-md transition-all ease-in-out duration-200"
                                type='button'
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-full my-1 px-4 py-2 font-medium text-sm text-blue-600 active:scale-98 border border-sky-200 hover:border-sky-300 bg-sky-50 hover:bg-sky-100 rounded-md transition-all ease-in-out duration-200"
                                type="submit"
                            >
                                Add Offer
                            </button>
                        </div>
                    </div>
                </form>
            }
        </div>
    );
}

export default AddOfferToBook;