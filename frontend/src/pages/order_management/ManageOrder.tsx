import { useParams, useLocation, useNavigate } from "react-router-dom";
import { OrderInterface } from "../../types";
import { useEffect, useState } from 'react';
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";
import { formatDate, formatPrice, prettifyString } from "../../utils/formatUtils";
import { FiPackage } from "react-icons/fi";
import { CiCalendar, CiDeliveryTruck } from "react-icons/ci";
import { RxCross2 } from 'react-icons/rx';

const ManageOrder = () => {
    
    const { id } = useParams();
    const { state } = useLocation();
    const [orderDetails, setOrderDetails] = useState<OrderInterface|null>(state?.orderDetails || null);
    // const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [deliveryStatus, setDeliveryStatus] = useState<string>(orderDetails?.order_status.toLowerCase() || '');
    const [paymentStatus, setPaymentStatus] = useState<string>(orderDetails?.payment_status.toLowerCase() || '');
    const [cancellationStatus, setCancellationStatus] = useState<string>(orderDetails?.cancellation_status.toLowerCase() || '');
    const [returnStatus, setReturnStatus] = useState<string>(orderDetails?.return_status.toLowerCase() || '');
    const [shippingCarrier, setShippingCarrier] = useState<string>(orderDetails?.shipping_carrier || '');
    const [trackingNumber, setTrackingNumber] = useState<string>(orderDetails?.tracking_number || '');
    const [shippingLabelUrl, setShippingLabelUrl] = useState<string>(orderDetails?.shipping_label_url || '');
    const [returnTrackingNumber, setReturnTrackingNumber] = useState<string>(orderDetails?.return_tracking_number || '');
    const [returnShippingLabelUrl, setReturnShippingLabelUrl] = useState<string>(orderDetails?.return_shipping_label_url || '');
    const [showShippingUpdate, setShowShippingUpdate] = useState<boolean>(false);
    const [showReturnShippingUpdate, setShowReturnShippingUpdate] = useState<boolean>(false);

    const paymentOptions = ['pending', 'completed', 'failed', 'refunded'];
    const deliveryOptions = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
    const cancellationOptions = ['requested', 'approved', 'rejected'];
    const returnOptions = ['requested', 'approved', 'rejected'];


    // const navigate = useNavigate();

    const fetchOrderDetails = () => {
        api.get(`/orders/order-details/${id}`)
        .then((response)=> {
            setOrderDetails(response.data.data);
        })
        .catch((error) => {
            console.log(error);
            enqueueSnackbar('Error while fetching order details', {variant: 'error'});
        });
    }

    useEffect(()=> {
        fetchOrderDetails();
    }, [id]);

    useEffect(() => {
        if(orderDetails) {
            setDeliveryStatus(orderDetails.order_status.toLowerCase() || '');
            setCancellationStatus(orderDetails.cancellation_status.toLowerCase() || '');
            setPaymentStatus(orderDetails.payment_status.toLowerCase() || '');
            setReturnStatus(orderDetails.return_status.toLowerCase() || '');
            setShippingCarrier(orderDetails.shipping_carrier || '');
            setTrackingNumber(orderDetails.tracking_number || '');
            setShippingLabelUrl(orderDetails?.shipping_label_url || '');
            setReturnTrackingNumber(orderDetails?.return_tracking_number || '');
            setReturnShippingLabelUrl(orderDetails?.return_shipping_label_url || '');
        }
    }, [orderDetails]);


    // const validateForm = ():boolean => {
    //     const newErrors: Record<string, string> = {};
    //     if(!deliveryStatus.trim()) {
    //         newErrors.deliveryStatus = 'Delivery status is required'
    //     } 

    //     if(!paymentStatus.trim()) {
    //         newErrors.paymentStatus = 'Payment status is required'
    //     }

    //     setFormErrors(newErrors);
    //     return Object.keys(newErrors).length === 0;
    // }

    // const handleFormSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();

    //     // if(!validateForm()) {
    //     //     return;
    //     // }

    //     console.log('form submitted');
    // }

    const handleOrderUpdate = (optionName: string, optionValue: string) => {

        const data = {
            optionName: optionName,
            optionValue: optionValue
        }
        
        api.post(`/order-management/update/${id}`, data)
        .then((response)=> {
            fetchOrderDetails();
            enqueueSnackbar('Order updated successfully', {variant: 'success'});
        })
        .catch((error: any)=> {
            console.log(error);
            enqueueSnackbar('Order updated failed', {variant: 'error'});
        });
    }

    const handleShippingOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {        
        if (e.target === e.currentTarget) {
            setShowShippingUpdate(false);
        }
    }

    const handleReturnShippingOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {        
        if (e.target === e.currentTarget) {
            setShowReturnShippingUpdate(false);
        }
    }

    const handleUpdateShippingDetails = (type: 'return'|'ship') => {
        const data: Record<string, string> = {};
        let hasChanged: boolean = false;

        if(type === 'return') {
            const trimmedReturnTrackingNumber = returnTrackingNumber.trim();
            const trimmedReturnShippingLabelUrl = returnShippingLabelUrl.trim();
            
            if(trimmedReturnTrackingNumber !== (orderDetails?.return_tracking_number || '')) {
                hasChanged = true;
            }
            if(trimmedReturnShippingLabelUrl !== (orderDetails?.return_shipping_label_url || '')) {
                hasChanged = true;
            }

            data.return_tracking_number = trimmedReturnTrackingNumber;
            data.return_shipping_label_url = trimmedReturnShippingLabelUrl;

        } else {
            const trimmedShippingCarrier = shippingCarrier.trim();
            const trimmedTrackingNumber = trackingNumber.trim();
            const trimmedShippingLabelUrl = shippingLabelUrl.trim();

            if(trimmedShippingCarrier !== (orderDetails?.shipping_carrier || '')) {
                hasChanged = true;
            }
            if(trimmedTrackingNumber !== (orderDetails?.tracking_number || '')) {
                hasChanged = true;
            }
            if(trimmedShippingLabelUrl !== (orderDetails?.shipping_label_url || '')) {
                hasChanged = true;
            }
            
            data.shipping_carrier = trimmedShippingCarrier;
            data.tracking_number = trimmedTrackingNumber;
            data.shipping_label_url = trimmedShippingLabelUrl;
            
        }


        if(!hasChanged) {
            enqueueSnackbar('Please provide atleast one field to update', {variant: 'warning'});
            return;
        }

        api.put(`/order-management/update-shipping-details/${id}`, data)
        .then((response) => {
            enqueueSnackbar('Order updated successfully', {variant: 'success'});
            setOrderDetails(response.data.data);
            setShowShippingUpdate(false);
            setShowReturnShippingUpdate(false);
        })
        .catch((error: any) => {
            console.log(error);
            enqueueSnackbar('Error while updating order shipping details', {variant: 'error'});
        });

    }


    return (
        <div className="p-4 max-w-4xl">
            {orderDetails ? (
                <div>
                    <div className="space-y-1 mb-4">
                        <h2 className="text-3xl font-semibold text-gray-900">Order Details</h2>
                        <p className="px-4 py-2 text-gray-700 text-sm font-medium bg-gray-50 border rounded-lg w-fit">
                            #{orderDetails.order_number}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-2 flex flex-col justify-between gap-8 min-w-64 mt-4">


                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">

                                <div className="flex items-center text-lg gap-2 col-span-2">
                                    <FiPackage className="text-xl text-blue-600"></FiPackage>
                                    <p className="font-semibold text-gray-900">Order Status</p>
                                </div>

                                <div className="flex flex-col gap-1 col-span-2">
                                    <p className="text-sm text-gray-500">Placed by</p>
                                    <div className="w-fit font-medium px-4 py-1.5 text-sm bg-gray-50 text-gray-950 border border-gray-200 rounded-lg">{orderDetails.user?.email}</div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <p className="flex gap-2 items-center text-sm text-gray-700">Placed</p>
                                    <div className="flex gap-2 px-4 py-2 items-center font-medium text-sm text-gray-950 bg-gray-50 border border-gray-200 rounded-lg w-fit">
                                        <CiCalendar className="text-base"></CiCalendar>
                                        <div>{formatDate(orderDetails.purchase_date)}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    {orderDetails.order_status.toLowerCase() !== 'delivered' ? (
                                        <>
                                            <p className="flex gap-2 items-center text-sm text-gray-700">Expected Delivery Date</p>
                                            <div className="flex gap-2 px-4 py-2 items-center font-medium text-sm text-gray-950 bg-gray-50 border border-gray-200 rounded-lg w-fit">
                                                <CiDeliveryTruck className="text-xl"></CiDeliveryTruck>
                                                <div>{formatDate(orderDetails.expected_delivery_date)}</div>
                                            </div>
                                        </>
                                    ) : (
                                        orderDetails.actual_delivery_date && 
                                        <>
                                            <p className="flex gap-2 items-center text-sm text-gray-700">Delivery Date</p>
                                            <div className="flex gap-2 px-4 py-2 items-center font-medium text-sm text-gray-950 bg-gray-50 border border-gray-200 rounded-lg w-fit">
                                                <CiDeliveryTruck className="text-xl"></CiDeliveryTruck>
                                                <div>{formatDate(orderDetails.actual_delivery_date)}</div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-500">Order Status</p>
                                    <div className="w-fit font-medium px-4 py-1.5 text-sm bg-gray-50 text-gray-950 border border-gray-200 rounded-lg">{prettifyString(orderDetails.order_status.toLowerCase())}</div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-500">Payment Status</p>
                                    <div className="w-fit font-medium px-4 py-1.5 text-sm bg-gray-50 text-gray-950 border border-gray-200 rounded-lg">{prettifyString(orderDetails.payment_status.toLowerCase())}</div>
                                </div>

                                {/* <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-500">Placed by</p>
                                    <div className="w-fit font-medium px-4 py-1.5 text-sm bg-gray-50 text-gray-950 border border-gray-200 rounded-lg">{orderDetails.user?.email}</div>
                                </div> */}
                                {orderDetails.shipping_carrier && (
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm text-gray-500">Shipping Carrier</p>
                                        <div className="w-fit font-medium px-4 py-1.5 text-sm bg-gray-50 text-gray-950 border border-gray-200 rounded-lg">{orderDetails.shipping_carrier}</div>
                                    </div>
                                )}

                                { orderDetails.tracking_number &&(
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm text-gray-500">Tracking Number</p>
                                        <div className="w-fit font-medium px-4 py-1.5 text-sm bg-gray-50 text-gray-950 border border-gray-200 rounded-lg">{orderDetails.tracking_number}</div>
                                    </div>
                                )}

                                { orderDetails.shipping_label_url &&(
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm text-gray-500">Shipping Label Url</p>
                                        <div className="w-fit font-medium px-4 py-1.5 text-sm bg-gray-50 text-gray-950 border border-gray-200 rounded-lg">{orderDetails.shipping_label_url}</div>
                                    </div>
                                )}

                                { orderDetails.return_tracking_number &&(
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm text-gray-500">Return Tracking Number</p>
                                        <div className="w-fit font-medium px-4 py-1.5 text-sm bg-gray-50 text-gray-950 border border-gray-200 rounded-lg">{orderDetails.return_tracking_number}</div>
                                    </div>
                                )}

                                { orderDetails.return_shipping_label_url &&(
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm text-gray-500">Return Shipping Label Url</p>
                                        <div className="w-fit font-medium px-4 py-1.5 text-sm bg-gray-50 text-gray-950 border border-gray-200 rounded-lg">{orderDetails.return_shipping_label_url}</div>
                                    </div>
                                )}


                                <div className="col-span-2">
                                    
                                    { orderDetails.cancellation_status.toLowerCase() !== 'none' && (
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm text-gray-500">Cancellation Status</div>
                                                <div className="w-fit font-medium px-4 py-1.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg">{prettifyString(orderDetails.cancellation_status.toLowerCase())}</div>
                                                {orderDetails.cancellation_reason && 
                                                    <div className="my-2 flex flex-col gap-1">
                                                        <div className="text-sm text-gray-500">Cancellation Reason:</div> 
                                                        <div className="px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg">{orderDetails.cancellation_reason}</div>   
                                                    </div>
                                                }
                                            </div>
                                        )
                                    }

                                    {orderDetails.return_status.toLowerCase() !== 'none' &&
                                        (
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm text-gray-500">Return Status</div>
                                                <div className="w-fit font-medium px-4 py-1.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg">{prettifyString(orderDetails.return_status.toLowerCase())}</div>
                                                {orderDetails.return_reason && 
                                                    <div className="my-2 flex flex-col gap-1">
                                                        <div className="text-sm text-gray-500">Return Reason:</div> 
                                                        <div className="px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg">{orderDetails.return_reason}</div>   
                                                    </div>
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                                
                            </div>
                            
                            

                            <form className="flex flex-col sm:w-4/5 gap-8">
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label 
                                            className="text-sm font-semibold text-gray-700" 
                                            htmlFor='delivery-status'
                                        >
                                                Delivery status:
                                        </label>
                                        <select
                                            className="text-sm px-2 py-2 rounded-md text-gray-900 border border-gray-300 focus:outline-hidden hover:border-gray-400 focus:border-blue-400 transition-all duration-200 cursor-pointer"
                                            value={deliveryStatus || ''}
                                            id='delivery-status'
                                            onChange={(e) => setDeliveryStatus(e.target.value)}
                                            >
                                            {deliveryOptions.map((item, index) => (
                                                <option key={index} value={item}>{prettifyString(item)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button 
                                        className="w-fit text-sm my-2 text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,0.8)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                        // className="w-max px-3 py-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                                        type='button' 
                                        onClick={() => handleOrderUpdate('delivery', deliveryStatus)}
                                    >
                                        Save delivery status
                                    </button>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label 
                                            className="text-sm font-semibold text-gray-700" 
                                            htmlFor='payment-status'
                                        >
                                                Payment status:
                                        </label>
                                        <select
                                            className="text-sm px-2 py-2 rounded-md text-gray-900 border border-gray-300 focus:outline-hidden hover:border-gray-400 focus:border-blue-400 transition-all duration-200 cursor-pointer"
                                            value={paymentStatus || ''}
                                            onChange={(e) => setPaymentStatus(e.target.value)}
                                            id='payment-status'
                                        >
                                            {paymentOptions.map((item, index) => (
                                                <option key={index} value={item}>{prettifyString(item)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        className="w-fit text-sm my-2 text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,0.8)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                        type='button' 
                                        onClick={() => handleOrderUpdate('payment', paymentStatus)}
                                    >
                                        Save payment status
                                    </button>
                                </div>

                                {(orderDetails.cancellation_status.toLowerCase() != 'none') && (
                                   <div className="flex flex-col gap-2">
                                        <div className="flex flex-col gap-1">
                                            <label 
                                                className="text-sm font-semibold text-gray-700" 
                                                htmlFor='cancellation-status'
                                            >
                                                    Cancellation status:
                                            </label>
                                            <select
                                                className="text-sm px-2 py-2 rounded-lg text-gray-900 border border-gray-300 focus:outline-hidden focus:border-blue-400"
                                                value={cancellationStatus || ''}
                                                onChange={(e) => setCancellationStatus(e.target.value)}
                                                id='cancellation-status'
                                            >
                                                {cancellationOptions.map((item, index) => (
                                                    <option key={index} value={item}>{prettifyString(item)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            className="w-fit text-sm my-2 text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,0.8)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                            type='button' 
                                            onClick={ () => handleOrderUpdate('cancellation', cancellationStatus) }
                                        >
                                            Save cancellation status
                                        </button>
                                    </div> 
                                )}

                                {(orderDetails.return_status.toLowerCase() != 'none') && (
                                   <div className="flex flex-col gap-2">
                                        <div className="flex flex-col gap-1">
                                            <label 
                                                className="text-sm font-semibold text-gray-700" 
                                                htmlFor='return-status'
                                                >
                                                    Return status:
                                            </label>
                                            <select
                                                className="text-sm px-2 py-2 rounded-lg text-gray-900 border border-gray-300 focus:outline-hidden focus:border-blue-400"
                                                value={returnStatus || ''}
                                                onChange={(e) => setReturnStatus(e.target.value)}
                                                id='return-status'
                                                >
                                                {returnOptions.map((item, index) => (
                                                    <option key={index} value={item}>{prettifyString(item)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button 
                                            className="w-fit text-sm my-2 text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,0.8)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                            type='button' 
                                            onClick={ () => handleOrderUpdate('return', returnStatus) }
                                            >
                                            Save return status
                                        </button>
                                    </div> 
                                )}

                            </form>

                            <div className="flex flex-row gap-4">
                                <div className="">
                                    <button
                                        type="button"
                                        className="w-fit text-sm my-2 text-sky-800 font-medium p-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,0.8)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                        onClick={() => setShowShippingUpdate(!showShippingUpdate)}
                                    >
                                        Update Shipping Details
                                    </button>

                                    {showShippingUpdate && (
                                        <div 
                                            className="fixed z-50 inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs overflow-y-auto"
                                            onClick={(e) => handleShippingOverlayClick(e)}
                                        >
                                            <form className="w-full max-w-md min-w-xs p-6 bg-white border rounded-lg flex flex-col gap-4">
                                                <div className="flex flex-col gap-0">
                                                    <div className="flex justify-between">
                                                        <h2 className="text-xl font-semibold text-gray-900">Shipping Details</h2>
                                                        <button 
                                                            type='button'
                                                            className="font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                                                            onClick={() => setShowShippingUpdate(false)}
                                                            aria-label="Close"
                                                        >
                                                            <RxCross2 />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-gray-600">Update the shipping details for the order</p>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label
                                                        className="text-sm font-semibold text-gray-700"
                                                        htmlFor="shipping-carrier"
                                                    >
                                                        Shipping Carrier:
                                                    </label>
                                                    <input 
                                                        className="px-2 py-1.5 _w-full rounded-md border border-gray-300 focus:outline-hidden hover:border-gray-400 focus:border-blue-400 transition-border duration-200 ease-in-out"
                                                        type="text"
                                                        id="shipping-carrier"
                                                        value={shippingCarrier}
                                                        onChange={(e) => setShippingCarrier(e.target.value)}
                                                    >
                                                    </input>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label
                                                        className="text-sm font-semibold text-gray-700"
                                                        htmlFor="tracking-number"
                                                    >
                                                        Tracking Number:
                                                    </label>
                                                    <input 
                                                        className="px-2 py-1.5 _w-full rounded-md border border-gray-300 focus:outline-hidden hover:border-gray-400 focus:border-blue-400 transition-border duration-200 ease-in-out"
                                                        type="text"
                                                        id="tracking-number"
                                                        value={trackingNumber}
                                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                                    >
                                                    </input>
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <label
                                                        className="text-sm font-semibold text-gray-700"
                                                        htmlFor="shipping-label-url"
                                                    >
                                                        Shipping Label Url:
                                                    </label>
                                                    <input 
                                                        className="px-2 py-1.5 _w-full rounded-md border border-gray-300 focus:outline-hidden hover:border-gray-400 focus:border-blue-400 transition-border duration-200 ease-in-out"
                                                        type="text"
                                                        id="shipping-label-url"
                                                        value={shippingLabelUrl}
                                                        onChange={(e) => setShippingLabelUrl(e.target.value)}
                                                    >
                                                    </input>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button
                                                        type="button"
                                                        className="w-fit text-sm text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,0.8)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                                        onClick={() => handleUpdateShippingDetails('ship')}
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="w-fit text-sm font-medium px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(212,212,218,1.0)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,1.0)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out" 
                                                        onClick={() => setShowShippingUpdate(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>

                                {(orderDetails.return_status.toLowerCase() != 'none') && (
                                    <div className="">
                                        <button
                                            type="button"
                                            className="w-fit text-sm my-2 text-sky-800 font-medium p-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,0.8)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                            onClick={() => setShowReturnShippingUpdate(!showReturnShippingUpdate)}
                                            >
                                            Update Return Shipping Details
                                        </button>
        
                                        {showReturnShippingUpdate && (
                                            <div 
                                            className="fixed z-50 inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs _bg-opacity-50 overflow-y-auto"
                                            onClick={(e) => handleReturnShippingOverlayClick(e)}
                                            >
                                                <form className="w-full max-w-md min-w-xs p-6 bg-white border rounded-lg flex flex-col gap-4">
                                                    <div className="flex flex-col gap-0">
                                                        <div className="flex justify-between">
                                                            <h2 className="text-xl font-semibold text-gray-900">Return Shipping Details</h2>
                                                            <button 
                                                                type='button'
                                                                className="font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                                                                onClick={() => setShowReturnShippingUpdate(false)}
                                                                aria-label="Close"
                                                                >
                                                                <RxCross2 />
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-gray-600">Update the return shipping details for the order</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label
                                                            className="text-sm font-semibold text-gray-700"
                                                            htmlFor="return-tracking-number"
                                                            >
                                                            Return Tracking Number:
                                                        </label>
                                                        <input 
                                                            className="px-2 py-1.5 _w-full rounded-md border border-gray-300 focus:outline-hidden hover:border-gray-400 focus:border-blue-400 transition-border duration-200 ease-in-out"
                                                            type="text"
                                                            id="return-tracking-number"
                                                            value={returnTrackingNumber}
                                                            onChange={(e) => setReturnTrackingNumber(e.target.value)}
                                                            >
                                                        </input>
                                                    </div>
        
                                                    <div className="flex flex-col gap-1">
                                                        <label
                                                            className="text-sm font-semibold text-gray-700"
                                                            htmlFor="return-shipping-label-url"
                                                            >
                                                            Return Shipping Label Url:
                                                        </label>
                                                        <input 
                                                            className="px-2 py-1.5 _w-full rounded-md border border-gray-300 focus:outline-hidden hover:border-gray-400 focus:border-blue-400 transition-border duration-200 ease-in-out"
                                                            type="text"
                                                            id="return-shipping-label-url"
                                                            value={returnShippingLabelUrl}
                                                            onChange={(e) => setReturnShippingLabelUrl(e.target.value)}
                                                            >
                                                        </input>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button
                                                            type="button"
                                                            className="w-fit text-sm text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,0.8)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                                            onClick={() => handleUpdateShippingDetails('return')}
                                                            >
                                                            Update
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="w-fit text-sm font-medium px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(212,212,218,1.0)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,1.0)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out" 
                                                            onClick={() => setShowReturnShippingUpdate(false)}
                                                            >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <div className="flex font-medium text-xl pb-2 border-b border-gray-100 gap-2">
                                    <span>Items</span>
                                    <span className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-950 bg-gray-100 border border-gray-300 rounded-lg">{orderDetails.order_items.length}</span>
                                </div>

                                <ul className="w-full space-y-6 mt-4">
                                    { orderDetails.order_items.map((item: any) => (
                                        // book details
                                        <li className="flex flex-row gap-6 pb-6 border-b border-gray-100 last:border-b-0" key={item.id}>
                                            <div className="flex flex-row gap-6">
                                                <img
                                                    className="w-32 h-44 object-scale-down rounded-md"
                                                    src={item.book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'}
                                                    alt={item.book.title}
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                                                    }}
                                                />

                                                <div className="flex flex-col">
                                                    <p className="font-medium text-gray-900">{item.book.title}</p>
                                                    <p className="text-sm text-gray-700">{item.book.author}</p>
                                                    <div className="mt-2 _space-y-1">
                                                        <p className="text-md text-gray-950 font-semibold">{formatPrice(item.unit_price, item.currency)}</p>
                                                        <p className="text-md text-gray-700">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>

                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 max-w-64 mt-4">
                            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                                <p className="font-semibold text-gray-900 mb-3">Delivery address:</p>
                                <div className="text-gray-700 space-y-1.5">
                                    <p className="text-sm font-medium"> {orderDetails.address.name} </p>
                                    <p className="text-sm"> {orderDetails.address.house_number} </p>
                                    <p className="text-sm"> {orderDetails.address.street_address}, {orderDetails.address.city} </p>
                                    <p className="text-sm"> {orderDetails.address.state}, {orderDetails.address.zip_code} </p>
                                    <p className="text-sm"> {orderDetails.address.country} </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-2 w-full bg-gray-50 border border-gray-300 rounded-lg p-4">
                                <p className="font-semibold text-gray-900 mb-3">Price Summary:</p>
                                <p className="flex flex-row justify-between w-full text-gray-700 text-sm">
                                    <span>Subtotal: </span>
                                    <span className="font-medium">{formatPrice(orderDetails.subtotal, orderDetails.order_items[0].book.currency)}</span>
                                </p>
                                <p className="flex flex-row justify-between w-full text-gray-700 text-sm">
                                    <span>Delivery charges:</span>
                                    <span className="font-medium">{formatPrice(orderDetails.delivery_charges || 0, orderDetails.order_items[0].book.currency)}</span>
                                </p>
                                <p className="flex flex-row justify-between w-full text-gray-900 font-semibold border-t border-gray-300 pt-2 mt-2">
                                    <span>Total cost:</span>{formatPrice(orderDetails.subtotal + (orderDetails.delivery_charges || 0), orderDetails.order_items[0].book.currency)}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
                )
            :
                <div>
                    <p>No orders found</p>
                </div>
            }
        </div>
    );
}

export default ManageOrder;