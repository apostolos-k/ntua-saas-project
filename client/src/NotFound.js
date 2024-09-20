import React from 'react';
import {Link} from 'react-router-dom';
import logoerror from './images/404-error.png';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="home-container">
            <main className="main-content">
                <img src={logoerror} alt="Error 404" className="error-logo"/>
                <div className="error-text">
                    <h2>Ooops... Page not Found!</h2>
                </div>
                <Link to="/" className="button-64">
                    <span className="text">Back to Home</span>
                </Link>
            </main>
            <footer className="footer">
                <p className="legal-text">© 2024 Team 30. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default NotFound;