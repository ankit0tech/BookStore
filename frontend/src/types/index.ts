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

export interface PurchaseInterface {
    data: {
        book: Book,
        purchase_date: Date,
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

export interface Review {
    id: number;
    user_id: number;
    book_id: number;
    user_email: string | null;
    book_title: string | null;
    rating: number;
    review_text: string;
    created_at: Date;
    updated_at: Date;
}

export interface Wishlist {
    id: number;
    book: Book;
    book_id: number;
    user_id: number;
    created_at: Date;
    updated_at: Date;
}