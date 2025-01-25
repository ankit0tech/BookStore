import { PrismaClient } from "@prisma/client";


const retrieveBook = async (id: number, prisma: PrismaClient) => {
    const book = await prisma.book.findUnique({
        where: {
            id: id
        }
    });
    
    return book;
}

export {
    retrieveBook
}