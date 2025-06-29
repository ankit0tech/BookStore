import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";
import { useNavigate, useParams } from "react-router-dom";

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
    const [isLoading, setIsloading] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();
    
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if(!discountPercentage || discountPercentage < 0 || discountPercentage > 100) {
            newErrors.discountPercentage = 'Discount percentage must be between 0 and 100';
        }

        if(!offerType.trim()) {
            newErrors.offerType = 'Offer type is required';
        }

        if(!description.trim()) {
            newErrors.description = 'Description is required';
        }

        if(!offerValidFromDate || !offerValidFromTime) {
            newErrors.offerValidFrom = 'Start date and time are required';
        }

        if(!offerValidUntilDate || !offerValidUntilTime) {
            newErrors.offerValidUntil = 'End date and time are requied';
        }

        if(offerValidFromDate && offerValidUntilDate && offerValidFromTime && offerValidUntilTime) {
            const startDateTime = new Date(`${offerValidFromDate}T${offerValidFromTime}`);
            const endDateTime = new Date(`${offerValidUntilDate}T${offerValidUntilTime}`);

            if(endDateTime <= startDateTime) {
                newErrors.offerValidUntil = 'End date/time must be after start date/time';
            }
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;

    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if(!validateForm()) {
            return;
        }

        setIsloading(true);
        const data = {
            discount_percentage: discountPercentage!,
            offer_type: offerType,
            description: description,
            offer_valid_from: new Date(`${offerValidFromDate}T${offerValidFromTime}`).toISOString(),
            offer_valid_until: new Date(`${offerValidUntilDate}T${offerValidUntilTime}`).toISOString(),
        }

        const apiCall = updateOffer ? 
            api.put(`http://localhost:5555/offers/${id}`, data)
            :
            api.post('http://localhost:5555/offers', data);

        apiCall
        .then((response) => {
            enqueueSnackbar("Success", { variant: "success"});
            navigate(-1);
        })
        .catch((error) => {
            console.error(error);
            enqueueSnackbar(error.response?.date?.message || "An error occurred", { variant: "error"});
        }).finally(() => {
            setIsloading(false);
        });
    }

    const fetchOffer = (id: string) => {
        setIsloading(true);
        api.get(`http://localhost:5555/offers/${id}`)
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
            console.error(error);
            enqueueSnackbar(error.resopnse?.data?.message || "Error while fetching offer", { variant: "error" });
        }).finally(() => {
            setIsloading(false);
        })
    }

    useEffect(() => {
        if(id) {
            fetchOffer(id);
        }
    }, [id]);
    
    return (
    <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-6">{updateOffer ? 'Update Offer' : 'Create Offer'}</h2>
        <form className="space-y-2" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="discountPercentage">Discount Percentage</label>
                    <input 
                        className={`appearance-none w-full rounded-lg my-2 px-4 py-2 border ${formErrors.discountPercentage ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                        id="discountPercentage" 
                        type="number"
                        onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                        value={discountPercentage?.toString() || ""}
                        disabled={isLoading}
                    ></input>
                    {formErrors.discountPercentage && (<p className="text-sm text-red-500">{formErrors.discountPercentage}</p>)}
                </div>

                <div className="space-y-2">

                    <label className="block text-sm font-medium text-gray-700" htmlFor="offerType">Offer Type</label>
                    <input 
                        className={`appearance-none w-full rounded-lg my-2 px-4 py-2 border ${formErrors.offerType ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                        id="offerType" 
                        type="text"
                        onChange={(e) => setOfferType(e.target.value)}    
                        value={offerType}
                    ></input>
                    {formErrors.offerType && (<p className="text-sm text-red-500">{formErrors.offerType}</p>)}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="description">Description</label>
                    <input 
                        className={`appearance-none w-full rounded-lg my-2 px-4 py-2 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                        id="description"
                        type="text"
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                    ></input>
                    {formErrors.description && (<p className="text-sm text-red-500">{formErrors.description}</p>)}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="offerValidFrom">Offer valid from</label>
                    
                    <div className={`flex gap-4 rounded-lg my-2 px-4 py-2 border ${formErrors.offerValidFrom ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-gray-500`}>
                        <input
                            className="pr-1"
                            id="offerValidFrom" 
                            type="date"
                            onChange={(e) => setOfferValidFromDate(e.target.value)}
                            value={offerValidFromDate}
                        ></input>
                        
                        <input 
                            className="pr-1"
                            id="offerValidFrom" 
                            type="time"
                            onChange={(e) => setOfferValidFromTime(e.target.value)}
                            value={offerValidFromTime}
                        ></input>
                    </div>
                    {formErrors.offerValidFrom && (<p className="text-sm text-red-500">{formErrors.offerValidFrom}</p>)}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="offerValidUntil">Offer valid until</label>
                    <div className={`flex gap-4 rounded-lg my-2 px-4 py-2 border ${formErrors.offerValidUntil ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-gray-500`}> 
                    
                        <input 
                            id="offerValidUntil" 
                            type="date"
                            onChange={(e) => setOfferValidUntilDate(e.target.value)}
                            value={offerValidUntilDate}
                        ></input>
                        <input 
                            id="offerValidUntil" 
                            type="time"
                            onChange={(e) => setOfferValidUntilTime(e.target.value)}
                            value={offerValidUntilTime}
                        ></input>
                    </div>
                    {formErrors.offerValidUntil && (<p className="text-sm text-red-500">{formErrors.offerValidUntil}</p>)}
                </div>

            </div>
            
            <div className="space-y-2 flex flex-row justify-end gap-2">
                <button
                    className="rounded-lg mt-2 text-gray-700 bg-white px-4 py-2 border border-gray-300 hover:bg-gray-50 h-auto"
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    Cancel
                </button>
                <button
                    className="rounded-lg mt-2 text-white bg-purple-500 px-4 py-2 hover:bg-purple-600 h-auto"
                    type="submit"
                >
                    {isLoading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    </div>
    );
}

export default CreateOffer;