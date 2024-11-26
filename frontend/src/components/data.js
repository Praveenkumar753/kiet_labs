import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './data.css';

const ShowStudents = () => {
    const [students, setStudents] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [promotionYear, setPromotionYear] = useState('');
    const [demotionYear, setDemotionYear] = useState('');
    const [deleteYear, setDeleteYear] = useState('');
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [showDemoteModal, setShowDemoteModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [message, setMessage] = useState('');
    const [editFormData, setEditFormData] = useState({ NAME: '', COL: '', DEPT: '', YEAR: '', HTNO: '', TYPE: '' });
    const [filters, setFilters] = useState({ COL: '', YEAR: '', DEPT: '', TYPE: '' });
    const [uniqueFilterOptions, setUniqueFilterOptions] = useState({ COL: [], YEAR: [], DEPT: [], TYPE: [] });

    const backendURL = 'http://localhost:5000';

    const fetchStudents = async () => {
        try {
            const response = await axios.get(`${backendURL}/api/student/all`);
            setStudents(response.data);
            const uniqueCols = [...new Set(response.data.map(item => item.COL))];
            const uniqueYears = [...new Set(response.data.map(item => item.YEAR))];
            const uniqueDepts = [...new Set(response.data.map(item => item.DEPT))];
            const uniqueTypes = [...new Set(response.data.map(item => item.TYPE))];
            setUniqueFilterOptions({ COL: uniqueCols, YEAR: uniqueYears, DEPT: uniqueDepts, TYPE: uniqueTypes });
        } catch (error) {
            setMessage('Failed to fetch students');
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const filteredStudents = students.filter(student =>
        (filters.COL === '' || student.COL === filters.COL) &&
        (filters.YEAR === '' || student.YEAR === parseInt(filters.YEAR)) &&
        (filters.DEPT === '' || student.DEPT === filters.DEPT) &&
        (filters.TYPE === '' || student.TYPE === filters.TYPE)
    );

    const handlePromote = async (e) => {
        e.preventDefault();
        if (!promotionYear) return;
        try {
            await axios.put(`${backendURL}/api/student/promote`, { year: parseInt(promotionYear) });
            setMessage('Students promoted successfully!');
            setShowPromoteModal(false);
            setPromotionYear('');
            fetchStudents();
        } catch (error) {
            setMessage('Failed to promote students');
        }
    };

    const handleDemote = async (e) => {
        e.preventDefault();
        if (!demotionYear) return;
        try {
            await axios.put(`${backendURL}/api/student/demote`, { year: parseInt(demotionYear) });
            setMessage('Students demoted successfully!');
            setShowDemoteModal(false);
            setDemotionYear('');
            fetchStudents();
        } catch (error) {
            setMessage('Failed to demote students');
        }
    };

    const handleDeleteByYear = async (e) => {
        e.preventDefault();
        if (!deleteYear) return;
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${backendURL}/api/student/deleteByYear/${deleteYear}`);
            setMessage('Students deleted successfully!');
            setShowDeleteModal(false);
            setDeleteYear('');
            fetchStudents();
        } catch (error) {
            setMessage('Failed to delete students');
        }
    };

    const handleEdit = (student) => {
        setEditingId(student._id);
        setEditFormData({
            NAME: student.NAME,
            COL: student.COL,
            DEPT: student.DEPT,
            YEAR: student.YEAR,
            HTNO: student.HTNO,
            TYPE: student.TYPE
        });
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (id) => {
        try {
            await axios.put(`${backendURL}/api/student/update/${id}`, editFormData);
            setEditingId(null);
            fetchStudents();
            setMessage('Student updated successfully!');
        } catch (error) {
            setMessage('Failed to update student');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`${backendURL}/api/student/delete/${id}`);
                fetchStudents();
                setMessage('Student deleted successfully!');
            } catch (error) {
                setMessage('Failed to delete student');
            }
        }
    };

    return (
        <div className="container">
            <div className="button-group">
                <button onClick={() => setShowPromoteModal(true)}>Promote Students</button>
                <button onClick={() => setShowDemoteModal(true)}>Demote Students</button>
                <button onClick={() => setShowDeleteModal(true)}>Delete by Year</button>
            </div>

            {showPromoteModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Promote Students</h2>
                        <form onSubmit={handlePromote}>
                            <input type="number" placeholder="Enter year to promote" value={promotionYear} onChange={(e) => setPromotionYear(e.target.value)} />
                            <div className="modal-buttons">
                                <button type="submit">Promote</button>
                                <button type="button" onClick={() => setShowPromoteModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDemoteModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Demote Students</h2>
                        <form onSubmit={handleDemote}>
                            <input type="number" placeholder="Enter year to demote" value={demotionYear} onChange={(e) => setDemotionYear(e.target.value)} />
                            <div className="modal-buttons">
                                <button type="submit">Demote</button>
                                <button type="button" onClick={() => setShowDemoteModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Delete Students by Year</h2>
                        <form onSubmit={handleDeleteByYear}>
                            <input type="number" placeholder="Enter year to delete" value={deleteYear} onChange={(e) => setDeleteYear(e.target.value)} />
                            <div className="modal-buttons">
                                <button type="submit">Delete</button>
                                <button type="button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {message && <div className="message">{message}</div>}

            <div className="filters">
                <div>
                    <label htmlFor="colFilter">College:</label>
                    <select id="colFilter" name="COL" value={filters.COL} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {uniqueFilterOptions.COL.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="yearFilter">Year:</label>
                    <select id="yearFilter" name="YEAR" value={filters.YEAR} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {uniqueFilterOptions.YEAR.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="deptFilter">Department:</label>
                    <select id="deptFilter" name="DEPT" value={filters.DEPT} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {uniqueFilterOptions.DEPT.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="typeFilter">Type:</label>
                    <select id="typeFilter" name="TYPE" value={filters.TYPE} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {uniqueFilterOptions.TYPE.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
            </div>

            <div className="show-students-container">
                <h2>Student List</h2>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>College</th>
                                <th>Department</th>
                                <th>Year</th>
                                <th>Hall Ticket No</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student._id}>
                                    {editingId === student._id ? (
                                        <>
                                            <td><input type="text" name="NAME" value={editFormData.NAME} onChange={handleEditChange} /></td>
                                            <td><input type="text" name="COL" value={editFormData.COL} onChange={handleEditChange} /></td>
                                            <td><input type="text" name="DEPT" value={editFormData.DEPT} onChange={handleEditChange} /></td>
                                            <td><input type="number" name="YEAR" value={editFormData.YEAR} onChange={handleEditChange} /></td>
                                            <td><input type="text" name="HTNO" value={editFormData.HTNO} onChange={handleEditChange} /></td>
                                            <td><input type="text" name="TYPE" value={editFormData.TYPE} onChange={handleEditChange} /></td>
                                            <td>
                                                <button onClick={() => handleUpdate(student._id)}>Save</button>
                                                <button onClick={() => setEditingId(null)}>Cancel</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{student.NAME}</td>
                                            <td>{student.COL}</td>
                                            <td>{student.DEPT}</td>
                                            <td>{student.YEAR}</td>
                                            <td>{student.HTNO}</td>
                                            <td>{student.TYPE}</td>
                                            <td>
                                                <button onClick={() => handleEdit(student)}>Edit</button>
                                                <button onClick={() => handleDelete(student._id)}>Delete</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ShowStudents;