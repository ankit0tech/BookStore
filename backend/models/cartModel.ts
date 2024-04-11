import mongoose, {Schema, Document} from "mongoose";

export interface ICart extends Document {
    userId: Schema.Types.ObjectId;
    bookId: Schema.Types.ObjectId;
    quantity: number;
    purchased: boolean
}

export const CartSchema: Schema<ICart> = new mongoose.Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        bookId: {
            type: Schema.Types.ObjectId,
            ref: 'Book',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        purchased: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);