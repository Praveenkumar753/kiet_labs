// frontend/FormResponses.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './formresponse.css';
import * as XLSX from 'xlsx';

const FormResponses = () => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ college: '', year: '', department: '', type: '' });
    const [editingRow, setEditingRow] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const res = await axios.get('https://kiet-labs-backend.onrender.com/api/formresponses');
                setResponses(res.data);
            } catch (err) {
                setError('Failed to fetch responses');
            } finally {
                setLoading(false);
            }
        };
        fetchResponses();
    }, []);

    const handleDownloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const excelData = filteredResponses.map(response => ({
            College: response.college,
            Year: response.YEAR,
            Department: response.department,
            Type: response.type,
            Name: response.name,
            HTNO: response.htno,
            Semester: response.semester,
            Email: response.email,
            Phone: response.phoneNumber,
            'Selected Lab': response.selectedLab,
            'Python Rating': response.pythonRating,
            'AI/ML Rating': response.aiMlRating
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Responses');
        XLSX.writeFile(workbook, 'form_responses.xlsx');
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setCurrentPage(0);
    };

    const filteredResponses = responses.filter(response =>
        (!filters.college || response.college === filters.college) &&
        (!filters.year || response.YEAR.toString() === filters.year) &&
        (!filters.department || response.department === filters.department) &&
        (!filters.type || response.type === filters.type)
    );

    const handleEdit = (id, field, newValue) => {
        setEditValues({ ...editValues, [`${id}-${field}`]: newValue });
    };

    const handleSaveEdit = async (id) => {
        try {
            const relevantEdits = Object.entries(editValues).filter(([key]) => key.startsWith(`${id}-`));
            for (const [key, value] of relevantEdits) {
                const [rowId, field] = key.split('-');
                await axios.put(`https://kiet-labs-backend.onrender.com/api/formresponses/${rowId}/${field}`, { newValue: value });
            }
            const updatedResponses = responses.map(res => {
                const updatedRes = { ...res };
                relevantEdits.forEach(([key, value]) => {
                    const [rowId, field] = key.split('-');
                    if (rowId === res._id.toString()) {
                        updatedRes[field] = value;
                    }
                });
                return updatedRes;
            });
            setResponses(updatedResponses);
            setEditingRow(null);
            setEditValues({});
        } catch (error) {
            console.error("Edit failed:", error);
            alert(`Edit failed: ${error.message || 'Unknown error'}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this response?')) {
            try {
                await axios.delete(`https://kiet-labs-backend.onrender.com/api/formresponses/${id}`);
                setResponses(responses.filter(res => res._id !== id));
            } catch (err) {
                console.error("Delete failed:", err);
                alert('Delete failed!');
            }
        }
    };

    const handleEditRow = (id) => {
        setEditingRow(id === editingRow ? null : id);
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10) || 10);
        setCurrentPage(0);
    };

    const handleNextPage = () => {
        setCurrentPage(Math.min(currentPage + 1, Math.ceil(filteredResponses.length / rowsPerPage) - 1));
    };

    const handlePrevPage = () => {
        setCurrentPage(Math.max(currentPage - 1, 0));
    };

    const startIndex = currentPage * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedResponses = filteredResponses.slice(startIndex, endIndex);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div>
            <h1>Form Responses</h1>
            <div className="filter-section">

                <div key="college">
                    <label htmlFor="college">College:</label>
                    <select
                        id="college"
                        name="college"
                        value={filters.college}
                        onChange={handleFilterChange}
                    >
                        <option value="">All</option>
                        {Array.from(new Set(responses.map(res => res.college))).map((item, index) => (
                            <option key={index} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
                <div key="year">
                    <label htmlFor="year">Year:</label>
                    <select
                        id="year"
                        name="year"
                        value={filters.year}
                        onChange={handleFilterChange}
                    >
                        <option value="">All</option>
                        {Array.from(new Set(responses.map(res => res.YEAR.toString()))).map((item, index) => (
                            <option key={index} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
                <div key="department">
                    <label htmlFor="department">Department:</label>
                    <select
                        id="department"
                        name="department"
                        value={filters.department}
                        onChange={handleFilterChange}
                    >
                        <option value="">All</option>
                        {Array.from(new Set(responses.map(res => res.department))).map((item, index) => (
                            <option key={index} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
                <div key="type">
                    <label htmlFor="type">Type:</label>
                    <select
                        id="type"
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                    >
                        <option value="">All</option>
                        {Array.from(new Set(responses.map(res => res.type))).map((item, index) => (
                            <option key={index} value={item}>{item}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Rows per page:</label>
                    <input type="number" min="1" value={rowsPerPage} onChange={handleRowsPerPageChange} />
                </div>
                <button onClick={handleDownloadExcel} className="download-button">Download Excel</button>
            </div>

            <div className="table-container">
                <table className="responses-table">
                    <thead>
                        <tr>
                            <th>College</th>
                            <th>Year</th>
                            <th>Department</th>
                            <th>Type</th>
                            <th>Name</th>
                            <th>HTNO</th>
                            <th>Semester</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Selected Lab</th>
                            <th>Python Rating</th>
                            <th>AI/ML Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedResponses.map(response => (
                            <tr key={response._id}>
                                {['college', 'YEAR', 'department', 'type', 'name', 'htno', 'semester', 'email', 'phoneNumber', 'selectedLab', 'pythonRating', 'aiMlRating'].map(field => (
                                    <td key={field}>
                                        {editingRow === response._id ? (
                                            <input
                                                type={field === 'email' ? 'email' : (field === 'phoneNumber' || field === 'htno' ? 'tel' : (field === 'pythonRating' || field === 'aiMlRating' || field === 'YEAR' ? 'number' : 'text'))}
                                                value={editValues[`${response._id}-${field}`] || response[field]}
                                                onChange={e => handleEdit(response._id, field, e.target.value)}
                                                min={field === 'pythonRating' || field === 'aiMlRating' || field === "YEAR"? 1 : null}
                                                max={field === 'pythonRating' || field === 'aiMlRating' ? 10 : null}

                                            />
                                        ) : (
                                            response[field]
                                        )}
                                    </td>
                                ))}
                                <td>
                                    <button onClick={() => handleDelete(response._id)}>Delete</button>
                                    {editingRow === response._id ? (
                                        <button onClick={() => handleSaveEdit(response._id)}>Save</button>
                                    ) : (
                                        <button onClick={() => handleEditRow(response._id)}>Edit</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination">
                <button onClick={handlePrevPage} disabled={currentPage === 0}>Previous</button>
                <button onClick={handleNextPage} disabled={currentPage >= Math.ceil(filteredResponses.length / rowsPerPage) - 1}>Next</button>
            </div>
        </div>
    );
};


export default FormResponses;
