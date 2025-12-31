import express from 'express'
import { authMiddleware, roleMiddleware } from './middleware.js';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { categoryZod } from '../zod/categoryZod.js';


const router = express.Router();
const prisma = new PrismaClient();


router.get('/', authMiddleware, async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: {
                parent_id: null
            },
            include: {
                sub_category: true
            },
            orderBy: {
                created_at: 'asc'
            }
        });

        if (!categories) {
            return res.status(404).json({message: 'Item not found'});
        }
        
        return res.status(200).json({data: categories});
        
    } catch(e) {
        logger.error('Error occurred while fetching categories');
        return res.status(500).json({message: 'Error while fetching categories'});
    }
});

router.get('/:id(\\d+)', authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ })
        }

        const category = await prisma.category.findUnique({
            where: {
                id: Number(id),
            }, 
            include: {
                sub_category: true
            }
        });

        if (!category) {
            return res.status(404).json({message: 'Item not found'});
        }

        return res.status(200).json({data: category});


    } catch(e) {
        logger.error(`Error occurred while fetching category with id: ${req.params.id}`);
        return res.status(500).json({message: 'Error while fetching book category'});
    }
});

router.post('/', roleMiddleware(['admin', 'superadmin']), async (req, res) => {
    try {
        const data = req.body;
        const result = categoryZod.safeParse(data);
        
        if (result.success) {
            const createdCategory = await prisma.category.create({
                data: {
                    title: data.title,
                    parent_id: data.parent_id || null,
                    created_by: req.userId,
                    updated_by: req.userId
                }
            });

            logger.info(`Added new category ${createdCategory.title}`);
            return res.status(201).json({message: 'Added new category', data: createdCategory });

        } else {
            return res.status(400).json({
                message: 'Invalid inputs',
                errors: result.error.format()
            });
        }

    } catch(e: any) {
        logger.error(`Error while adding new category: ${e.message}`);
        return res.status(500).json({message: 'Error while adding new category'});
    }
});

router.put('/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({message: 'Invalid inputs'});
        }

        const result = categoryZod.safeParse(req.body);

        if(result.success) {
            const updatedCategory = await prisma.category.update({
                where: {
                    id: id
                },
                data: {
                    title: req.body.title,
                    updated_by: req.userId,
                    ...(req.body.parent_id ? {parent_id: req.body.parent_id} : {})
                }
            });
            
            logger.info(`Updated category with id: ${id}`);
            return res.status(200).json({ message: 'Category updated successfully', data: updatedCategory });

        } else {
            return res.status(400).json({
                message: 'invaid input',
                errors: result.error.format()
            });
        }
    } catch (e: any) {
        logger.error(`Error while updating category: ${e.message}`);
        return res.status(500).json({message: 'Error while updating new category'});
    }
});

router.delete('/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if(isNaN(id)) {
            return res.status(400).json({message: 'Invalid inputs'});
        }

        await prisma.category.delete({
            where: {
                id: id
            }
        });

        logger.info(`Deleted category with id: ${id}`);
        return res.status(200).json({message: 'Deleted category successfully'});

    } catch(error: any) {
        if(error.code === 'P2025') {
            logger.info(`While deletion, category with id ${req.params.id} not found`);
            return res.status(404).json({message: `Category with id ${req.params.id} not found`});
        }
        
        logger.error(`Error while deleting category with id: ${req.params.id}, message: ${error.message}`);
        return res.status(500).json({message: `Error while deleting category with id: ${req.params.id}`})
    }
});


export default router;