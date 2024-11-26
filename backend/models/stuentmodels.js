const mongoose = require('mongoose');

// Define a schema that matches the student schema but allows flexibility
const DataSchema = new mongoose.Schema({
    NAME: { type: String, required: true },
    COL: { type: String, required: true },
    DEPT: { type: String, required: true },
    YEAR: { type: Number, required: true },
    HTNO: { type: String, required: true },
    TYPE: { type: String, required: true }
}, { 
    strict: false,  // Allow additional fields from Excel uploads
    timestamps: true // Optional: adds createdAt and updatedAt fields
});

// Create and export the Mongoose model
const DataModel = mongoose.model('Data', DataSchema);

module.exports = DataModel;