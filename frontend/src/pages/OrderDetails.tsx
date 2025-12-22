import { useParams, useLocation, useNavigate } from "react-router-dom";
import { OrderInterface } from "../types";
import { useEffect, useState } from 'react';
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import { formatDate, formatPrice, prettifyString } from "../utils/formatUtils";
import { CancelOrReturnOverlay } from "../components/orders/CancelOrReturnOverlay";
import { FiPackage } from "react-icons/fi";
import { CiCalendar, CiDeliveryTruck } from "react-icons/ci";

const OrderDetails = () => {
    
    const { id } = useParams();
    const { state } = useLocation();
    const [orderDetails, setOrderDetails] = useState<OrderInterface|null>(state?.orderDetails || null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    
    const fetchOrderDetails = (id:number) => {
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
        fetchOrderDetails(Number(id));
    }, [id]);


    const handleRequestCancelOrReturn = (requestName: string, reason: string) => {
        if(requestName.toLowerCase() != 'cancel' && requestName.toLocaleLowerCase() != 'return') {
            return;
        }

        const data = {
            reason: reason
        };

        const endpointString = requestName === 'cancel' ? 'request-cancellation' : 'request-return';

        api.post(`http://localhost:5555/orders/${endpointString}/${id}`, data)
        .then((response)=> {
            enqueueSnackbar(`Request to ${requestName} added`, {variant: 'success'});
            fetchOrderDetails(Number(id));
        })
        .catch((error: any)=> {
            console.log(`${requestName} failed`);
            console.log(error);
            enqueueSnackbar(`Request to ${requestName} failed`, {variant: 'error'})
        });
    }

    const onClose = () => {
        setIsOpen(false);
    }


    return (
        <div className="_p-4 max-w-4xl px-2 md:px-8">
            {orderDetails ? (
                <div>
                    <div className="space-y-1 mb-2">
                        <h2 className="text-3xl font-semibold text-gray-900">Order Details</h2>
                        <p className="px-4 py-2 text-gray-600 text-sm font-medium bg-gray-50 border rounded-lg w-fit">
                            #{orderDetails.order_number}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-2 flex flex-col justify-between gap-6 min-w-64 mt-4">
                            
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <div className="flex items-center text-lg gap-2 col-span-2">
                                    <FiPackage className="text-xl text-blue-600"></FiPackage>
                                    <p className="font-semibold text-gray-900">Order Status</p>
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


                                <div className="col-span-2">
                                {orderDetails.order_status.toLowerCase() != 'delivered' && (
                                    <>
                                        {orderDetails.shipping_carrier && (<p className="flex flex-row justify-between text-sm items-center">
                                            <span className="text-gray-700">Shipping Carrier: </span>
                                            <span className="font-medium">{orderDetails.shipping_carrier}</span>
                                        </p>)}
                                        {orderDetails.tracking_number &&(
                                        <p className="flex flex-row justify-between text-sm items-center">
                                            <span className="text-gray-700">Tracking Number: </span>
                                            <span className="font-medium">{orderDetails.tracking_number}</span>
                                        </p>)}
                                        
                                        {orderDetails.cancellation_status.toLowerCase() === 'none' ? (
                                            <div className="">
                                                {
                                                    isOpen && <CancelOrReturnOverlay onClose={onClose} type='cancel' handleRequestCancelOrReturn={handleRequestCancelOrReturn}/>
                                                }
                                                <button 
                                                    className="relative mt-4 w-fit h-fit px-4 py-2 text-sm text-gray-950 font-medium transition-all duration-100 rounded-sm hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(102,178,255,1.0)] active:shadow-[1px_1px_0px_0px_rgba(102,178,255,1.0)] border border-black active:translate-x-[1px] active:translate-y-[1px] ease-in-out"
                                                    type='button' 
                                                    onClick={() => setIsOpen(true)}
                                                >
                                                    Request cancellation
                                                </button>
                                            </div>
                                            ) : (
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
                                    </>
                                )}

                                {orderDetails.order_status.toLowerCase() === 'delivered' && (
                                    <>
                                        {orderDetails.return_status.toLowerCase() === 'none' ? (
                                            <div>
                                                {
                                                    isOpen && <CancelOrReturnOverlay onClose={onClose} type='return' handleRequestCancelOrReturn={handleRequestCancelOrReturn}/>
                                                }
                                                <button 
                                                    className="relative mt-4 w-fit h-fit px-4 py-2 text-sm text-gray-950 font-medium transition-all duration-100 rounded-sm hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(102,178,255,1.0)] active:shadow-[1px_1px_0px_0px_rgba(102,178,255,1.0)] border border-black active:translate-x-[1px] active:translate-y-[1px] ease-in-out"
                                                    type='button' 
                                                    onClick = {() => setIsOpen(true)}
                                                >
                                                    Request return
                                                </button>
                                                
                                            </div> 
                                        ) : (
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
                                        )}
                                    </>
                                )}
                                </div>
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
                                                    <p className="text-sm text-gray-600">{item.book.author}</p>
                                                    <div className="mt-2">
                                                        <p className="text-md text-gray-950 font-semibold">{formatPrice(item.unit_price, item.currency)}</p>
                                                        <p className="text-md text-gray-700">Qty: {item.quantity}</p>
                                                    </div>
                                                    <button 
                                                        // className="relative mt-4 w-fit h-fit px-4 py-2 text-sm text-gray-700 font-medium transition-all duration-100 rounded-sm hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(147,200,255,1.0)] active:shadow-[1px_1px_0px_0px_rgba(102,178,255,1.0)] border border-gray-400 active:translate-x-[1px] active:translate-y-[1px] ease-in-out"
                                                        // className="w-fit text-sm my-4 text-slate-700 font-medium px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(212,212,218,0.8)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,0.8)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                                        className="w-fit text-sm my-4 text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,0.8)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"

                                                        onClick={() => navigate(`/dashboard/review/${item.book.id}`)}
                                                    >
                                                        Write a review
                                                    </button>
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

export default OrderDetails;