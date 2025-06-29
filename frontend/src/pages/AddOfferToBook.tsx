import React, { useEffect, useState } from "react";
import { Offer } from "../types";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import Spinner from "../components/Spinner";
import { useNavigate, useParams } from "react-router-dom";


const AddOfferToBook = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
    const [selectedOffer, setSelectedOffer] = useState<string|null>(null);
    const navigate = useNavigate();
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

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

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
                    className="p-4 flex flex-col justify-between flex flex-col min-w-1/4 max-w-[300px] mx-auto"
                    onSubmit={(e) => handleFormSubmit(e)}    
                > 
                    
                    <select 
                        className=""
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
                    <button
                        className="rounded-full text-white bg-purple-500 my-3 px-4 py-2 border border-purple-500"
                        type="submit">Save
                    </button>
                </form>
            }
        </div>
    );
}

export default AddOfferToBook;