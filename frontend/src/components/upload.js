import React, { useState } from 'react';
import axios from 'axios';
const BASE_URL = 'https://kiet-labs-1.onrender.com';
const UploadFile = () => {
    const [file, setFile] = useState(null);

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        console.log('Selected File:', selectedFile); // Log the file details for debugging
        setFile(selectedFile);
    };

    // Handle file upload submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${BASE_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert(response.data.message);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    return (
        <div>
            <h1>Upload your excel file and make sure it has only one sheet if not it only consider the first sheet</h1>
            <h2>Make sure collumn name same as below format and order so that we can send data to database</h2>
            <h4>COL	,YEAR,	DEPT,	TYPE,	HTNO	,NAME
            </h4>
            <form onSubmit={handleSubmit}>
                {/* Input to accept any file */}
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default UploadFile;
