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
        book: UserBook,
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

export interface UserInterface {
    id: number,
    email: string,
    first_name: string | null
    last_name: string | null
    password: string | null
    googleId: string | null
    provider: string
    role: string
    verified: boolean
    created_at: Date
    updated_at: Date
  
    cart: CartInterface | null
    address: Address | null
    review: Review[] | null
    wishlist: Wishlist[] | null
    recently_viewed: RecentlyViewed[] | null
}
export interface OrderInterface {
    id: number,
    user_id: number,
    user: UserInterface | null
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

    cancellation_status: string,
    cancellation_reason: string | null,
    cancellation_requested_at: Date | null,
    cancellation_resolved_at: Date | null,
    cancellation_processed_by: number | null,
  
    return_status: string,
    return_reason: string | null,
    return_requested_at: Date | null,
    return_resolved_at: Date | null,
    return_completed_at: Date | null,
    return_tracking_number: string | null,
    return_shipping_label_url: string | null,
    return_processed_by: number | null,
  
    purchase_date: Date,
}

export interface OrdersInterface {
    data: OrderInterface []
}

export interface OrderItemInterface {
    id: number,
    book_id: number,
    book: UserBook,
    order_id: number,
    order: OrderInterface,
    quantity: number,
    unit_price: number,
    offer_id: number | null,
    special_offer: Offer | null,
}

export interface BaseBook {
    id: number;
    title: string;
    author: string;
    publish_year: number;
    price: number;
    category_id: number | null;
    average_rating: number;
    created_at: Date;
    updated_at: Date;
    cover_image: string;
    category: SubCategory | null;
    purchase_count: number;
    description: string | null;
    isbn: string | null;
    publisher: string | null;
    language: string;
    pages: number | null;
    format: string | null;
    is_cancellable: boolean;
    cancellation_hours: number;
    cancellation_policy: string | null;
    is_returnable: boolean;
    return_days: number;
    return_policy: string | null;
    special_offers: Offer[] | null;
    is_available: boolean; // quantity > 0 && is_active
}

export interface UserBook extends BaseBook {}

export interface AdminBook extends BaseBook {
    quantity: number;
    is_active: boolean;
    shelf_location: string | null;
    sku: string | null;
}

export interface Address {
    id: number;
    name: string;
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
    book: UserBook;
    book_id: number;
    user_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface RecentlyViewed {
    id: number;
    book: UserBook;
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

declare global {
    interface Window {
        Razorpay: any
    }
}

export {};