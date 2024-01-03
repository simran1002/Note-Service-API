require('dotenv').config();

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Note = require('../models/note');

// Basic Authentication Middleware
const basicAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
 
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const email = req.body.email;
    
    if (email === process.env.EMAIL) { 
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
  
  router.use(basicAuth);

// Create Note
router.post('/', [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('content').trim().isLength({ min: 5 }).withMessage('Content must be at least 5 characters long'),
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const newNote = new Note({
        title: req.body.title,
        content: req.body.content,
      });
  
      const savedNote = await newNote.save();
      res.status(201).json(savedNote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Retrieve Notes
  router.get('/', async (req, res) => {
    try {
      const notes = await Note.find();
      res.status(200).json(notes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Retrieve a Single Note by ID
  router.get('/:id', async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
  
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
  
      res.status(200).json(note);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Update Note
  router.put('/:id', [
    body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('content').optional().trim().isLength({ min: 5 }).withMessage('Content must be at least 5 characters long'),
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const note = await Note.findById(req.params.id);
  
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
  
      if (req.body.title) {
        note.title = req.body.title;
      }
  
      if (req.body.content) {
        note.content = req.body.content;
      }
  
      note.updatedAt = Date.now();
      const updatedNote = await note.save();
      res.status(200).json(updatedNote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Delete Note
  router.delete('/:id', async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
  
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
  
      await note.remove();
      res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
