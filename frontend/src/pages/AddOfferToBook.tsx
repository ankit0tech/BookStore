import React, { useEffect, useState } from "react";
import { Offer } from "../types";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import Spinner from "../components/Spinner";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import OffersDropDownMenu from '../components/OffersDropDownMenu';

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
        
        api.get('/offers/active-offers')
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

        api.post(`/books/add-offer-for-book/${id}`, data)
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
                    className="flex flex-col justify-between min-w-[320px] max-w-[450px] mx-auto space-y-2"
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
                            <OffersDropDownMenu
                                title="Select Offers"
                                defaultValue="Select Offers"
                                selectedOptionStatus={selectedOffer || ''} 
                                setSelectedOptionStatus={setSelectedOffer}
                                offers={activeOffers}
                            />

                            {formErrors.selectedOffer && <div className="text-sm text-red-500 mt-1">Please select a valid option</div>}

                        </div>
                    
                        <div className="w-full flex gap-2">
                            <button
                                className="w-full py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                type="submit"
                            >
                                Add Offer
                            </button>
                            <button
                                className="w-full py-2 px-4 font-medium text-gray-800 hover:text-gray-900 hover:bg-orange-50 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                type='button'
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            }
        </div>
    );
}

export default AddOfferToBook;