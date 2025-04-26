import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import api from "../utils/api";
import { PurchaseInterface } from "../types";
import BackButton from "../components/BackButton";
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import { RootState } from '../types/index';
import { Navigate, useNavigate } from "react-router-dom";


const initialState: PurchaseInterface = {
    data: []
}

const Orders = () => {

    const [ loading, setLoading ] = useState(false);
    const [ orders, setOrders ] = useState(initialState);
    const userInfo = useSelector((state: RootState) => state.userinfo);
    const navigate = useNavigate();

    const formatDate = (date: Date) => {
        const d = new Date(date);
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(d);          
    }

    useEffect(() => {
        
        setLoading(true);

        api
        .get('http://localhost:5555/cart/get-purchased-items')
        .then((response) => {
            setOrders(response.data);
            setLoading(false);
        })
        .catch((error) => {
            console.log(error);
            setLoading(false);
        })

    }, []);

    return (
        <div className="p-4">
            <BackButton />
            { loading ? (
                <Spinner />
            )
            : 
            <div>
                {orders.data.length == 0 ?
                    <div className="p-4">No Orders history</div>
                :
                    <div>
                        <div className="text-xl font-semibold m-4">Orders:</div>
                        <ul>
                            {orders.data.map((item)=> (
                                <li className="flex justify-between max-w-full sm:max-w-[80vw] border rounded-lg m-4 p-4 border-2 rounded-lg px-4 relative hover:shadow-xl" key={uuidv4()}>
                                    <div className="flex justify-between">
                                        <div className="w-36 h-48 bg-gray-100 rounded-lg shadow-md overflow-hidden flex justify-center items-center">
                                            <img
                                                src={item.book.cover_image}
                                                alt="book cover"
                                                className="w-full h-full object-cover object-scale-down" 
                                            ></img>
                                        </div>
                                        <div className="p-2">
                                            { item.book.title }
                                        </div>
                                    </div>
                                    <div className="">
                                        <div className="border rounded-lg">
                                            <div className="p-2">
                                                Date: { formatDate(item.purchase_date) }
                                            </div>
                                            <div className="p-2">
                                                Qty: { item.quantity }
                                            </div>
                                            <div className="p-2">
                                                Total: { item.book.price * item.quantity }
                                            </div>
                                        </div>
                                        <div className="my-2 p-2 border rounded-lg">
                                            <button onClick={() => { navigate(`/dashboard/review/${item.book.id}`)}}>
                                                Add a review
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                }
            </div> }
        </div>
    );
}

export default Orders;