import { UserState } from "../redux/userSlice";
// import { CartInterface } from "../redux/cartSlice";

export interface RootState { 
    userinfo: UserState;
    cartinfo: CartInterface;
}

export interface CartInterface {
    data: {
        book: Book,
        quantity: number,
    } []
}

export interface Book {
    id: number;
    title: string;
    author: string;
    publish_year: number;
    price: number;
    category: string | null;
    created_at: Date;
    updated_at: Date;
    cover_image: string;
}

export interface Address {
    id: number;
    user_id: number;
    street_address: string;
    city: string;
    state: string;
    zip_code: number;
    country: string;
    is_default: boolean;
}