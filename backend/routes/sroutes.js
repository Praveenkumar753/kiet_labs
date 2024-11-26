const express = require('express');
const DataModel = require('../models/models'); // Use the unified model

const router = express.Router();

// POST: Add a new student to the same collection
router.post('/add', async (req, res) => {
    try {
        const { NAME, COL, DEPT, YEAR, HTNO, TYPE } = req.body;

        // Validate fields
        if (!NAME || !COL || !DEPT || !YEAR || !HTNO || !TYPE) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create new student in the same collection
        const newStudent = new DataModel({ NAME, COL, DEPT, YEAR, HTNO, TYPE });
        const savedStudent = await newStudent.save();

        res.status(201).json({ message: 'Student added successfully', data: savedStudent });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Error adding student', error });
    }
});
// GET: Fetch all students
router.get('/all', async (req, res) => {
    try {
        const students = await DataModel.find({}).sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students', error });
    }
});

// PUT: Update a student
router.put('/update/:id', async (req, res) => {
    try {
        const { NAME, COL, DEPT, YEAR, HTNO, TYPE } = req.body;
        
        // Validate fields
        if (!NAME || !COL || !DEPT || !YEAR || !HTNO || !TYPE) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const updatedStudent = await DataModel.findByIdAndUpdate(
            req.params.id,
            { NAME, COL, DEPT, YEAR, HTNO, TYPE },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student updated successfully', data: updatedStudent });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Error updating student', error });
    }
});

// DELETE: Remove a student
router.delete('/delete/:id', async (req, res) => {
    try {
        const deletedStudent = await DataModel.findByIdAndDelete(req.params.id);
        
        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully', data: deletedStudent });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Error deleting student', error });
    }
});




// New route: Promote students by year
router.put('/promote', async (req, res) => {
    try {
        const { year } = req.body;
        
        // Validate year
        if (!year) {
            return res.status(400).json({ message: 'Year is required' });
        }

        // Find all students in the specified year and increment their year by 1
        const result = await DataModel.updateMany(
            { YEAR: year },
            { $inc: { YEAR: 1 } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No students found in the specified year' });
        }

        res.json({ 
            message: 'Students promoted successfully', 
            modifiedCount: result.modifiedCount 
        });
    } catch (error) {
        console.error('Error promoting students:', error);
        res.status(500).json({ message: 'Error promoting students', error });
    }
});

// New route: Delete students by year
router.delete('/deleteByYear/:year', async (req, res) => {
    try {
        const { year } = req.params;
        
        // Validate year
        if (!year) {
            return res.status(400).json({ message: 'Year is required' });
        }

        // Delete all students in the specified year
        const result = await DataModel.deleteMany({ YEAR: parseInt(year) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No students found in the specified year' });
        }

        res.json({ 
            message: 'Students deleted successfully', 
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        console.error('Error deleting students:', error);
        res.status(500).json({ message: 'Error deleting students', error });
    }
});




router.put('/demote', async (req, res) => {
    try {
        const { year } = req.body;
        if (!year) {
            return res.status(400).json({ message: 'Year is required' });
        }
        const result = await DataModel.updateMany(
            { YEAR: year },
            { $inc: { YEAR: -1 } }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No students found in the specified year' });
        }
        res.json({ message: 'Students demoted successfully', modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error demoting students:', error);
        res.status(500).json({ message: 'Error demoting students', error });
    }
});

module.exports = router;