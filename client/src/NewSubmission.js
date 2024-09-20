import React, { useState, useEffect } from 'react';
import { FileUploader } from "react-drag-drop-files";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './App.css';
import './NewSubmission.css';
import Header from './Header';
import UserInfo from "./UserInfo";

const NewSubmission = () => {
    const [solvers, setSolvers] = useState([]);
    const [solverModel, setSolverModel] = useState("");
    const [metadata, setMetadata] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toastShowed, setToastShowed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSolvers();
    }, []);

    useEffect(() => {
        if (solverModel) {
            fetchMetadata(solverModel);
        }
    }, [solverModel]);

    useEffect(() => {
        const numVehiclesItem = metadata.find(item => item.title === 'num_vehicles');
        if (numVehiclesItem && numVehiclesItem.value > 1000 && !toastShowed) {
            toast.warning('Large values may lead to significant delays.');
            setToastShowed(true);
        }
    }, [metadata, toastShowed]);

    const fetchSolvers = async () => {
        try {
            const response = await axios.get('http://localhost:8500/solver/getall');
            setSolvers(response.data);
            if (response.data.length > 0) {
                setSolverModel(response.data[0].solverID);
            }
        } catch (error) {
            toast.error('Error fetching solvers');
            console.error('Error fetching solvers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async (solverID) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8500/solver?solverID=${solverID}`);
            const solverMetadata = response.data.metadata;
            const metadataForSolver = Object.keys(solverMetadata).map((key, index) => ({
                id: index + 1,
                title: key,
                unit: solverMetadata[key],
                value: ""
            }));
            setMetadata(metadataForSolver);
        } catch (error) {
            toast.error('Error fetching metadata');
            console.error('Error fetching metadata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSolverChange = (e) => {
        setSolverModel(e.target.value);
    };

    const handleChange = (file) => {
        setFile(file);
    };

    const handleSubmit = async () => {
        if (metadata.some(item => item.unit !== "File" && !item.value)) {
            toast.error("All fields are required.");
            return;
        }
        if (!file) {
            toast.error("File is required.");
            return;
        }

        const formData = new FormData();
        formData.append('solverID', solverModel);
        metadata.forEach(item => {
            if (item.unit !== "File") {
                formData.append(item.title, item.value);
            }
        });
        formData.append('file', file);

        try {
            let response = await axios.post('http://localhost:6500/new-submission', formData);
            if (response.data.balanceOK === "True") {
                toast.success('Submission successful!');
                navigate(`/view-submission/${response.data.submissionID}`);
            } else {
                toast.error(`Not enough balance, estimation is ${response.data.creditEstimation} credits.`);
            }
        } catch (error) {
            toast.error('Error submitting the form');
            console.error('Error submitting the form:', error);
        }
    };

    const handleCancelSubmit = () => {
        navigate('/submissions');
    };

    const fileMetadata = metadata.find(item => item.unit === "File");

    return (
        <div className="home-container">
            <Header />
            <UserInfo pageName="New Submission" />
            <main className="main-content">
                <ToastContainer />
                {loading ? (
                    <div className="spinner-container">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <>
                        <div className="solver-selection">
                            <label htmlFor="solverModel">Select a Solver Model:</label>
                            <select id="solverModel" value={solverModel} onChange={handleSolverChange}>
                                {solvers.map((solver) => (
                                    <option key={solver._id} value={solver.solverID}>{solver.solverID}</option>
                                ))}
                            </select>
                        </div>
                        <h4>Fill in the Metadata input values</h4>
                        <div className="metadata-list">
                            <div className="metadata-header">
                                <span>Id</span>
                                <span>Title</span>
                                <span>Unit</span>
                                <span>Value</span>
                            </div>
                            <ul>
                                {metadata.filter(item => item.unit !== "File").map((item, index) => (
                                    <li key={index} className="metadata-item">
                                        <div className="metadata-details">
                                            <span>{item.id}</span>
                                            <span className="metadata-title">{item.title}</span>
                                            <span>{item.unit}</span>
                                        </div>
                                        <div className="metadata-input">
                                            <input
                                                type="number"
                                                value={item.value}
                                                className={item.title === 'num_vehicles' && item.value > 1000 ? 'input-error' : ''}
                                                onChange={(e) => {
                                                    const updatedMetadata = metadata.map(meta => meta.id === item.id ? {
                                                        ...meta,
                                                        value: parseInt(e.target.value, 10) || ''
                                                    } : meta);
                                                    setMetadata(updatedMetadata);
                                                }}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {fileMetadata && (
                            <div className="upload-form">
                                <h4>Upload the {fileMetadata.title} file for your problem</h4>
                                <FileUploader handleChange={handleChange} multiple={false} name="file" types={["JSON"]} />
                                <p>{file ? `Uploaded file: ${file.name}` : ""}</p>
                            </div>
                        )}
                        <div className="buttons-container">
                            <button className="button-34" onClick={handleSubmit}>Create Submission</button>
                            <button className="button-34-grey" onClick={handleCancelSubmit}>Cancel</button>
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

export default NewSubmission;
