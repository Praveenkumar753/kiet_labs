const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const DataModel = require('../models/models');

const router = express.Router();

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Validate and transform data to match the required schema
        const processedData = rawData.map(row => ({
            NAME: row.NAME || '', // Ensure NAME is present
            COL: row.COL || '',   // Ensure COL is present
            DEPT: row.DEPT || '', // Ensure DEPT is present
            YEAR: row.YEAR || 0,  // Ensure YEAR is present
            HTNO: row.HTNO || '', // Ensure HTNO is present
            TYPE: row.TYPE || '',  // Ensure TYPE is present
            ...row  // Spread rest of the fields
        }));

        // Validate data before insertion
        const validData = processedData.filter(row => 
            row.NAME && row.COL && row.DEPT && row.YEAR && row.HTNO && row.TYPE
        );

        // Insert data into the same collection
        await DataModel.insertMany(validData);
        
        res.status(200).send({ 
            message: 'Data successfully uploaded to MongoDB', 
            data: validData,
            totalReceived: rawData.length,
            totalInserted: validData.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error uploading data', error });
    }
});

// GET: Fetch all data
router.get('/datas', async (req, res) => {
    try {
        const data = await DataModel.find();
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error fetching data', error });
    }
});

// PUT: Edit data by ID
router.put('/data/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedData = await DataModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedData) {
            return res.status(404).send({ message: 'Data not found' });
        }
        res.status(200).send({ message: 'Data successfully updated', data: updatedData });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error updating data', error });
    }
});

// DELETE: Remove data by ID
router.delete('/data/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedData = await DataModel.findByIdAndDelete(id);
        if (!deletedData) {
            return res.status(404).send({ message: 'Data not found' });
        }
        res.status(200).send({ message: 'Data successfully deleted', data: deletedData });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error deleting data', error });
    }
});

// DELETE: Remove all data for a specific year
router.delete('/data/year/:year', async (req, res) => {
    const { year } = req.params;
    try {
        const deletedData = await DataModel.deleteMany({ YEAR: year });
        if (deletedData.deletedCount === 0) {
            return res.status(404).send({ message: 'No data found for the specified year' });
        }
        res.status(200).send({ message: `Data for YEAR ${year} successfully deleted`, data: deletedData });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error deleting data', error });
    }
});

module.exports = router;
