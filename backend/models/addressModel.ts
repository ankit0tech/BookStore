export interface IAddress {
    id?: number;
    user_id: number;
    street_address: string;
    city: string;
    state?: string | null;
    zip_code: string;
    country: string;
    is_default: boolean;
    created_at?: Date;
    update_at?: Date;
}