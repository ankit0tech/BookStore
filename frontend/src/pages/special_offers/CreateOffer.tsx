import { RecordWithTtl } from "dns";
import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";
import { useParams } from "react-router-dom";


const CreateOffer = () => {

    const { id } = useParams();
    const [discountPercentage, setDiscountPercentage] = useState<number|null>(null);
    const [offerType, setOfferType] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [offerValidFromDate, setOfferValidFromDate] = useState<string>('');
    const [offerValidUntilDate, setOfferValidUntilDate] = useState<string>('');
    const [offerValidFromTime, setOfferValidFromTime] = useState<string>('');
    const [offerValidUntilTime, setOfferValidUntilTime] = useState<string>('');
    const [updateOffer, setUpdateOffer] = useState<boolean>(false);

    

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            discount_percentage: discountPercentage,
            offer_type: offerType,
            description: description,
            offer_valid_from: new Date(`${offerValidFromDate}T${offerValidFromTime}`).toISOString(),
            offer_valid_until: new Date(`${offerValidUntilDate}T${offerValidUntilTime}`).toISOString(),
        }

        const apiCall = updateOffer ? 
            api.put(`http://localhost:5555/offer/${id}`, data)
            :
            api.post('http://localhost:5555/offer', data);

        apiCall
        .then((response) => {
            enqueueSnackbar("Success", { variant: "success"});
        })
        .catch((error) => {
            console.log(error);
            enqueueSnackbar("Error", { variant: "error"});
        });

    }

    const fetchOffer = (id: string) => {

        api.get(`http://localhost:5555/offer/${id}`)
        .then((response) => {

            setUpdateOffer(true);
            
            setDiscountPercentage(response.data.discount_percentage);
            setOfferType(response.data.offer_type);
            setDescription(response.data.description);

            const startDate = new Date(response.data.offer_valid_from);
            const fromDate = startDate.toLocaleDateString('en-CA');
            const fromTime = startDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});

            const endDate = new Date(response.data.offer_valid_until);
            const untilDate = endDate.toLocaleDateString('en-CA');
            const untilTime = endDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});

            setOfferValidFromDate(fromDate);
            setOfferValidFromTime(fromTime);
            setOfferValidUntilDate(untilDate);
            setOfferValidUntilTime(untilTime);

        })
        .catch((error: any) => {
            console.log(error);
            enqueueSnackbar("Error while fetching offer", { variant: "error" });
        });
    }

    useEffect(() => {
        if(id) {
            fetchOffer(id);
        }
    }, [id]);
    
    return (
    <div className="p-4">
        <form onSubmit={handleFormSubmit}>
        <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">

            <label htmlFor="discountPercentage">Discount Percentage</label>
            <input 
                className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                id="discountPercentage" type="number"
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                value={discountPercentage?.toString() || ""}
            ></input>
        </div>

        <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">

            <label htmlFor="offerType">Offer Type</label>
            <input 
                className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                id="offerType" type="text"
                onChange={(e) => setOfferType(e.target.value)}    
                value={offerType}
            ></input>
        </div>

        <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
            <label htmlFor="description">Description</label>
            <input 
                className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                id="description" type="text"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
            ></input>
        </div>

        <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
            <label htmlFor="offerValidFrom">Offer valid from</label>
            
            <div className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500">
                <input 
                    
                    id="offerValidFrom" type="date"
                    onChange={(e) => setOfferValidFromDate(e.target.value)}
                    value={offerValidFromDate}
                ></input>
                
                <input 
                    id="offerValidFrom" type="time"
                    onChange={(e) => setOfferValidFromTime(e.target.value)}
                    value={offerValidFromTime}
                ></input>
            </div>
        </div>

        <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
            <label htmlFor="offerValidUntil">Offer valid until</label>
            <div className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"> 
            
                <input 
                    id="offerValidUntil" type="date"
                    onChange={(e) => setOfferValidUntilDate(e.target.value)}
                    value={offerValidUntilDate}
                ></input>
                <input 
                    id="offerValidUntil" type="time"
                    onChange={(e) => setOfferValidUntilTime(e.target.value)}
                    value={offerValidUntilTime}
                ></input>
            </div>
        </div>

        <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
            <button
            className="rounded-full mt-2 text-white bg-purple-500 px-4 py-2 border border-gray-300"
                type="submit">Save</button>
        </div>
        </form>
    </div>
    );
}

export default CreateOffer;