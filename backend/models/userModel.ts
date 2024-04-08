import mongoose, { Schema, Document} from "mongoose";

export interface IUser extends Document {
    _id?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
}

export const UserSchema: Schema<IUser> = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model<IUser>('User', UserSchema);