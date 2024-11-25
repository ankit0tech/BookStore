import { UserState } from "../redux/userSlice";
// import { CartInterface } from "../redux/cartSlice";

export interface RootState { 
    userinfo: UserState;
    cartinfo: CartInterface;
}

export interface CartInterface {
    count: number,
    data: {
        id: string,
        user_id: string,
        book_id: string,
        book_title: string,
        quantity: number,
        // price: number,
        purchased: boolean
    } []
}

export interface Book {
    id: string;
    title: string;
    author: string;
    price: number;
    category: string;
    publish_year: string;
    quantity?: number;
    created_at: string;
    updated_at: string;
    cover_image: string;
}
