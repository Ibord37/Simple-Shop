import React from 'react';
import Swal from 'sweetalert2';

import GetUser from '../../utils/GetUser';
import axios from '../../utils/axios';

export default function ProtectRoute({ children, role_id = 2 }) {
    const [auth, setAuth] = React.useState(false);
    const [verified, setVerified] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [exp, setExp] = React.useState(true);

    React.useEffect(() => {
        const check_user = async () => {
            try {
                const users = await GetUser();
                
                if (users) {
                    if (users.role < role_id)
                        throw new Error("Unauthorized");

                    setExp(false);
                    setVerified(users.verified);
                    setAuth(true);
                } else {
                    throw new Error("Unauthorized.");
                }
            } catch (err) {
                await axios.post('/api/logout');
            } finally {
                setLoading(false);
            }
        }

        check_user();
    }, [role_id]);

    React.useEffect(() => {
        if (!loading && !verified) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Please verify your account via Discord.",
                confirmButtonText: "Return to Login"
            }).then(() => {
                window.location.href = '/login';
            });
        }
    }, [loading, verified]);

    React.useEffect(() => {
        if (!loading && exp) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Your session has expired. Please login again.",
                confirmButtonText: "Return to Login"
            }).then(() => {
                window.location.href = '/login';
            });
        }
    }, [loading, exp]);

    if (loading)
        return <div>Checking...</div>;

    if (auth)
        return children;

    return null;
}