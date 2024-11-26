// form2.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './form.css';
const BASE_URL = 'http://localhost:5000';
function StudentRegistrationForm() {
    const [formData, setFormData] = useState({
        college: '',
        year: '',
        department: '',
        type: '',
        name: '',
        htno: '',
        semester: '',
        email: '',
        phoneNumber: '',
        selectedLab: '',
        pythonRating: 1,
        aiMlRating: 1,
    });
    const [colleges, setColleges] = useState([]);
    const [years, setYears] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [types, setTypes] = useState([]);
    const [names, setNames] = useState([]);
    const [studentData, setStudentData] = useState([]);
    const [availableLabs, setAvailableLabs] = useState([]);
    const [labAvailability, setLabAvailability] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchColleges = async () => { try { const response = await axios.get(`${BASE_URL}/api/registration/colleges`);  setColleges(response.data); } catch (error) { setError('Failed to fetch colleges'); } }; fetchColleges();
    }, []);

    useEffect(() => {
        const fetchYears = async () => { if (!formData.college) return; try { const response = await axios.get(`${BASE_URL}/api/registration/years`, { params: { college: formData.college } }); setYears(response.data); resetFormFields(['year', 'department', 'type', 'name', 'htno', 'selectedLab']); } catch (error) { setError('Failed to fetch years'); } }; fetchYears();
    }, [formData.college]);

    useEffect(() => {
        const fetchDepartments = async () => { if (!formData.college || !formData.year) return; try { const response = await axios.get(`${BASE_URL}/api/registration/departments`, { params: { college: formData.college, year: formData.year } }); setDepartments(response.data); resetFormFields(['department', 'type', 'name', 'htno', 'selectedLab']); } catch (error) { setError('Failed to fetch departments'); } }; fetchDepartments();
    }, [formData.college, formData.year]);

    useEffect(() => {
        const fetchTypes = async () => { if (!formData.college || !formData.year || !formData.department) return; try { const response = await axios.get(`${BASE_URL}/api/registration/types`, { params: { college: formData.college, year: formData.year, department: formData.department } }); setTypes(response.data); resetFormFields(['type', 'name', 'htno', 'selectedLab']); } catch (error) { setError('Failed to fetch types'); } }; fetchTypes();
    }, [formData.college, formData.year, formData.department]);

    useEffect(() => {
        const fetchNames = async () => { if (!formData.college || !formData.department || !formData.type || !formData.year) return; try { const response = await axios.get(`${BASE_URL}/api/registration/names`, { params: { college: formData.college, department: formData.department, type: formData.type, year: formData.year } }); setNames(response.data); setStudentData(response.data); } catch (error) { setError('Failed to fetch names'); } }; fetchNames();
    }, [formData.college, formData.department, formData.type, formData.year]);

    useEffect(() => {
        const fetchLabAvailability = async () => {
            if (!formData.college || !formData.year || !formData.department || !formData.type) return;
            setLoading(true);
            try {
                const registrationResponse = await axios.get(`${BASE_URL}/api/registration/all`);
                const originalDataResponse = await axios.get(`${BASE_URL}/api/datas`);
                const validColleges = formData.college === 'KIET' || formData.college === 'KIET+' ? ['KIET', 'KIET+'] : [formData.college];
                const filteredOriginalData = originalDataResponse.data.filter(student => validColleges.includes(student.COL) && student.YEAR.toString() === formData.year);
                const totalStudents = filteredOriginalData.filter(student => student.DEPT === formData.department && student.TYPE === formData.type).length;
                const labs = formData.department === 'CSC' ? ['Cyber'] : ['Robotics', 'NLP', 'CV'];
                const labCapacity = Math.ceil(totalStudents / labs.length);
                const availability = labs.map(lab => {
                    const labApplicants = registrationResponse.data.filter(reg => validColleges.includes(reg.college) && reg.department === formData.department && reg.type === formData.type && reg.selectedLab === lab && reg.YEAR.toString() === formData.year);
                    return { lab, totalStudents, totalAvailable: labCapacity, applicants: labApplicants.length, vacant: Math.max(0, labCapacity - labApplicants.length) };
                });
                setLabAvailability(availability); setAvailableLabs(labs);
            } catch (error) { setError('Failed to fetch lab availability'); } finally { setLoading(false); }
        }; fetchLabAvailability();
    }, [formData.college, formData.year, formData.department, formData.type]);

    const resetFormFields = fields => { const resetData = {}; fields.forEach(field => { resetData[field] = ''; }); setFormData(prev => ({ ...prev, ...resetData })); };
    const handleChange = e => { const { name, value } = e.target; if (name === 'name') { const student = studentData.find(s => s.NAME === value); setFormData(prev => ({ ...prev, [name]: value, htno: student ? student.HTNO : '' })); } else { setFormData(prev => ({ ...prev, [name]: value })); } };

    const handleSubmit = async e => {
        e.preventDefault();
        const phoneRegex = /^[6-9]\d{9}$/; if (!phoneRegex.test(formData.phoneNumber)) { alert('Please enter a valid 10-digit phone number starting with 6-9'); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (!emailRegex.test(formData.email)) { alert('Please enter a valid email address'); return; }
        if (formData.selectedLab === '') { alert('Please select a lab.'); return; }
        const labIsFull = labAvailability.find(item => item.lab === formData.selectedLab && item.vacant === 0); if (labIsFull) { alert('This lab is full. Please select another lab.'); return; }
        try {
            const response = await axios.post(`${BASE_URL}/api/registration/register`, formData);
            if (response.status === 201) {
                alert('Registration successful!'); setFormData({ college: '', year: '', department: '', type: '', name: '', htno: '', semester: '', email: '', phoneNumber: '', selectedLab: '', pythonRating: 1, aiMlRating: 1 });
                setDepartments([]); setTypes([]); setNames([]); setAvailableLabs([]); setLabAvailability([]);
            } else { alert(`Registration failed: ${response.data.message || "Unknown Error"}`); }
        } catch (error) { console.error("Registration Error: ", error); alert('Registration failed: ' + (error.response?.data?.message || error.message || 'An unknown error occurred.')); }
    };

    return (
        <div className="page-container">
            <div className="form-wrapper">
                <div className="form-section">
                    <h2>Student Registration Form</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group"><label htmlFor="college">College:</label><select id="college" name="college" value={formData.college} onChange={handleChange} required><option value="">Select College</option><option value="KIET">KIET</option><option value="KIET+">KIET+</option>{colleges.filter(college => !['KIET', 'KIET+'].includes(college)).map((college, index) => (<option key={index} value={college}>{college}</option>))}</select></div>
                        <div className="form-group"><label htmlFor="year">Year:</label><select id="year" name="year" value={formData.year} onChange={handleChange} required disabled={!formData.college}><option value="">Select Year</option>{years.map((year, index) => (<option key={index} value={year}>{year}</option>))}</select></div>
                        <div className="form-group"><label htmlFor="department">Department:</label><select id="department" name="department" value={formData.department} onChange={handleChange} required disabled={!formData.year || !formData.college}><option value="">Select Department</option>{departments.map((dept, index) => (<option key={index} value={dept}>{dept}</option>))}</select></div>
                        <div className="form-group"><label htmlFor="type">Type:</label><select id="type" name="type" value={formData.type} onChange={handleChange} required disabled={!formData.department}><option value="">Select Type</option>{types.map((type, index) => (<option key={index} value={type}>{type}</option>))}</select></div>
                        <div className="form-group"><label htmlFor="name">Name:</label><select id="name" name="name" value={formData.name} onChange={handleChange} required disabled={!formData.type}><option value="">Select Name</option>{names.map((student, index) => (<option key={index} value={student.NAME}>{student.NAME}</option>))}</select></div>
                        <div className="form-group"><label htmlFor="htno">HTNO:</label><input type="text" id="htno" name="htno" value={formData.htno} readOnly className="readonly" /></div>
                        <div className="form-group"><label htmlFor="semester">Semester:</label><select id="semester" name="semester" value={formData.semester} onChange={handleChange} required><option value="">Select Semester</option><option value="1">Semester 1</option><option value="2">Semester 2</option></select></div>
                        <div className="form-group"><label htmlFor="email">Email:</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required /></div>
                        <div className="form-group"><label htmlFor="phoneNumber">Phone Number:</label><input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required pattern="[6-9]\d{9}" /></div>
                        <div className="form-group"><label htmlFor="selectedLab">Select Lab:</label><select id="selectedLab" name="selectedLab" value={formData.selectedLab} onChange={handleChange} required disabled={!formData.type || labAvailability.length === 0}><option value="">Select Lab</option>{availableLabs.map((lab, index) => { const labStatus = labAvailability.find(item => item.lab === lab); const isDisabled = labStatus && labStatus.vacant === 0; return (<option key={index} value={lab} disabled={isDisabled}>{lab} {isDisabled ? '(Full)' : labStatus ? `(${labStatus.vacant} seats left)` : ''}</option>); })}</select></div>
                        <div className="form-group"><label htmlFor="pythonRating">Python Rating (1-10):</label><input type="number" id="pythonRating" name="pythonRating" min="1" max="10" value={formData.pythonRating} onChange={handleChange} required /></div>
                        <div className="form-group"><label htmlFor="aiMlRating">AI and ML Rating (1-10):</label><input type="number" id="aiMlRating" name="aiMlRating" min="1" max="10" value={formData.aiMlRating} onChange={handleChange} required /></div>
                        <div className="form-group"><button type="submit" className="submit-button" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button></div>
                    </form>
                </div>

                <div className="availability-section">
                    <h3>Lab Availability</h3>
                    {loading ? (<div className="loading-indicator"></div>) :
                        (labAvailability.length > 0 ? (<table><thead><tr><th>Lab</th><th>Capacity</th><th>Applicants</th><th>Vacant</th></tr></thead><tbody>{labAvailability.map(lab => (<tr key={lab.lab}><td>{lab.lab}</td><td>{lab.totalAvailable}</td><td>{lab.applicants}</td><td>{lab.vacant}</td></tr>))}</tbody></table>) : (<p>Select college, year, department, and type to see availability.</p>))}
                </div>
            </div>
        </div>
    );
}


export default StudentRegistrationForm;