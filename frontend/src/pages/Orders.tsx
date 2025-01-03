import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import api from "../utils/api";
import { CartInterface } from "../types";
import BackButton from "../components/BackButton";

const initialState: CartInterface = {
    data: []
}

const Orders = () => {

    const [ loading, setLoading ] = useState(false);
    const [ orders, setOrders ] = useState(initialState);


    useEffect(() => {

        const authToken = localStorage.getItem('authToken');
        const config = { headers: { Authorization: authToken } };

        setLoading(true);

        api
        .get('http://localhost:5555/cart/get-purchased-items', config)
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
                        <div className="text-xl font-semibold my-4">Orders:</div>
                        <ul>
                            {orders.data.map((item)=> (
                                <li key={item.book.id}>
                                    <div className="flex justify-start items-center gap-x-4">
                                        { item.quantity } • { item.book.title }
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