import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BsFiletypeCsv, BsFiletypeJson, BsFileEarmarkPdf } from 'react-icons/bs';
import { FaCoins } from "react-icons/fa6";
import noResults from './images/no-result.png';
import './App.css';
import './SubmissionResults.css';
import Header from "./Header";
import UserInfo from "./UserInfo";
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import logo from "./images/math-logo.png";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const SubmissionResults = () => {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const response = await axios.get(`http://localhost:5500/getsubmission?submissionID=${id}`);
                if (response.data.success === false) {
                    setError(true);
                } else {
                    setSubmission(response.data);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching submission details:', error);
                setError(true);
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [id]);

    const handleDoneClick = () => {
        navigate(`/submissions`);
    };

    const parseResults = (results) => {
        const routeData = [];
        const routeDistances = [];

        let currentVehicle = null;
        let currentRoute = '';

        results.split('\n').forEach((line, index, lines) => {
            const routeMatch = line.match(/Route for vehicle (\d+):\s*(.*)/);
            const distanceMatch = line.match(/Distance of the route:\s*(\d+)m/);

            if (routeMatch) {
                if (currentVehicle !== null && currentRoute) {
                    routeData.push({ vehicle: currentVehicle, route: currentRoute.replace(/^ ->\s*/, '') });
                }
                currentVehicle = routeMatch[1];
                currentRoute = routeMatch[2].trim();
            } else if (currentVehicle !== null && line.trim() && !line.startsWith("Distance of the route:")) {
                currentRoute += ' ' + line.trim();
            }

            if (distanceMatch && currentVehicle !== null) {
                routeData.push({ vehicle: currentVehicle, route: currentRoute.replace(/^ ->\s*/, '') });
                routeDistances.push({ vehicle: currentVehicle, distance: parseInt(distanceMatch[1], 10) });
                currentVehicle = null;
                currentRoute = '';
            }
        });

        return { routeData, routeDistances };
    };

    const renderDistanceChart = (routeDistances) => {
        const data = {
            labels: routeDistances.map(d => `Vehicle ${d.vehicle}`),
            datasets: [
                {
                    label: 'Distance of the Route (m)',
                    data: routeDistances.map(d => d.distance),
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderWidth: 1,
                },
            ],
        };
        const options = {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };
        return <Bar data={data} options={options} />;
    };

    const downloadPDF = (content, filename) => {
        const doc = new jsPDF();
        doc.text(content, 10, 10);
        doc.save(filename);
    };

    const downloadJSON = (data, filename) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    };

    const downloadVRPSolverPDF = () => {
        const doc = new jsPDF();
        doc.text('Submission Results', 20, 10);
        autoTable(doc, {
            head: [['Vehicle', 'Route', 'Distance (m)']],
            body: routeData.map((route) => {
                const distance = routeDistances.find(d => d.vehicle === route.vehicle)?.distance;
                return [route.vehicle, route.route, distance];
            }),
        });
        doc.save(`${id}_results.pdf`);
    };

    const downloadVRPSolverCSV = () => {
        const data = routeData.map(route => ({
            vehicle: route.vehicle,
            route: route.route,
            distance: routeDistances.find(d => d.vehicle === route.vehicle)?.distance,
        }));

        const csvContent = [
            ['Vehicle', 'Route', 'Distance (m)'],
            ...data.map(item => [item.vehicle, item.route, item.distance])
        ]
            .map(e => e.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${id}_results.csv`;
        link.click();
    };

    const downloadVRPSolverJSON = () => {
        const data = routeData.map((route) => ({
            vehicle: route.vehicle,
            route: route.route,
            distance: routeDistances.find(d => d.vehicle === route.vehicle)?.distance,
        }));
        downloadJSON(data, `${id}_results.json`);
    };

    if (loading) {
        return (
            <div className="spinner-container">
                <div className="loader"></div>
            </div>
        );
    }

    if (error || submission.results === "") {
        return (
            <div className="home-container">
                <Header />
                <UserInfo pageName="Submission Results" />
                <main className="main-content">
                    <h3>No results available for submission {id}</h3>
                    <button className="button-34-grey" onClick={handleDoneClick}>
                        Go to Home
                    </button>
                </main>
                <footer className="footer">
                    <p className="legal-text">© 2024 Team 30. All rights reserved.</p>
                </footer>
            </div>
        );
    }

    const { routeData, routeDistances } = submission.solverID === 'vrpSolver' ? parseResults(submission.results) : { routeData: [], routeDistances: [] };
    const maxDistance = routeDistances.length > 0 ? Math.max(...routeDistances.map(d => d.distance)) : 0;
    const maxDistanceVehicle = routeDistances.length > 0 ? routeDistances.find(d => d.distance === maxDistance).vehicle : null;

    return (
        <div className="home-container">
            <Header />
            <UserInfo pageName="Submission Results" />
            <main className="main-content">
                <h3>Results for Submission ID: {submission._id}</h3>
                <p>Total credits used: {submission.credits} <FaCoins /></p>
                <div>
                    {submission.results.trim() === 'No solution found !' ? (
                        <>
                            <img src={noResults} alt="Logo" className="no-results-image"/>
                            <h4 style={{ marginBottom: '50px' }}>No solution found for your problem</h4>
                        </>
                    ) : (
                        <>
                            {submission.solverID === 'vrpSolver' ? (
                                <>
                                    <table className="results-table">
                                        <thead>
                                        <tr>
                                            <th>Vehicle</th>
                                            <th>Route</th>
                                            <th>Distance (m)</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {routeData.map((route, index) => {
                                            const distance = routeDistances.find(d => d.vehicle === route.vehicle)?.distance;
                                            const isMaxDistance = route.vehicle === maxDistanceVehicle;
                                            return (
                                                <tr key={index} className={isMaxDistance ? 'highlight-row' : ''}>
                                                    <td>{route.vehicle}</td>
                                                    <td>{route.route}</td>
                                                    <td>{distance}</td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                    <div>
                                        {renderDistanceChart(routeDistances)}
                                    </div>
                                    <div className="download-section">
                                        <h4>Select file format to download results</h4>
                                        <button className="button-34-grey pdf-button" onClick={downloadVRPSolverPDF}>
                                            <BsFileEarmarkPdf/> PDF
                                        </button>
                                        <button className="button-34-grey json-button" onClick={downloadVRPSolverJSON}>
                                            <BsFiletypeJson/> JSON
                                        </button>
                                        <button className="button-34-grey csv-button" onClick={downloadVRPSolverCSV}>
                                            <BsFiletypeCsv/> CSV
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <pre>{submission.results}</pre>
                                    <div className="download-section">
                                        <h4>Download</h4>
                                        <button className="button-34-grey pdf-button" onClick={() => downloadPDF(submission.results, `${id}_results.pdf`)}>
                                            <BsFileEarmarkPdf /> PDF
                                        </button>
                                        <button className="button-34-grey json-button" onClick={() => downloadJSON(submission.results, `${id}_results.json`)}>
                                            <BsFiletypeJson /> JSON
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
                <button className="button-34-grey" onClick={handleDoneClick}>
                    Done
                </button>
            </main>
            <footer className="footer">
                <p className="legal-text">© 2024 Team 30. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default SubmissionResults;
