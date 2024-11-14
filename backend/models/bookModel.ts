import mongoose, { Schema, Document} from "mongoose";

export interface IBook extends Document {
    id?: string;
    title: string;
    author: string;
    publishYear: number;
    price: number;
    category: string;
}

export const BookSchema: Schema<IBook> = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        publishYear: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: false,
        }
    },
    {
        timestamps: true,
    }
);

export const Book = mongoose.model<IBook>('Book', BookSchema);