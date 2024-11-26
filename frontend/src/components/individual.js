import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentRegistrationForm() {
    // State for form data
    const [formData, setFormData] = useState({
        college: '',
        department: '',
        type: '',
        name: '',
        htno: '',
        semester: '',
        email: '',
        phoneNumber: '',
        selectedLab: '',
        pythonRating: 1,
        aiMlRating: 1
    });

    // Dropdown options state
    const [colleges, setColleges] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [types, setTypes] = useState([]);
    const [names, setNames] = useState([]);
    
    // Lab availability state
    const [labAvailability, setLabAvailability] = useState([]);
    const [availableLabs, setAvailableLabs] = useState([]);

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch colleges on component mount
    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/registration/colleges');
                setColleges(response.data);
            } catch (error) {
                console.error('Error fetching colleges:', error);
                setError('Failed to fetch colleges');
            }
        };
        fetchColleges();
    }, []);

    // Fetch departments when college changes
    useEffect(() => {
        const fetchDepartments = async () => {
            if (!formData.college) return;
            try {
                const response = await axios.get('http://localhost:5000/api/registration/departments', {
                    params: { college: formData.college }
                });
                setDepartments(response.data);
                // Reset dependent fields
                setFormData(prev => ({
                    ...prev,
                    department: '',
                    type: '',
                    name: '',
                    htno: '',
                    selectedLab: ''
                }));
                // Reset lab availability
                setLabAvailability([]);
                setAvailableLabs([]);
            } catch (error) {
                console.error('Error fetching departments:', error);
                setError('Failed to fetch departments');
            }
        };
        fetchDepartments();
    }, [formData.college]);

    // Fetch types when department changes
    useEffect(() => {
        const fetchTypes = async () => {
            if (!formData.college || !formData.department) return;
            try {
                const response = await axios.get('http://localhost:5000/api/registration/types', {
                    params: { 
                        college: formData.college,
                        department: formData.department 
                    }
                });
                setTypes(response.data);
                // Reset dependent fields
                setFormData(prev => ({
                    ...prev,
                    type: '',
                    name: '',
                    htno: '',
                    selectedLab: ''
                }));
                // Reset lab availability
                setLabAvailability([]);
                setAvailableLabs([]);
            } catch (error) {
                console.error('Error fetching types:', error);
                setError('Failed to fetch types');
            }
        };
        fetchTypes();
    }, [formData.college, formData.department]);

    // Fetch names when type changes
    useEffect(() => {
        const fetchNames = async () => {
            if (!formData.college || !formData.department || !formData.type) return;
            try {
                const response = await axios.get('http://localhost:5000/api/registration/names', {
                    params: { 
                        college: formData.college,
                        department: formData.department,
                        type: formData.type
                    }
                });
                setNames(response.data);
            } catch (error) {
                console.error('Error fetching names:', error);
                setError('Failed to fetch names');
            }
        };
        fetchNames();
    }, [formData.college, formData.department, formData.type]);

    // Fetch lab availability when college, department, and type are selected
    useEffect(() => {
        const fetchLabAvailability = async () => {
            if (!formData.college || !formData.department || !formData.type) return;
            
            setLoading(true);
            try {
                // Fetch registration data
                const registrationResponse = await axios.get('http://localhost:5000/api/registration/all');
                
                // Fetch original student data
                const originalDataResponse = await axios.get('http://localhost:5000/api/datas');

                // Filter original data for specific college
                const filteredOriginalData = originalDataResponse.data.filter(student => 
                    student.COL === formData.college
                );

                // Get total students for this specific department and type
                const totalStudents = filteredOriginalData.filter(
                    student => student.DEPT === formData.department && student.TYPE === formData.type
                ).length;

                // Determine available labs
                const availableLabs = formData.department === 'CSC' 
                    ? ['Cyber'] 
                    : ['Robotics', 'NLP', 'CV'];

                // Calculate lab capacity
                const labCapacity = Math.ceil(totalStudents / availableLabs.length);

                // Process lab availability
                const availability = availableLabs.map(lab => {
                    // Filter registrations for this specific group and lab
                    const labApplicants = registrationResponse.data.filter(reg => 
                        reg.college === formData.college &&
                        reg.department === formData.department &&
                        reg.type === formData.type &&
                        reg.selectedLab === lab
                    );

                    return {
                        lab,
                        totalStudents,
                        totalAvailable: labCapacity,
                        applicants: labApplicants.length,
                        vacant: Math.max(0, labCapacity - labApplicants.length)
                    };
                });

                setLabAvailability(availability);
                setAvailableLabs(availableLabs);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching lab availability:', error);
                setError('Failed to fetch lab availability');
                setLoading(false);
            }
        };

        fetchLabAvailability();
    }, [formData.college, formData.department, formData.type]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for name to auto-fill HTNO
        if (name === 'name') {
            const selectedStudent = names.find(student => student.NAME === value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                htno: selectedStudent ? selectedStudent.HTNO : ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/registration/register', formData);
            alert('Registration successful!');
            // Reset form
            setFormData({
                college: '',
                department: '',
                type: '',
                name: '',
                htno: '',
                semester: '',
                email: '',
                phoneNumber: '',
                selectedLab: '',
                pythonRating: 1,
                aiMlRating: 1
            });
            // Reset other states
            setDepartments([]);
            setTypes([]);
            setNames([]);
            setLabAvailability([]);
            setAvailableLabs([]);
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    return (
        <div style={{maxWidth: '600px', margin: 'auto', padding: '20px'}}>
            <h2 style={{textAlign: 'center'}}>Student Registration Form</h2>
            <form onSubmit={handleSubmit}>
                {/* College Dropdown */}
                <div>
                    <label>College:</label>
                    <select
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select College</option>
                        {colleges.map((college, index) => (
                            <option key={index} value={college}>{college}</option>
                        ))}
                    </select>
                </div>

                {/* Department Dropdown */}
                <div>
                    <label>Department:</label>
                    <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        disabled={!formData.college}
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                {/* Type Dropdown */}
                <div>
                    <label>Type:</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        disabled={!formData.department}
                    >
                        <option value="">Select Type</option>
                        {types.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Lab Availability Table */}
                {formData.college && formData.department && formData.type && (
                    <div>
                        <h3>Lab Availability</h3>
                        {loading ? (
                            <div>Loading lab availability...</div>
                        ) : error ? (
                            <div style={{color: 'red'}}>{error}</div>
                        ) : (
                            <table border="1">
                                <thead>
                                    <tr>
                                        <th>Lab</th>
                                        <th>Total Capacity</th>
                                        <th>Current Applicants</th>
                                        <th>Vacant Seats</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {labAvailability.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.lab}</td>
                                            <td>{item.totalAvailable}</td>
                                            <td>{item.applicants}</td>
                                            <td>{item.vacant}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Lab Selection */}
                <div>
                    <label>Select Lab:</label>
                    <select
                        name="selectedLab"
                        value={formData.selectedLab}
                        onChange={handleChange}
                        required
                        disabled={!formData.type}
                    >
                        <option value="">Select Lab</option>
                        {availableLabs.map((lab, index) => (
                            <option 
                                key={index} 
                                value={lab}
                                disabled={
                                    labAvailability.find(item => 
                                        item.lab === lab && item.vacant === 0
                                    ) ? true : false
                                }
                            >
                                {lab} {
                                    labAvailability.find(item => 
                                        item.lab === lab && item.vacant === 0
                                    ) ? '(Full)' : ''
                                }
                            </option>
                        ))}
                    </select>
                </div>

                {/* Name Dropdown */}
                <div>
                    <label>Name:</label>
                    <select
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={!formData.type}
                    >
                        <option value="">Select Name</option>
                        {names.map((student, index) => (
                            <option key={index} value={student.NAME}>{student.NAME}</option>
                        ))}
                    </select>
                </div>

                {/* HTNO (Auto-filled) */}
                <div>
                    <label>HTNO:</label>
                    <input
                        type="text"
                        name="htno"
                        value={formData.htno}
                        readOnly
                    />
                </div>

                {/* Semester */}
                <div>
                    <label>Semester:</label>
                    <select
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                    </select>
                </div>

                {/* Email */}
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                    />
                </div>

                {/* Phone Number */}
                <div>
                    <label>Phone Number:</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        pattern="[6-9]\d{9}"
                        placeholder="Enter 10-digit phone number"
                    />
                </div>

                {/* Python Rating */}
                <div>
                    <label>Python Rating (1-10):</label>
                    <input
                        type="number"
                        name="pythonRating"
                        min="1"
                        max="10"
                        value={formData.pythonRating}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* AI/ML Rating */}
                <div>
                    <label>AI and ML Rating (1-10):</label>
                    <input
                        type="number"
                        name="aiMlRating"
                        min="1"
                        max="10"
                        value={formData.aiMlRating}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Submit Button */}
                <div>
                    <button type="submit">Register</button>
                </div>
            </form>
        </div>
    );
}

export default StudentRegistrationForm;