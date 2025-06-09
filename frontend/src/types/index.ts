import { UserState } from "../redux/userSlice";
// import { CartInterface } from "../redux/cartSlice";

export interface RootState { 
    userinfo: UserState;
    cartinfo: CartInterface;
}

export interface CartInterface {
    data: {
        id: number,
        quantity: number,
        book: Book,
        special_offer: Offer,
    } []
}

// export interface PurchaseInterface {
//     data: {
//         id: number,
//         user_id: number,
//         book_id: number,
//         book: Book,
//         address_id: number,
//         address: Address,
//         offer_id: number,
//         special_offer: Offer,
//         purchase_date: Date,
//         purchase_price: number,
//         quantity: number,
//     } []
// }
export interface OrderInterface {
    // data: {
        id: number,
        user_id: number,
        order_items: OrderItemInterface [],
        address_id: number,
        address: Address,
        order_number: string,
        order_status: string,
        payment_status: string,
        delivery_charges: number,
        subtotal: number,
        tax_percentange: number,
        total_amount: number,
        shipping_carrier: string | null,
        tracking_number: string | null,
        shipping_label_url: string | null,
        delivery_method: string,
        expected_delivery_date: Date,
        actual_delivery_date: Date | null,
    // } []
}

export interface OrdersInterface {
    data: OrderInterface []
}

export interface OrderItemInterface {
    id: number,
    book_id: number,
    book: Book,
    order_id: number,
    order: OrderInterface,
    quantity: number,
    unit_price: number,
    offer_id: number | null,
    special_offer: Offer | null,
    purchase_date: Date,
}

export interface Book {
    id: number;
    title: string;
    author: string;
    publish_year: number;
    price: number;
    category_id: number;
    average_rating: number;
    created_at: Date;
    updated_at: Date;
    cover_image: string;
    category: SubCategory;

    special_offers: Offer[] | null;
}

export interface Address {
    id: number;
    house_number: string;
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
    user?: { email : string };
    book?: { title: string};
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

export interface RecentlyViewed {
    id: number;
    book: Book;
    book_id: number;
    user_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface Category {
    id: number;
    title: string;
    sub_category: SubCategory[];
    parent_id: number|null;
    created_by: number|null;
    updated_by: number|null;
}

export interface SubCategory {
    id: number;
    title: string;
    parent_id: number|null;
    created_by: number|null;
    updated_by: number|null;

}

export interface Offer {
    id: number,
    discount_percentage: number;
    offer_type: string;
    description: string;
    offer_valid_from: Date;
    offer_valid_until: Date;
}