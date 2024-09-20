import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from './images/math-logo.png';
import './Header.css';

const Header = () => {
    const [serverHealth, setServerHealth] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServerHealth = async () => {
            try {
                let response = await axios.get('http://localhost:6500/healthcheck');
                setServerHealth(response.data.status);
            } catch (error) {
                console.error('Error fetching server health: ', error);
                setServerHealth('Bad');
            }
        };
        fetchServerHealth();

        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getServerHealthClass = () => {
        switch (serverHealth.toLowerCase()) {
            case 'ok':
                return 'server-health good';
            case 'warning':
                return 'server-health warning';
            case 'bad':
                return 'server-health bad';
            default:
                return 'server-health';
        }
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <header className="header">
            <div className="left">
                <div className={getServerHealthClass()}>Server Health: {serverHealth}</div>
            </div>
            <div className="center">
                <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                    <img src={logo} alt="Logo"/>
                </div>
            </div>
            <div className="right">
                <div className="date-time">{currentDateTime.toLocaleString()}</div>
            </div>
        </header>
    );
};

export default Header;
