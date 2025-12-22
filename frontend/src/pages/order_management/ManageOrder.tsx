import { useParams, useLocation, useNavigate } from "react-router-dom";
import { OrderInterface } from "../../types";
import { useEffect, useState } from 'react';
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";
import { formatDate, formatPrice, prettifyString } from "../../utils/formatUtils";
import { FiPackage } from "react-icons/fi";
import { CiCalendar, CiDeliveryTruck } from "react-icons/ci";

const ManageOrder = () => {
    
    const { id } = useParams();
    const { state } = useLocation();
    const [orderDetails, setOrderDetails] = useState<OrderInterface|null>(state?.orderDetails || null);
    // const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [deliveryStatus, setDeliveryStatus] = useState<string>(orderDetails?.order_status.toLowerCase() || '');
    const [paymentStatus, setPaymentStatus] = useState<string>(orderDetails?.payment_status.toLowerCase() || '');
    const [cancellationStatus, setCancellationStatus] = useState<string>(orderDetails?.cancellation_status.toLowerCase() || '');
    const [returnStatus, setReturnStatus] = useState<string>(orderDetails?.return_status.toLowerCase() || '');

    const paymentOptions = ['pending', 'completed', 'failed', 'refunded'];
    const deliveryOptions = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
    const cancellationOptions = ['requested', 'approved', 'rejected'];
    const returnOptions = ['requested', 'approved', 'rejected'];
    // const [shippingCarrier, setShippingCarrier] = useState<string>('');
    // const [trackingNumber, setTrackingNumber] = useState<string>('');
    // const navigate = useNavigate();

    const fetchOrderDetails = () => {
        api.get(`http://localhost:5555/orders/order-details/${id}`)
        .then((response)=> {
            setOrderDetails(response.data.data);
        })
        .catch((error) => {
            enqueueSnackbar('Error while fetching order details', {variant: 'error'});
            console.log(error);
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
        
        api.post(`http://localhost:5555/order-management/update/${id}`, data)
        .then((response)=> {
            fetchOrderDetails();
            enqueueSnackbar('Order updated successfully', {variant: 'success'});
        })
        .catch((error: any)=> {
            console.log(error);
            enqueueSnackbar('Order updated failed', {variant: 'error'});
        });
    }



    return (
        <div className="p-4 max-w-4xl">
            {orderDetails ? (
                <div>
                    <div className="space-y-1 mb-4">
                        <h2 className="text-3xl font-semibold text-gray-900">Order Details</h2>
                        <p className="px-4 py-2 text-gray-600 text-sm font-medium bg-gray-50 border rounded-lg w-fit">
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
                                    <p className="flex gap-2 items-center text-sm text-gray-600">Placed</p>
                                    <div className="flex gap-2 px-4 py-2 items-center font-medium text-sm text-gray-950 bg-gray-50 border border-gray-200 rounded-lg w-fit">
                                        <CiCalendar className="text-base"></CiCalendar>
                                        <div>{formatDate(orderDetails.purchase_date)}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    {orderDetails.order_status.toLowerCase() !== 'delivered' ? (
                                        <>
                                            <p className="flex gap-2 items-center text-sm text-gray-600">Expected Delivery Date</p>
                                            <div className="flex gap-2 px-4 py-2 items-center font-medium text-sm text-gray-950 bg-gray-50 border border-gray-200 rounded-lg w-fit">
                                                <CiDeliveryTruck className="text-xl"></CiDeliveryTruck>
                                                <div>{formatDate(orderDetails.expected_delivery_date)}</div>
                                            </div>
                                        </>
                                    ) : (
                                        orderDetails.actual_delivery_date && 
                                        <>
                                            <p className="flex gap-2 items-center text-sm text-gray-600">Delivery Date</p>
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


                                <div className="col-span-2">

                                    { orderDetails.shipping_carrier && (<p className="flex flex-row justify-between text-sm items-center">
                                        <span className="text-gray-700">Shipping Carrier: </span>
                                        <span className="font-medium">{orderDetails.shipping_carrier}</span>
                                    </p>)}

                                    { orderDetails.tracking_number &&(
                                    <p className="flex flex-row justify-between text-sm items-center">
                                        <span className="text-gray-700">Tracking Number: </span>
                                        <span className="font-medium">{orderDetails.tracking_number}</span>
                                    </p>)}
                                    
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
                                            id='order-status'
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
                                                payment status:
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