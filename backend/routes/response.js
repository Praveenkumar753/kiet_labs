const express = require('express');
const router = express.Router();
const StudentRegistration = require('../models/labmodels'); // Use your model

// GET all responses
router.get('/', async (req, res) => {
    try {
        const registrations = await StudentRegistration.find();
        res.json(registrations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// UPDATE a response field
router.put('/:id/:field', getRegistration, async (req, res) => {
    const { newValue } = req.body;
    if (newValue === undefined) return res.status(400).json({ message: 'newValue is required' });

    try {
        res.registration[req.params.field] = newValue;
        await res.registration.save();
        res.json({ message: 'Registration updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
});

// DELETE a registration
router.delete('/:id', getRegistration, async (req, res) => {
    try {
        await res.registration.remove();
        res.json({ message: 'Registration deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Middleware to get a registration by ID
async function getRegistration(req, res, next) {
    let registration;
    try {
        registration = await StudentRegistration.findById(req.params.id);
        if (registration === null) return res.status(404).json({ message: 'Registration not found' });
        res.registration = registration;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = router;