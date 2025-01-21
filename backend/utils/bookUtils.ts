import { Response } from 'express';
import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";


const retrieveBook = async (id: string, res: Response, prisma: PrismaClient) => {
    const book = await prisma.book.findUnique({
        where: {
            id: Number(id)
        }
    });
    if (!book) {
        logger.error('Error occurred while fetching book while adding review');
        return res.status(404).json({ message: 'Error occurred, book not found'});
    }
    
    return book;
}

export {
    retrieveBook
}