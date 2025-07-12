import React from 'react';
import Swal from 'sweetalert2';

import { useNavigate } from 'react-router';

import axios from '../../utils/axios';
import GetUser from '../../utils/GetUser';

import '../../../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { FiEye, FiEyeOff } from 'react-icons/fi';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';

import './Outsider.css';

export default function Register() {
    const [iconVisible, setIconVisible] = React.useState(false);
    const [isSignUp, setIsSignUp] = React.useState(false);

    const [type, setType] = React.useState('password');

    const [name, setName] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [verifyPassword, setVerifyPassword] = React.useState('');
    const [discord, setDiscord] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleToggle = () => {
        setIconVisible(!iconVisible);
        setType(prev => prev === 'password' ? 'text' : 'password');
    };

    const redirect = () => {
        setIsSignUp(!isSignUp);
    }

    const CallRegister = (e) => {
        e.preventDefault();
        setLoading(true);
        // name, username, password, verify_password, discord_id
        axios({
            method: 'POST',
            url: '/api/register',
            data: {
                name, username, password, verify_password: verifyPassword, discord_id: discord
            }
        }).then(result => {
            if (result.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Account created.",
                    text: "Now, you have to verify your account via discord!"
                });

                setName('');
                setPassword('');
                setVerifyPassword('');
                setDiscord('');
                setUsername('');
            }
            else
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong!",
                    footer: 'Some fields are missing.'
                });
        }).catch(err => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
                footer: err.response?.data?.message || err.message || "Internal server error"
            });
        }).finally(_ => {
            setLoading(false);
        });
    }

    const navigate = useNavigate();

    React.useEffect(() => {
        const Auth = async (isSignUp) => {
            const users = await GetUser();

            if (users && !isSignUp)
                navigate(users.role >= 2 ? '/admin/dashboard' : '/landing');
        }

        Auth(isSignUp);
    }, [isSignUp]);


    const CallLogin = (e) => {
        e.preventDefault();
        setLoading(true);

        axios({
            method: 'POST',
            url: '/api/login',
            data: {
                username, password
            }
        }).then(result => {
            // const token = result.data?.token;
            // if (token) {
            //     localStorage.setItem("token", result.data.token);
            //     window.location.href = '/admin/dashboard';
            // }
            // else
            //     Swal.fire({
            //         icon: "error",
            //         title: "Oops...",
            //         text: "Something went wrong!",
            //         footer: 'Username or password could be wrong.'
            //     });
            
            setTimeout(() => {
                const role = result.data?.user?.role ?? 0;
                window.location.href = role >= 2 ? '/admin/dashboard' : '/landing';
            }, 200);
        }).catch(err => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
                footer: err.response?.data?.message || err.message || "Internal server error"
            });
        }).finally(_ => {
            setLoading(false);
        });
    }

    return (
        <div className={`container ${isSignUp ? 'right-panel-active' : ''} my-5`} id="container">
            <div className="form-container sign-up-container border rounded overflow-hidden">
                <div className="row d-flex g-3 rounded shadow overflow-hidden auth-box" style={{ width: '100%', height: '100%' }}>
                    <div className="col-lg-6 bg-white py-4 px-5 d-flex flex-column justify-content-start">
                        <form action="#">
                            <h1 className="text-center mb-3">Create Account</h1>
                            <div className="account-input">
                                <i className="far fa-user mx-2"></i>
                                <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="account-input">
                                <i className="far fa-user mx-2"></i>
                                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            <div className="account-input">
                                <i className="fas fa-key mx-2"></i>
                                <input type={type} placeholder="Password" onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading} style={{ paddingRight: '10px' }} />
                                <span
                                    onClick={handleToggle}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        color: '#999' // optional: ensure it’s visible
                                    }}
                                >
                                    {iconVisible ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                </span>
                            </div>
                            <div className="account-input">
                                <i className="fas fa-key mx-2"></i>
                                <input type={type} placeholder="Verify Password" onChange={(e) => setVerifyPassword(e.target.value)}
                                    disabled={loading} style={{ paddingRight: '10px' }} />
                                <span
                                    onClick={handleToggle}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        color: '#999' // optional: ensure it’s visible
                                    }}
                                >
                                    {iconVisible ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                </span>
                            </div>
                            <div className="account-input">
                                <i className="fab fa-discord mx-2"></i>
                                <input type="text" placeholder="Discord ID" onChange={(e) => setDiscord(e.target.value)} />
                            </div>

                            <div className="register-button mt-3">
                                <button className="btn btn-primary" onClick={(e) => CallRegister(e)}>Register</button>
                            </div>
                        </form>
                    </div>
                    <div className="col-md-6 bg-success text-white p-5 d-flex flex-column justify-content-center align-items-center">
                        <h2>Already have an account?</h2>
                        <p className="text-center mt-2">You can sign in by clicking the button below.</p>
                        <button className="btn btn-outline-light mt-3" onClick={redirect}>Sign In</button>
                    </div>
                </div>
            </div>
            <div className="form-container sign-in-container border rounded overflow-hidden">
                <div className="row d-flex g-3 rounded shadow overflow-hidden auth-box" style={{ width: '100%', height: '100%' }}>
                    <div className="col-md-6 bg-success text-white p-5 d-flex flex-column justify-content-center align-items-center">
                        <h2>Don't have account?</h2>
                        <p className="text-center mt-2">You can sign up by clicking the button below.</p>
                        <button className="btn btn-outline-light mt-3" onClick={redirect}>Sign Up</button>
                    </div>
                    <div className="col-lg-6 bg-white py-4 px-5 d-flex flex-column justify-content-start">
                        <form action="#" id="sign-in-container">
                            <div className="hide" id="forgot">
                                <h1 className="text-center mb-5">Sign in</h1>
                                <div className="account-input my-3">
                                    <i className="far fa-user mx-2"></i>
                                    <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                                </div>
                                <div className="account-input">
                                    <i className="fas fa-key mx-2"></i>
                                    <input type={type} placeholder="Password" onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading} style={{ paddingRight: '10px' }} />
                                    <span
                                        onClick={handleToggle}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer',
                                            color: '#999' // optional: ensure it’s visible
                                        }}
                                    >
                                        {iconVisible ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                    </span>
                                </div>

                                <div className="register-button mt-4">
                                    <button className="btn btn-primary" onClick={(e) => CallLogin(e)}>Sign in</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}