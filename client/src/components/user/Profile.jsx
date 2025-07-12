import React from "react";
import Swal from "sweetalert2";

import axios from "../../utils/axios";
import GetUser from "../../utils/GetUser";

import Profile from '../../resources/profile.png';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';

import './User.css';
import { FormatNumber } from "../../utils/Format";

export default function ProfilePage() {
    const [user, setUser] = React.useState(null);
    const [userDB, setUserDB] = React.useState({});

    const Topup = () => {
        const options = ['100', '500', '1000', '5000', '10000'];
        let btn_list = "";

        options.forEach(option => {
            btn_list += `<button id=${option} class="btn btn-secondary">$${FormatNumber(+option)}</button>\n`;
        })

        Swal.fire({
            title: 'Recharge',
            html: `
                <div style="display:flex;flex-direction:column;align-items:center;gap:12px;justify-content:center">
                <p>How many Untitled Coin would you like to recharge via discord?</p>
                <input id="swal-quantity" type="number" min=${options[0]} value=${options[0]} max=${options[options.length - 1]} style="width:60%;text-align:center;padding:8px;margin-bottom:8px;" />
                <div>
                ${btn_list}
                </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Recharge',
            didOpen: () => {
                const input = document.getElementById('swal-quantity');

                input.addEventListener('input', () => {
                    if (+input.value > +input.max)
                        input.value = input.max;

                    if (+input.value < +input.min)
                        input.value = input.min;
                });

                options.forEach(option => {
                    document.getElementById(option).addEventListener('click', () => {
                        input.value = option;
                    });
                });
            },
            preConfirm: async () => {
                const input = document.getElementById('swal-quantity');
                const amount = parseInt(input.value);

                if (!amount || isNaN(amount) || amount < 100) {
                    Swal.showValidationMessage("You can only top up at least $100.");
                    return false;
                }

                return amount;
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                const amount = +result.value;

                axios({
                    method: 'POST',
                    url: '/api/transactions_add',
                    data: {
                        option: 'discord-topup', actual_price: amount
                    }
                }).then(result => {
                    if (result.status === 200)
                        Swal.fire("Success!", "Top up has been added to transaction, please immediately check and pay it.", "success");
                    else
                        Swal.fire("Oops...", result.data.message, "error");
                }).catch(err => {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: err.response?.data?.message || err.message,
                    });
                });
            }
        });
    }

    React.useEffect(() => {
        const FetchUser = async () => {
            const users = await GetUser();
            setUser(users);
        }

        FetchUser();
    }, []);

    React.useEffect(() => {
        const FetchUserDB = () => {
            axios({
                method: 'GET',
                url: '/api/get-extra-db'
            }).then(result => {
                setUserDB(result.data.user_db);
            }).catch(err => {
                console.log(err.response?.data?.message || err.message);
                setUserDB(null);
            });
        }

        FetchUserDB();
    }, []);

    if (!user)
        return <div>Loading...</div>

    return (
        <div className="container profile justify-content-center">
            <div className="profile-box mb-5 mx-auto">
                <div className="col-12">
                    <div className="row mx-auto my-auto" style={{ height: '50vh' }}>
                        {/*1 : 1.5*/}
                        <div className="col-4" style={{ background: 'linear-gradient(to right, #ee5a6f, #f29263)' }}>
                            <div className="mt-3">
                                <div className="profile-pic text-center mt-5">
                                    <img src={Profile} className="rounded-circle me-2" style={{ width: '100px', height: '100px' }} />
                                </div>
                                <div className="profile-name-card text-center mt-3">
                                    <h5>{user.name}</h5>
                                    <span>@{user.username}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-8">
                            <div className="mt-4 ms-3">
                                <div className="upper mb-5">
                                    <div className="row">
                                        <div className="upper-header mb-1">
                                            <h5>General Information</h5>
                                            <hr />
                                        </div>
                                        <div className="col-6">
                                            <h6>Balance
                                                <button className="btn btn-primary mx-2" style={{ fontSize: '12px' }} onClick={Topup}>Top Up</button></h6>
                                            <span>${FormatNumber(userDB.balance)}</span>
                                        </div>
                                        <div className="col-6">
                                            <h6>Linked Discord ID</h6>
                                            <span>{user.discord_id}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="down">
                                    <div className="row">
                                        <div className="down-header mb-1">
                                            <h5>Additional Information</h5>
                                            <hr />
                                        </div>
                                        <div className="col-6">
                                            <h6>Account User ID</h6>
                                            <span>{user.id}</span>
                                        </div>
                                        <div className="col-6">
                                            <h6>Role</h6>
                                            <span>{user.role === 2 ? "Administrator" : "User"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}