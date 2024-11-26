// frontend/stats.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './stats.css';

const LabAvailability = () => {
    const [colleges, setColleges] = useState([]);
    const [labAvailability, setLabAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://kiet-labs-1.onrender.com';

    const getAvailableLabs = (department) => {
        return department === 'CSC' ? ['Cyber'] : ['Robotics', 'NLP', 'CV'];
    };

    const fetchColleges = async () => {
        try {
            const response = await axios.get(`${backendURL}/api/registration/colleges`);
            setColleges(response.data);
        } catch (error) {
            console.error('Error fetching colleges:', error);
            setError('Failed to fetch college names.');
        }
    };

    const fetchLabAvailability = async () => {
        if (colleges.length === 0) return;
        setLoading(true);
        try {
            const registrationResponse = await axios.get(`${backendURL}/api/registration/all`);
            const originalDataResponse = await axios.get(`${backendURL}/api/datas`);
            const availability = [];

            for (const college of colleges) {
                const validColleges = college === 'KIET' || college === 'KIET+' ? ['KIET', 'KIET+'] : [college];
                const collegeYearsResponse = await axios.get(`${backendURL}/api/registration/years`, { params: { college } });
                const collegeYears = collegeYearsResponse.data;
                for (const year of collegeYears) {
                    const filteredOriginalData = originalDataResponse.data.filter(student => validColleges.includes(student.COL) && student.YEAR.toString() === year.toString());
                    const departmentsResponse = await axios.get(`${backendURL}/api/registration/departments`, { params: { college, year } });
                    const departments = departmentsResponse.data;
                    for (const department of departments) {
                        const typesResponse = await axios.get(`${backendURL}/api/registration/types`, { params: { college, year, department } });
                        const types = typesResponse.data;
                        for (const type of types) {
                            const totalStudents = filteredOriginalData.filter(student => student.DEPT === department && student.TYPE === type).length;
                            const availableLabs = getAvailableLabs(department);
                            const labCapacity = Math.ceil(totalStudents / availableLabs.length);
                            availableLabs.forEach(lab => {
                                const labApplicants = registrationResponse.data.filter(reg => validColleges.includes(reg.college) && reg.department === department && reg.type === type && reg.selectedLab === lab && reg.YEAR.toString() === year.toString());
                                availability.push({ college, year, department, type, lab, totalStudents, totalAvailable: labCapacity, applicants: labApplicants.length, vacant: Math.max(0, labCapacity - labApplicants.length) });
                            });
                        }
                    }
                }
            }
            availability.sort((a, b) => a.college.localeCompare(b.college) || a.year - b.year || a.department.localeCompare(b.department) || a.type.localeCompare(b.type) || a.lab.localeCompare(b.lab));
            setLabAvailability(availability);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching lab availability:', error);
            setError('Failed to fetch lab availability.');
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchColleges();
        };
        fetchData();
    }, [backendURL]);

    useEffect(() => {
        fetchLabAvailability();
    }, [colleges, backendURL]);

    const handleCollegeChange = (e) => {
        setSelectedCollege(e.target.value);
        setSelectedYear('');
        setSelectedDepartment('');
        setSelectedType('');
    };

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
        setSelectedDepartment('');
        setSelectedType('');
    };

    const filteredData = labAvailability.filter(item => item.college === selectedCollege && item.year.toString() === selectedYear && item.department === selectedDepartment && item.type === selectedType);
    const availableYears = [...new Set(labAvailability.filter(item => item.college === selectedCollege).map(item => item.year.toString()))];
    const availableDepartments = [...new Set(labAvailability.filter(item => item.college === selectedCollege && item.year.toString() === selectedYear).map(item => item.department))];
    const availableTypes = [...new Set(labAvailability.filter(item => item.college === selectedCollege && item.year.toString() === selectedYear && item.department === selectedDepartment).map(item => item.type))];

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="stats-container">
            <div className="stats-content">
                <h1 className="stats-title">KIET Group of Institutes Lab Availability</h1>
                <p className="stats-intro">The KIET Group of Institutes offers specialized laboratories. These labs, equipped with state-of-the-art technology, provide students with hands-on experience. The available labs include Computer Vision (CV), Natural Language Processing (NLP), Robotics, and Cyber Security. This dashboard helps monitor lab usage, capacity, and availability.</p>
                <h2 className="availability-prompt">Check Your Availability</h2>
                <div className="stats-filters">
                    <select className="stats-select" value={selectedCollege} onChange={handleCollegeChange}>
                        <option value="">Select College</option>
                        {[...new Set(labAvailability.map(item => item.college))].map(college => (<option key={college} value={college}>{college}</option>))}
                    </select>
                    <select className="stats-select" value={selectedYear} onChange={handleYearChange} disabled={!selectedCollege}>
                        <option value="">Select Year</option>
                        {availableYears.map(year => (<option key={year} value={year}>{year}</option>))}
                    </select>
                    <select className="stats-select" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} disabled={!selectedYear}>
                        <option value="">Select Department</option>
                        {availableDepartments.map(dept => (<option key={dept} value={dept}>{dept}</option>))}
                    </select>
                    <select className="stats-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)} disabled={!selectedDepartment}>
                        <option value="">Select Type</option>
                        {availableTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                    </select>
                </div>
                {selectedCollege && selectedYear && selectedDepartment && selectedType && (
                    <div className="stats-table-container">
                        <table className="stats-lab-availability-table">
                            <thead>
                                <tr>
                                    <th>College</th>
                                    <th>Year</th>
                                    <th>Department</th>
                                    <th>Type</th>
                                    <th>Lab</th>
                                    <th>Total Students</th>
                                    <th>Lab Capacity</th>
                                    <th>Applicants</th>
                                    <th>Vacant Seats</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, index) => (
                                    <tr key={index} className={item.vacant === 0 ? 'full' : item.vacant < 5 ? 'low' : 'available'}>
                                        <td>{item.college}</td>
                                        <td>{item.year}</td>
                                        <td>{item.department}</td>
                                        <td>{item.type}</td>
                                        <td>{item.lab}</td>
                                        <td>{item.totalStudents}</td>
                                        <td>{item.totalAvailable}</td>
                                        <td>{item.applicants}</td>
                                        <td>{item.vacant}</td>
                                        <td>{item.vacant === 0 ? 'Full' : item.vacant < 5 ? 'Filling Up' : 'Available'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {selectedCollege && selectedYear && selectedDepartment && selectedType && (<Link to="/register"><button className="stats-apply-button">Apply</button></Link>)}
            </div>
            <footer className="stats-footer"><p>© 2024 KIET Group of Institutes. All rights reserved. Developed by MANACLG.</p></footer>
        </div>
    );
};

export default LabAvailability;
