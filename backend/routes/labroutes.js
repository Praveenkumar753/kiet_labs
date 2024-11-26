const express = require('express');
const router = express.Router();
const StudentRegistration = require('../models/labmodels');
const DataModel = require('../models/models');

router.get('/colleges', async (req, res) => {
    try {
        const colleges = await DataModel.distinct('COL');
        res.json(colleges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching colleges', error });
    }
});

router.get('/years', async (req, res) => {
    const { college } = req.query;
    try {
        const years = await DataModel.distinct('YEAR', { COL: college });
        res.json(years);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching years', error });
    }
});

router.get('/departments', async (req, res) => {
    const { college, year } = req.query;
    try {
        const departments = await DataModel.distinct('DEPT', { COL: college, YEAR: parseInt(year) });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching departments', error });
    }
});

router.get('/types', async (req, res) => {
    const { college, department, year } = req.query;
    try {
        const types = await DataModel.distinct('TYPE', {
            COL: college,
            DEPT: department,
            YEAR: parseInt(year),
        });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching types', error });
    }
});

router.get('/names', async (req, res) => {
    const { college, department, type, year } = req.query;
    try {
        const names = await DataModel.find({
            COL: college,
            DEPT: department,
            TYPE: type,
            YEAR: parseInt(year),
        }).select('NAME HTNO');
        res.json(names);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching names', error });
    }
});

router.post('/register', async (req, res) => {
    try {
        const requiredFields = [
            'college', 'department', 'type', 'name', 'htno',
            'semester', 'email', 'phoneNumber', 'selectedLab',
            'pythonRating', 'aiMlRating', 'year'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(req.body.phoneNumber)) {
            return res.status(400).json({
                message: 'Invalid phone number format'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({
                message: 'Invalid email format'
            });
        }

        const existingRegistration = await StudentRegistration.findOne({
            htno: req.body.htno,
            semester: req.body.semester
        });

        if (existingRegistration) {
            return res.status(400).json({
                message: 'Student already registered for this semester'
            });
        }

        const newRegistration = new StudentRegistration({
            college: req.body.college,
            YEAR: parseInt(req.body.year),
            department: req.body.department,
            type: req.body.type,
            name: req.body.name,
            htno: req.body.htno,
            semester: req.body.semester,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            selectedLab: req.body.selectedLab,
            pythonRating: parseInt(req.body.pythonRating),
            aiMlRating: parseInt(req.body.aiMlRating)
        });

        const savedRegistration = await newRegistration.save();
        res.status(201).json({
            message: 'Registration successful',
            data: savedRegistration
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            message: 'Registration failed',
            error: error.message
        });
    }
});


router.get('/all', async (req, res) => {

    try {
        const registrations = await StudentRegistration.find();
        res.json(registrations);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching registrations',
            error: error.message
        });
    }
});




router.get('/datas', async (req, res) => {
    try {
      const data = await DataModel.find();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });





module.exports = router;