import React from 'react';

import { NavLink } from 'react-router-dom';

import '../../../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';

import Profile from '../../resources/profile.png';
import GetUser from '../../utils/GetUser';

import { useSidebar } from '../context/SidebarContext';

export default function MailSidebar({ children }) {
    const { collapsed, toggleSidebar } = useSidebar();

    const [user, setUser] = React.useState(null);

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
        <div className="d-flex vh-100 overflow-hidden">
            <nav className={`sidebar ${collapsed ? "collapsed" : ""} d-flex flex-column flex-shrink-0 position-fixed`}
                style={{
                    height: '92vh',
                    left: 0
                }}>
                <button className="toggle-btn" onClick={toggleSidebar}>
                    <i className="fas fa-chevron-left"></i>
                </button>
                <div className="p-4">
                    <h4 className="logo-text fw-bold mb-0">My Mails</h4>
                </div>

                <div className="nav flex-column">
                    <NavLink to="/mails" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "") + " text-decoration-none p-3"}>
                        <i className="fas fa-envelope me-3"></i>
                        <span className="hide-on-collapse">Inbox</span>
                    </NavLink>
                    <>
                        {
                            /*
                            <NavLink to="/admin/transactions" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "") + " text-decoration-none p-3"}>
                            <i className="fas fa-bar-chart me-3"></i>
                            <span className="hide-on-collapse">Transactions</span>
                        </NavLink>
                        <NavLink to="/admin/logs" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "") + " text-decoration-none p-3"}>
                            <i className="fas fa-history me-3"></i>
                            <span className="hide-on-collapse">User Logs</span>
                        </NavLink>
                        <NavLink to="/admin/send-mail" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "") + " text-decoration-none p-3"}>
                            <i className="fas fa-envelope me-3"></i>
                            <span className="hide-on-collapse">Mail Sender</span>
                        </NavLink>
                        <NavLink to="/landing" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "") + " text-decoration-none p-3"}>
                            <i className="fas fa-user me-3"></i>
                            <span className="hide-on-collapse">User Page</span>
                        </NavLink>
                            */
                        }
                    </>
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
            <div
                className="main-content d-flex flex-column"
                style={{
                    marginLeft: collapsed ? '80px' : '280px',
                    height: '92vh',
                    overflowY: 'hidden',
                    padding: '20px',
                    width: '100%',
                    transition: 'margin-left 0.3s'
                }}
            >
                <div
                    style={{
                        overflowY: 'auto',
                        flexGrow: 1,
                        minHeight: 0 
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}