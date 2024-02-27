import mongoose, { Schema, Document} from "mongoose";

export interface IBook extends Document {
    title: string;
    author: string;
    publishYear: number;
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
    },
    {
        timestamps: true,
    }
);

export const Book = mongoose.model<IBook>('Book', BookSchema);