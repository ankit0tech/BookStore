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
        userId: string,
        bookId: string,
        bookTitle: string,
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
    publishYear: string;
    quantity?: number;
    createdAt: string;
    updatedAt: string;
}
