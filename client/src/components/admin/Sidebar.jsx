import React from 'react';
import Swal from 'sweetalert2';

import { NavLink } from 'react-router-dom';

import './Insider.css';

import '../../../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';

import Profile from '../../resources/profile.png';
import GetUser from '../../utils/GetUser';
import axios from '../../utils/axios';

import { useSidebar } from '../context/SidebarContext';

export function Sidebar() {
    const { collapsed, toggleSidebar } = useSidebar();
    const [open, setOpen] = React.useState(false);

    const [user, setUser] = React.useState(null);

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
        const fetchUser = async () => {
            const users = await GetUser();
            setUser(users);
        };

        fetchUser();
    }, []);

    const role_name = () => {
        return user?.role === 2 ? "Admin" : "User";
    }

    return (
        <div className="d-flex">
            <nav className={`sidebar ${collapsed ? "collapsed" : ""} d-flex flex-column flex-shrink-0 position-fixed`}>
                <button className="toggle-btn" onClick={toggleSidebar}>
                    <i className="fas fa-chevron-left"></i>
                </button>
                <div className="p-4">
                    <h4 className="logo-text fw-bold mb-0">Stock Manager</h4>
                </div>

                <div className="nav flex-column">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "") + " text-decoration-none p-3"}>
                        <i className="fas fa-home me-3"></i>
                        <span className="hide-on-collapse">Dashboard</span>
                    </NavLink>
                    <div className="sidebar-link text-decoration-none p-3" onClick={() => setOpen(!open)}>
                        <i className="fas fa-box me-3"></i>
                        <span className="hide-on-collapse dropdown">Stock</span>
                        <i id="submenu-arrow" className={`fas ms-2 ${open ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                        {open && (
                            <div className="submenu">
                                <NavLink to="/admin/stocks" className="sidebar-link text-decoration-none d-block py-3 mt-1"
                                    onClick={(e) => e.stopPropagation()}>
                                    <i className="fas fa-cubes me-2"></i>
                                    <span className="hide-on-collapse">Stocks</span>
                                </NavLink>
                                <NavLink to="/admin/addstock" className="sidebar-link text-decoration-none d-block py-3"
                                    onClick={(e) => e.stopPropagation()}>
                                    <i className="fas fa-plus me-2"></i>
                                    <span className="hide-on-collapse">Add Stock</span>
                                </NavLink>
                            </div>
                        )}
                    </div>
                    <NavLink to="/admin/transactions" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "") + " text-decoration-none p-3"}>
                        <i className="fas fa-bar-chart me-3"></i>
                        <span className="hide-on-collapse">Transactions</span>
                    </NavLink>
                    <NavLink to="/admin/logs" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "") + " text-decoration-none p-3"}>
                        <i className="fas fa-history me-3"></i>
                        <span className="hide-on-collapse">User Logs</span>
                    </NavLink>
                    <NavLink to="/landing" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "") + " text-decoration-none p-3"}>
                        <i className="fas fa-user me-3"></i>
                        <span className="hide-on-collapse">User Page</span>
                    </NavLink>
                    <div className="sidebar-link text-decoration-none p-3" onClick={SendLogout}>
                        <i className="fas fa-sign-out me-3"></i>
                        <span className="hide-on-collapse">Log out</span>
                    </div>
                </div>

                <div className="profile-section mt-auto p-4">
                    <div className="d-flex align-items-center">
                        <img src={Profile} style={{ height: "60px" }} alt="Profile" />
                        <div className="ms-3 profile-info">
                            <h6 className="text-white mb-1">{user ? user?.name : "Unknown"}</h6>
                            <small className="text-white">{role_name()}</small>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}