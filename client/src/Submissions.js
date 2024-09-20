import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './Submissions.css';
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import UserInfo from "./UserInfo";

const Submissions = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5500/allsubmissions')
            .then(response => response.json())
            .then(data => {
                setSubmissions(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching submissions:', error);
                setLoading(false);
            });
    }, []);

    const handleClick = () => {
        navigate('/new-submission');
    };

    const handleDelete = async (submissionID) => {
        if (window.confirm("Are you sure you want to delete this submission?")) {
            try {
                const response = await fetch('http://localhost:5500/deletesubmission', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ submissionID })
                });

                if (response.ok) {
                    setSubmissions(submissions.filter(submission => submission.id !== submissionID));
                    toast.success("Submission deleted successfully.");
                } else {
                    toast.error("Failed to delete the submission.");
                }
            } catch (error) {
                console.error('Error deleting submission:', error);
                toast.error("An error occurred while deleting the submission.");
            }
        }
    };

    const handleViewEditClick = (submissionID) => {
        navigate(`/view-submission/${submissionID}`);
    };

    const handleResultsClick = (submissionID) => {
        navigate(`/submission-results/${submissionID}`);
    };

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
            <UserInfo pageName="All Submissions" />
            <main className="main-content">
                <ToastContainer />
                {!loading && submissions.length > 0 && (
                    <div className="welcome-text">
                        <h3>Available submissions</h3>
                    </div>
                )}
                {loading ? (
                    <div className="spinner-container">
                        <div className="loader"></div>
                    </div>
                ) : (
                    submissions.length > 0 ? (
                        <div className="submissions-list">
                            <div className="submissions-header">
                                <span>ID</span>
                                <span>Creator</span>
                                <span>Created Date</span>
                                <span>Status</span>
                                <span>Actions</span>
                            </div>
                            <ul>
                            {submissions.map((submission, index) => (
                                    <li key={index} className="submission-item">
                                        <div className="submission-details">
                                            <span>{submission.id}</span>
                                            <span>{submission.creator}</span>
                                            <span>{new Date(submission.date).toISOString().split('T')[0]}</span>
                                            <span
                                                className={getStatusClass(submission.status)}>{submission.status}</span>
                                        </div>
                                        <div className="submission-actions">
                                            <button onClick={() => handleViewEditClick(submission.id)}>View/Edit</button>
                                            <button
                                                onClick={() => handleResultsClick(submission.id)}
                                                disabled={submission.status.toLowerCase() !== 'finished'}
                                            >
                                                Results
                                            </button>
                                            <button onClick={() => handleDelete(submission.id)} className="delete">Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="no-results">
                            <p>There are no submissions. Please create one.</p>
                        </div>
                    )
                )}
                <div className="button-container">
                    <button className="button-34" onClick={handleClick}>New Submission</button>
                </div>
            </main>
            <footer className="footer">
                <p className="legal-text">© 2024 Team 30. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Submissions;
