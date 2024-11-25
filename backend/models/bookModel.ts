import mongoose, { Schema, Document} from "mongoose";

export interface IBook {
    id: number;
    title: string;
    author: string;
    publish_year: number;
    price: number;
    category: string | null;
    cover_image: string;
}
