import mongoose, { Schema, Document} from "mongoose";

export interface IUser extends Document {
    _id?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
    role: string
}

export const UserSchema: Schema<IUser> = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        }
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model<IUser>('User', UserSchema);