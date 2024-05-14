import { UserState } from "../redux/userSlice";
// import { CartInterface } from "../redux/cartSlice";

export interface RootState { 
    userinfo: UserState;
    cartinfo: CartInterface;
}

export interface CartInterface {
    count: number,
    data: {
        _id: string,
        userId: string,
        bookId: string,
        bookTitle: string,
        quantity: number,
        purchased: boolean
    } []
}
