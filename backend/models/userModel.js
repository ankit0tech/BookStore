import mongoose from "mongoose";

export const UserSchema = mongoose.Schema(
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
    }
);

export const User = mongoose.model ('User', UserSchema);