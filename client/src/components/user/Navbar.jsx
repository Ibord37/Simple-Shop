import React from 'react';
import Swal from 'sweetalert2';

import axios from '../../utils/axios';

import { NavLink } from 'react-router-dom';
import { Dropdown } from 'bootstrap';

import Profile from '../../resources/profile.png';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './User.css';

export default function PageNavbar() {
    function SendLogout() {
        //e.preventDefault();

        Swal.fire({
            title: "Are you sure?",
            text: "You want to log out?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Confirm"
        }).then((result) => {
            if (result.isConfirmed) {
                axios({
                    method: 'POST',
                    url: '/api/logout'
                }).then(_ => {
                    Swal.fire({
                        title: "Logged out!",
                        text: "You have logged out.",
                        icon: "success",
                        confirmButtonText: "Return to Login"
                    }).then(result => {
                        if (result.isConfirmed)
                            window.location.href = '/login';
                    });
                }).catch(err => {
                    console.log(err);
                });
                
            }
        });
    }

    React.useEffect(() => {
        const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
        const dropdownList = [...dropdownElementList].map(
            (dropdownToggleEl) => new Dropdown(dropdownToggleEl)
        );
    }, []);

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary justify-content-between" data-bs-theme="dark">
            <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <NavLink className="navbar-brand ms-3" to="/">Untitled Project</NavLink>
                <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <NavLink to="/landing" className={({ isActive }) => `nav-link ${isActive ? "active" : ""} mx-3`}>
                                Home
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? "active" : ""} mx-3`}>
                                Shop
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/my-cart" className={({ isActive }) => `nav-link ${isActive ? "active" : ""} mx-3`}>
                                My Cart
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? "active" : ""} mx-3`}>
                                Transactions
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/inventory" className={({ isActive }) => `nav-link ${isActive ? "active" : ""} mx-3`}>
                                My Inventory
                            </NavLink>
                        </li>
                    </ul>
                    <div className="ms-auto">
                        <ul className="navbar-nav">
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src={Profile} className="rounded-circle me-2" style={{ width: '36px', height: '36px' }} />
                                    My Account
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button className="dropdown-item" onClick={SendLogout}><i className="fas fa-sign-out me-2"></i> Log out</button>
                                    </li>
                                    <li><hr className="dropdown-divider"/></li>
                                    <li><a className="dropdown-item" href="/profile"><i className="fas fa-user me-2"></i> Profile</a></li>
                                    <li><hr className="dropdown-divider"/></li>
                                    <li><a className="dropdown-item" href="/mails"><i className="fas fa-envelope me-2"></i> Inbox</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
}