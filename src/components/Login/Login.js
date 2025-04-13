import React, { useState, useEffect } from "react";
import './Login.css';

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

const login_url = "http://localhost:8017/authenticate";
const signup_url = "http://localhost:8017/api/user/createUser";

const Login = () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [dob, setDob] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);

    // Toggle between sign in and sign up forms
    const handleSignInClick = () => {
        setIsSignIn(!isSignIn);
        setErrorMessage(""); // Clear any previous errors when switching forms
        setShowError(false);
    };

    useEffect(() => {
        const token = getCookie("token");
        if (token) {
            window.location.replace("/");
        }
    }, []);

    useEffect(() => {
        setShowError(false);
        const fadeInSections = document.querySelectorAll(".fade-in-section");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("fade-in-visible");
                    } else {
                        entry.target.classList.remove("fade-in-visible");
                    }
                });
            },
            { threshold: 0.12 }
        );

        fadeInSections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    const showErrorMessage = (message) => {
        setErrorMessage(message);
        setShowError(true);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log(password);
        const params = { email: email, password: password };
        const formattedEmail = email.replace(/\s+/g, '');
        localStorage.setItem("email", formattedEmail);

        try {
            const response = await fetch(login_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                document.cookie = "token=" + data.token + "; path=/";
                window.location.replace("/");
            } else {
                showErrorMessage(data.message || "Invalid email or password");
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorMessage("An error occurred. Please try again later.");
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        const params = { email: email, password: password, name: name, dob: dob };
        const formattedEmail = email.replace(/\s+/g, '');
        localStorage.setItem("email", formattedEmail);

        try {
            const response = await fetch(signup_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert("successfully created")
            } else {
                showErrorMessage(data.message || "Registration failed");
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorMessage("An error occurred. Please try again later.");
        }
    };

    const handleSubmit = (e) => {
        if (isSignIn) {
            handleLogin(e);
        } else {
            handleSignUp(e);
        }
    };

    return (
        <div className="login-section" style={{ paddingTop: '80px' }}>
            <form className="login-container" onSubmit={isSignIn ? handleLogin : handleSignUp}>
                <div className={`move ${isSignIn ? 'moving' : 'start'}`}>
                    <div 
                        className={`p-button normal signin ${isSignIn ? '' : 'animated pulse'}`} 
                        onClick={handleSignInClick}
                        type="button"
                    >
                        {isSignIn ? 'SIGN UP' : 'SIGN IN'}
                    </div>
                </div>
                
                <div className="welcome" style={{ display: isSignIn ? 'none' : 'block' }}>
                    <h4 className="bold welcome-text">Find Your Studymate</h4>
                    <p className="normal text">To keep connected with us please login with your personal info</p>
                </div>
                
                <div className="hello" style={{ display: isSignIn ? 'block' : 'none' }}>
                    <h4 className="bold welcome-text">Hello Friend</h4>
                    <p className="normal text">Enter your personal details and start journey with us</p>
                </div>
                
                <div className={`form ${isSignIn ? 'movingForm' : 'startForm'}`}>
                    <h4 className="bold title">{isSignIn ? 'Login' : 'Create Account'}</h4>
                    
                    <p className="normal light">{isSignIn ? 'Or use your email account' : 'Or use your email for registration'}</p>
                    
                    {showError && <div className="error-message">{errorMessage}</div>}
                    
                    {!isSignIn && (
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Name" 
                            className="normal name" 
                            required
                        />
                    )}
                    
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Email" 
                        className="normal" 
                        required
                    />
                    <br />
                    
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Password" 
                        className="normal" 
                        required
                    />
                    <br />
                    
                    {!isSignIn && (
                        <>
                            <label htmlFor="date">Date of Birth</label>
                            <br />
                            <input 
                                type="date" 
                                id="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="normal"
                                required
                            />
                            <br />
                        </>
                    )}
                    
                    <p className="forgot" style={{ display: isSignIn ? 'block' : 'none' }}>Forgot your password?</p>
                    
                    <button type="submit" className="b-button normal">
                        {isSignIn ? 'SIGN IN' : 'SIGN UP'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;