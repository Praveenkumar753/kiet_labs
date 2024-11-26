const mongoose = require('mongoose');

const StudentRegistrationSchema = new mongoose.Schema({
    college: { 
        type: String, 
        required: true,
        trim: true
    },
    YEAR: { type: Number,
            required: true 
          },
    department: { 
        type: String, 
        required: true,
        trim: true
    },
    type: { 
        type: String, 
        required: true,
        trim: true
    },
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    htno: { 
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    semester: { 
        type: String, 
        enum: ['1', '2'],
        required: true
    },
    email: { 
        type: String, 
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phoneNumber: { 
        type: String, 
        required: true,
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number']
    },
    selectedLab: { 
        type: String, 
        enum: ['Robotics', 'NLP', 'CV', 'Cyber'],
        required: true
    },
    pythonRating: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    aiMlRating: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudentRegistration', StudentRegistrationSchema);