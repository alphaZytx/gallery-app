// client/src/components/UploadMediaModal.js
import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../api/axios'; // Ensure this path is correct
import { FaTimes } from 'react-icons/fa'; // Import the close icon

// Styled component for the modal overlay
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7); /* Semi-transparent black background */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000; /* Ensure modal is on top of other content */
`;

// Styled component for the modal content area
const ModalContent = styled.div`
    background: ${(props) => props.theme.cardBackground}; /* Background from theme */
    padding: 30px;
    border-radius: 10px;
    position: relative;
    max-width: 500px;
    width: 90%;
    box-shadow: ${(props) => props.theme.boxShadow}; /* Shadow from theme */
    color: ${(props) => props.theme.text}; /* Text color from theme */

    h2 {
        margin-bottom: 20px;
        text-align: center;
        color: ${(props) => props.theme.primary}; /* Primary color from theme */
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 15px;

        label {
            font-weight: bold;
            margin-bottom: 5px;
            display: block;
        }

        input[type='text'],
        textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid ${(props) => props.theme.border}; /* Border from theme */
            border-radius: 5px;
            background-color: ${(props) => props.theme.background}; /* Background from theme */
            color: ${(props) => props.theme.text}; /* Text color from theme */
            font-size: 1rem;
        }

        input[type='file'] {
            padding: 5px;
            border: 1px dashed ${(props) => props.theme.border}; /* Dashed border from theme */
            border-radius: 5px;
            background-color: ${(props) => props.theme.background}; /* Background from theme */
            color: ${(props) => props.theme.text}; /* Text color from theme */
        }

        button {
            background-color: ${(props) => props.theme.primary}; /* Primary color from theme */
            color: white;
            padding: 12px;
            border-radius: 5px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: background-color 0.3s ease;

            &:hover {
                background-color: #0056b3; /* Darken primary color on hover */
            }
            &:disabled {
                background-color: ${(props) => props.theme.secondary}; /* Secondary color from theme when disabled */
                cursor: not-allowed;
                opacity: 0.7;
            }
        }

        .error-message {
            color: red; /* Red color for error messages */
            font-size: 0.9rem;
            text-align: center;
        }
    }

    .close-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 1.8rem;
        color: ${(props) => props.theme.text}; /* Text color from theme */
        cursor: pointer;
        &:hover {
            color: ${(props) => props.theme.primary}; /* Primary color from theme on hover */
        }
    }
`;

const UploadMediaModal = ({ onClose, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!file) {
            setError('Please select a file to upload.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('media', file); // 'media' must match multer().single('media') on backend
        formData.append('name', name);
        formData.append('tags', tags);

        try {
            // The Axios instance 'api' should have the interceptor for the auth token.
            // It will POST to process.env.REACT_APP_API_BASE_URL + '/admin/upload'
            const response = await api.post('/admin/upload', formData);
            // Note: Axios automatically sets Content-Type to multipart/form-data for FormData

            alert('File uploaded to server successfully!'); // Updated message
            if (onUploadSuccess) {
                onUploadSuccess(response.data.media); // Pass the returned media item
            }
            onClose();
        } catch (err) {
            console.error('Upload error:', err.response ? err.response.data : err.message);
            setError('Failed to upload file: ' + (err.response?.data?.msg || err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // ... (return JSX with form elements - ensure input file, name, tags) ...
    // The form should be the same as the one you had for server-side uploads.
    return (
        <ModalOverlay>
            <ModalContent>
                <button className="close-btn" onClick={onClose}><FaTimes /></button>
                <h2>Upload New Media (To Server)</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
                    <div>
                        <label htmlFor="file">Select File:</label>
                        <input
                            type="file"
                            id="file"
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="name">Media Name (optional):</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="e.g., Beautiful Sunset"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="tags">Tags (comma-separated, optional):</label>
                        <input
                            type="text"
                            id="tags"
                            placeholder="e.g., nature, landscape, travel"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" disabled={loading || !file}>
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
};

export default UploadMediaModal;