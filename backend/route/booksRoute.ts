import express from "express";
import { Book, IBook } from "../models/bookModel";

const router = express.Router();

// save a book
router.post('/', async (req, res) => {
    try {
        // request validation
        if(!req.body.title || !req.body.author || !req.body.publishYear) {
            return res.status(400).send({
                message: 'send all required fields: title, author, publishYear',
            });
        }
        
        const newBook = {
            title: req.body.title,
            author: req.body.author,
            publishYear: req.body.publishYear,
        };

        const book: IBook = await Book.create(newBook);

        return res.status(201).send(book);

    }
    catch(error: any) {
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

// return all the books
router.get('/', async (req, res) => {
    try {
        const books = await Book.find({});

        return res.status(200).json({count: books.length, data: books});
    }
    catch (error: any) {
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

// get one book by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        res.status(200).json(book);
    }
    catch (error: any) {
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

// Update a book using Id
router.put('/:id', async (req, res) => {
    try {
        // request validation
        if(!req.body.title || !req.body.author || !req.body.publishYear) {
            return res.status(400).send({
                message: 'send all required fields: title, author, publishYear',
            });
        }

        const { id } = req.params;

        const result = await Book.findByIdAndUpdate(id, req.body);
        
        if(!result) {
            return res.status(400).json({message: `Book with id: ${id} could not be found`});
        }
        res.status(200).send({message: 'Book updated successfully'});
    }
    catch (error: any) {
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

// delete a book with id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await Book.findByIdAndDelete(id);
        console.log(id)

        if(!result) {
            return res.status(400).json({message: `Book with id: ${id} could not be found`});
        }
        res.status(200).send({message: 'Book deleted successfully'});
    }
    catch (error: any) {
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

export default router;