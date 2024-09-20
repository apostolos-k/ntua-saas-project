import {useNavigate} from 'react-router-dom';
import './Landing.css';
import './App.css'
import Header from "./Header";

const Landing = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/submissions');
    };

    return (
        <div className="home-container">
            <Header/>
            <main className="main-content">
                <div className="welcome-text">
                    <h2>Welcome to Solve my Problem</h2>
                    <p>Start solving your math problems with ease!</p>
                </div>
                <button className="button-64 bounce-in-top" onClick={handleClick}>
                    <span className="text">Continue as Guest</span>
                </button>
            </main>
            <footer className="footer">
                <p className="legal-text">© 2024 Team 30. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;
