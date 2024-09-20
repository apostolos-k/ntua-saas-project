import React, { useState, useEffect } from 'react';
import { FaUser } from "react-icons/fa";
import Modal from 'react-modal';
import { MdClose } from "react-icons/md";
import axios from 'axios';
import './UserInfo.css';

const UserInfo = ({ pageName }) => {
    const [showModal, setShowModal] = useState(false);
    const [credits, setCredits] = useState(0);
    const [tempCredits, setTempCredits] = useState(0);

    useEffect(() => {
        fetchCredits();
    }, []);

    const fetchCredits = async () => {
        try {
            const response = await axios.get('http://localhost:7500/credit');
            setCredits(response.data.count);
        } catch (error) {
            console.error('Error fetching credits:', error);
        }
    };

    const handleCreditsClick = () => {
        setTempCredits(credits);
        setShowModal(true);
    };

    const handleSaveCredits = async () => {
        try {
            await axios.post('http://localhost:7500/credit', { count: tempCredits });
            setCredits(tempCredits);
            setShowModal(false);
        } catch (error) {
            console.error('Error saving credits:', error);
        }
    };

    const handleCancel = () => {
        setShowModal(false);
    };

    return (
        <div>
            <div className="user-info">
                <div className="left"><FaUser /> Guest</div>
                <div className="center">{pageName}</div>
                <div className="right" onClick={handleCreditsClick}>Credits: {credits}</div>
            </div>
            <Modal
                isOpen={showModal}
                onRequestClose={handleCancel}
                contentLabel="Enter Credits Modal"
                className="modal"
                overlayClassName="overlay"
            >
                <span className="modal-close" onClick={handleCancel}><MdClose /></span>
                <div className="modal-content">
                    <h2>Set Credits</h2>
                    <p>Here you can select the desired amount of available global credits</p>
                    <p>Please enter a positive number</p>
                    <input
                        type="number"
                        value={tempCredits}
                        onChange={(e) => setTempCredits(parseInt(e.target.value))}
                        className="modal-text-field"
                    />
                    {tempCredits < 0 && <p className="error-message-modal">Negative values are not allowed!</p>}
                    <div className="modal-buttons">
                        <button className="modal-button cancel" onClick={handleCancel}>Cancel</button>
                        <button className="modal-button" onClick={handleSaveCredits} disabled={tempCredits < 0}>Save</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserInfo;
