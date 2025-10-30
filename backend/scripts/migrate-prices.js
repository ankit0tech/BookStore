// this script migrate price from RUPEES to PAISE
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


const migratePrices = async () => {

    const books = await prisma.book.findMany({
        where: {},
        select: {
            id: true,
            price: true
        }
    });

    for (const book of books) {
        const updatedPrice = Math.round(Number(book.price)*100);

        await prisma.book.update({
            where: {
                id: book.id
            },
            data: {
                price: updatedPrice
            }
        });
    }

    console.log("Migrated book prices");


    const items = await prisma.order_items.findMany({
        where: {},
        select: {
            id: true,
            unit_price: true
        }
    });

    for(const item of items) {
        const updatedPrice = Math.round(Number(item.unit_price)*100);
        await prisma.order_items.update({
            where: {
                id: item.id
            },
            data: {
                unit_price: updatedPrice
            }
        });
    }

    console.log("Migrated order_items");


    const orders = await prisma.orders.findMany({
        where: {},
        select: {
            id: true,
            delivery_charges: true,
            subtotal: true,
            total_amount: true
        }
    });

    for(const order of orders) {
        const updatedDelivery = Math.round(Number(order.delivery_charges)*100);
        const subtotal = Math.round(Number(order.subtotal)*100);
        const total = Math.round(Number(order.total_amount)*100);

        await prisma.orders.update({
            where: {
                id: order.id
            },
            data: {
                delivery_charges: updatedDelivery,
                subtotal: subtotal,
                total_amount: total
            }
        });
    }

    console.log("updated orders");

}

migratePrices();