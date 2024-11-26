import React, { useState } from 'react';
import axios from 'axios';

const AddStudent = () => {
    const [student, setStudent] = useState({
        NAME: '',
        COL: '',
        DEPT: '',
        YEAR: '',
        HTNO: '',
        TYPE: '',
    });

    const backendURL = 'https://kiet-labs-backend.onrender.com';

    // Handle input changes
    const handleChange = (e) => {
        setStudent({ ...student, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            !student.NAME ||
            !student.COL ||
            !student.DEPT ||
            !student.YEAR ||
            !student.HTNO ||
            !student.TYPE
        ) {
            alert('Please fill in all fields');
            return;
        }
        try {
            await axios.post(`${backendURL}/api/student/add`, student);
            alert('Student added successfully!');
            setStudent({
                NAME: '',
                COL: '',
                DEPT: '',
                YEAR: '',
                HTNO: '',
                TYPE: '',
            });
        } catch (error) {
            console.error('Error adding student:', error);
            alert('Failed to add student.');
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
            <h2>Add Student</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="NAME"
                        value={student.NAME}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>College:</label>
                    <input
                        type="text"
                        name="COL"
                        value={student.COL}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Department:</label>
                    <input
                        type="text"
                        name="DEPT"
                        value={student.DEPT}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Year:</label>
                    <input
                        type="number"
                        name="YEAR"
                        value={student.YEAR}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Hall Ticket Number:</label>
                    <input
                        type="text"
                        name="HTNO"
                        value={student.HTNO}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Type (e.g., Day Scholar/Hostel):</label>
                    <input
                        type="text"
                        name="TYPE"
                        value={student.TYPE}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" style={{ marginTop: '10px' }}>
                    Add Student
                </button>
            </form>
        </div>
    );
};

export default AddStudent;
