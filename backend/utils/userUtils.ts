import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";


const retrieveUser = async (req: Request, prisma: PrismaClient) => {
    const user = await prisma.userinfo.findUnique({
        where: {
            email: req.authEmail
        }
    });

    return user;
}

const getUserFromId = async (id: number, prisma: PrismaClient) => {
    const user = await prisma.userinfo.findUnique({
        where: {
            id: id
        }
    });

    return user;
}

export {
    retrieveUser,
    getUserFromId,
};