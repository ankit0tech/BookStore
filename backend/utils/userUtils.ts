import { Request } from 'express';
import { PrismaClient } from "@prisma/client";


const retrieveUser = async (req: Request, prisma: PrismaClient) => {
    const user = await prisma.userinfo.findUnique({
        where: {
            email: req.authEmail
        }
    });

    return user;
}


export {
    retrieveUser, 
};