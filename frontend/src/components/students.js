import React, { useState, useEffect } from 'react';
import axios from 'axios';
const BASE_URL = 'http://localhost:5000';
const StudentSummary = () => {
    const [summaryData, setSummaryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Colleges to include in the summary
    const targetColleges = ['KIET', 'KIET+'];

    const fetchAndProcessData = async () => {
        try {
            // Fetch all data
            const response = await axios.get(`${BASE_URL}/api/datas`);
            
            // Filter for target colleges
            const filteredData = response.data.filter(student => 
                targetColleges.includes(student.COL)
            );

            // Group and count students
            const summary = [];
            
            // Get unique combinations of DEPT and TYPE
            const uniqueCombinations = [
                ...new Set(filteredData.map(student => `${student.DEPT}-${student.TYPE}`))
            ];

            // Process each unique combination
            uniqueCombinations.forEach(combination => {
                const [dept, type] = combination.split('-');
                
                const count = filteredData.filter(
                    student => student.DEPT === dept && student.TYPE === type
                ).length;

                summary.push({
                    DEPT: dept,
                    TYPE: type,
                    COUNT: count
                });
            });

            // Sort summary for better readability
            summary.sort((a, b) => b.COUNT - a.COUNT);

            setSummaryData(summary);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch student data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAndProcessData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Student Department and Type Summary</h1>
            <h2 className="text-lg mb-2">Colleges: {targetColleges.join(', ')}</h2>
            
            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Department</th>
                        <th className="border p-2">Type</th>
                        <th className="border p-2">Student Count</th>
                    </tr>
                </thead>
                <tbody>
                    {summaryData.map((item, index) => (
                        <tr 
                            key={index} 
                            className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}
                        >
                            <td className="border p-2 text-center">{item.DEPT}</td>
                            <td className="border p-2 text-center">{item.TYPE}</td>
                            <td className="border p-2 text-center font-bold">{item.COUNT}</td>
                        </tr>
                    ))}
                    {summaryData.length === 0 && (
                        <tr>
                            <td colSpan="3" className="text-center p-4">
                                No student data found
                            </td>
                        </tr>
                    )}
                    <tr className="bg-gray-200 font-bold">
                        <td colSpan="2" className="border p-2 text-right">Total Students:</td>
                        <td className="border p-2 text-center">
                            {summaryData.reduce((sum, item) => sum + item.COUNT, 0)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default StudentSummary;