import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Switch from 'react-switch';
import { FileUploader } from 'react-drag-drop-files';
import { BiShow } from 'react-icons/bi';
import { TbReload } from 'react-icons/tb';
import { BsStopCircle } from 'react-icons/bs';
import './App.css';
import './ViewSubmission.css';
import Header from './Header';
import UserInfo from './UserInfo';

const ViewSubmission = () => {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [metadata, setMetadata] = useState([]);
    const [originalMetadata, setOriginalMetadata] = useState([]);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [file, setFile] = useState(null);
    const [userInfoKey, setUserInfoKey] = useState(0);
    const navigate = useNavigate();

    const fetchSubmission = async () => {
        try {
            const response = await axios.get(`http://localhost:5500/getsubmission?submissionID=${id}`);
            if (response.data.success === false) {
                setError(true);
            } else {
                setSubmission(response.data);
                const metadataArray = Object.entries(response.data.metadata).map(([key, value]) => ({
                    id: key,
                    title: key,
                    unit: '',
                    value: value,
                }));
                setMetadata(metadataArray);
                setOriginalMetadata(metadataArray);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching submission details:', error);
            setError(true);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmission();
    }, [id]);

    const handleMetadataChange = (id, value) => {
        setMetadata((prevMetadata) =>
            prevMetadata.map((item) =>
                item.id === id ? { ...item, value: parseInt(value, 10) || '' } : item
            )
        );
    };

    const handleFileChange = (file) => {
        setFile(file);
    };

    const handleConfirmEdit = async () => {
        if (submission.status !== 'Balance Insufficient' && JSON.stringify(metadata) === JSON.stringify(originalMetadata) && !file) {
            toast.info('Values not changed.');
            return;
        }

        if (submission.status !== 'Balance Insufficient' && !window.confirm('Are you sure you want to submit the changes?')) {
            return;
        }

        const formData = new FormData();
        formData.append('submissionID', id);
        formData.append('creator', submission.creator);
        metadata.forEach((item) => {
            if (item.unit !== 'File') {
                formData.append(item.id, item.value);
            }
        });
        if (file) {
            formData.append('file', file);
        }
        try {
            const response = await axios.post('http://localhost:6500/editsubmission', formData);
            if (response.data.balanceOK === 'True') {
                toast.success('Submission successful.');
                setUserInfoKey((prevKey) => prevKey + 1);
                await fetchSubmission();
            } else {
                toast.error(`Not enough balance, estimation is ${response.data.creditEstimation} credits.`);
            }
        } catch (error) {
            toast.error('Error submitting the problem.');
            console.error('Error submitting the form:', error);
        }
        finally {
            await fetchSubmission();
        }
    };

    const handleResultsClick = () => {
        navigate(`/submission-results/${id}`);
    };

    const handleDoneClick = () => {
        navigate('/submissions');
    };

    const handleStopSubmission = async () => {
        try {
            const response = await axios.post(`http://localhost:9500/kill_submission?submissionID=${id}`);
            if (response.data.message === 'Submission stopped successfully.') {
                toast.success('Submission stopped successfully.');
            } else if (response.data.message === 'Submission already finished or does not exist.') {
                toast.info('Submission has already finished.');
            } else {
                toast.error('Failed to stop submission.');
            }
        } catch (error) {
            toast.error('Failed to stop submission.');
            console.error('Error stopping submission:', error);
        } finally {
            await fetchSubmission();
        }
    };

    const extractNodeError = (message) => {
        if (typeof message === 'string') {
            const match = message.match(/Check failed: start <= num_nodes_ \((\d+) vs\. (\d+)\)/);
            if (match) {
                const [, given, max] = match;
                return ` due to depot greater than ${max} (depot ${given} given)`;
            }
        }
        return null;
    };

    const failureMessage = submission?.status === 'Failed' && submission.results
        ? extractNodeError(submission.results)
        : null;

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'submission-status pending';
            case 'finished':
                return 'submission-status completed';
            case 'failed':
                return 'submission-status failed';
            case 'balance insufficient':
                return 'submission-status failed';
            default:
                return 'submission-status';
        }
    };

    return (
        <div className="home-container">
            <Header />
            <UserInfo pageName="View Submission" key={userInfoKey} />
            <main className="main-content">
                <ToastContainer />
                {loading && (
                    <div className="spinner-container">
                        <div className="loader"></div>
                    </div>
                )}
                {!loading && error && <div>Submission does not exist.</div>}
                {!loading && !error && submission && (
                    <>
                        <h2>Submission ID: {submission._id}</h2>
                        <p>
                            <strong>Created Date:</strong> {new Date(submission.date).toLocaleString()}
                        </p>
                        <p>
                            <strong>Status: </strong>
                            <span className={getStatusClass(submission.status)}>{submission.status}</span>
                            {submission.status === 'Finished' && (
                                <BiShow
                                    className="status-icon"
                                    onClick={handleResultsClick}
                                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                                    title="Show Results"
                                />
                            )}
                            {submission.status === 'Balance Insufficient' && (
                                <TbReload
                                    className="status-icon"
                                    onClick={handleConfirmEdit}
                                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                                    title="Retry Submission"
                                />
                            )}
                            {submission.status.toLowerCase() === 'pending' && (
                                <BsStopCircle
                                    className="status-icon"
                                    onClick={handleStopSubmission}
                                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                                    title="Pending Submission"
                                />
                            )}
                            {failureMessage && (
                                <span className="failure-message">{failureMessage}</span>
                            )}
                        </p>
                        <h4>Metadata for {submission.solverID}</h4>
                        <div className="metadata-edit-list">
                            <div className="metadata-edit-header">
                                <span>Title</span>
                                <span>Value</span>
                            </div>
                            <ul>
                                {metadata.map((item, index) => (
                                    <li key={index} className="metadata-edit-item">
                                        <div className="metadata-edit-details">
                                            <span className="metadata-edit-title">{item.title}</span>
                                        </div>
                                        <div className="metadata-edit-input">
                                            <input
                                                type="number"
                                                value={item.value}
                                                onChange={(e) => handleMetadataChange(item.id, e.target.value)}
                                                className="prefilled-value"
                                                readOnly={submission.status === 'Balance Insufficient'}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {submission.status !== 'Balance Insufficient' && (
                            <>
                                <div className="upload-toggle">
                                    <label htmlFor="file-upload-toggle">Upload a new file</label>
                                    <Switch
                                        checked={showFileUpload}
                                        onChange={() => setShowFileUpload(!showFileUpload)}
                                        id="file-upload-toggle"
                                    />
                                </div>
                                {showFileUpload && (
                                    <div className="upload-form">
                                        <FileUploader handleChange={handleFileChange} multiple={false} name="file" types={['JSON']} />
                                        <p>{file ? `Uploaded file: ${file.name}` : ''}</p>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="buttons-container">
                            {submission.status !== 'Balance Insufficient' && (
                                <button className="button-34-green" onClick={handleConfirmEdit}>
                                    Confirm Edit
                                </button>
                            )}
                            <button className="button-34-grey" onClick={handleDoneClick}>
                                Done
                            </button>
                        </div>
                    </>
                )}
            </main>
            <footer className="footer">
                <p className="legal-text">© 2024 Team 30. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default ViewSubmission;
