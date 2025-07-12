import React from "react";
import Swal from "sweetalert2";
import flatpickr from "flatpickr";

import axios from "../../utils/axios";

import { FormatNumber, CapitalizeFront, HumanizeTimestamp, Cleanup } from "../../utils/Format";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import '../../../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css';

export default function Transactions() {
    const [transactions, setTransactions] = React.useState([]);
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const [selectedDate, setSelectedDate] = React.useState(null);
    const datepickerRef = React.useRef(null);

    React.useEffect(() => {
        const input = datepickerRef.current;
        const fp = flatpickr(input, {
            dateFormat: 'Y-m-d',
            allowInput: true,
            //defaultDate: new Date(),
            onChange: function (selectedDates, dateStr) {
                setSelectedDate(dateStr);
            },
            onValueUpdate: function (selectedDates, dateStr) {
                setSelectedDate(dateStr);
            }
        });

        datepickerRef.current = fp;

        const HandleInput = () => {
            if (input.value === '') {
                setSelectedDate('');
                fp.clear();
            }
        };

        input.addEventListener('input', HandleInput);

        return () => {
            fp.destroy();
            input.removeEventListener('input', HandleInput);
        };
    }, []);

    function GetTransaction(date) {
        axios({
            method: 'GET',
            url: '/api/my-transactions',
            params: {
                date
            }
        }).then(result => {
            setTransactions(result.data.transactions);
        }).catch(err => console.log(err));
    }

    function HandlePay(id) {
        setLoading(true);

        axios({
            method: 'PUT',
            url: `/api/transaction_finish/${id}`
        }).then(result => {
            if (result.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: result.data?.message
                });
                GetTransaction(selectedDate);
            }
            else
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong!",
                    footer: result.data?.message
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

    function HandleDetail(transaction) {
        Swal.fire({
            title: "Transaction Data",
            icon: "info",
            html: `
                <div style="width:100%;display:flex;text-align:left;justify-content:center;">
                    Transaction ID: #${transaction.id}<br/>
                    Created at: ${HumanizeTimestamp(transaction.createdAt)}<br/>
                    Expired at: ${HumanizeTimestamp(transaction.expiresAt)}<br/>
                    Paid at: ${HumanizeTimestamp(transaction.updatedAt)}<br/>
                    Amount: $${FormatNumber(transaction.price)}<br/>
                    Received items: ${FormatItem(transaction.items)}<br/>
                    Payment Method: ${Cleanup(transaction.payment)}<br/>
                </div>
            `,
            showCloseButton: true,
            focusConfirm: false,
            confirmButtonText: "OK",
        });
    }

    React.useEffect(() => {
        GetTransaction(selectedDate);
    }, [selectedDate]);

    function GetItem() {
        axios({
            method: 'GET',
            url: '/api/stocks',
            params: {
                page: 1, limit: -1, search: '', by_name: true, empty_only: false
            }
        }).then(result => {
            setItems(result.data.items);
            //setTotal(result.data.total);
        }).catch(err => {
            console.log(err);
        });
    }

    React.useEffect(() => {
        GetItem();
    }, []);

    const item_map = React.useMemo(() => {
        const map = {};
        items.forEach(item => {
            map[item.id] = item;
        });
        return map;
    }, [items]);

    function FormatItem(items) {
        return items.map(item => {
            const meta = item_map[item.item_id];
            if (!meta && item.item_type !== "coin") 
                return `x${FormatNumber(item.item_count)} Item ${item.item_id}`;
            return item.item_type === "coin" ? `x${FormatNumber(item.item_count)} Untitled Coins` : `x${FormatNumber(item.item_count)} ${meta.item_name} (${meta.item_code})`;
        }).join(', ');
    }

    /*
    type: "Purchase",
                items: items.join(", "),
                status: "pending",
                issuer,
                price,
                expiresAt: new Date(Date.now() + 300000)
    */

    return (
        <div className="container-fluid transactions">
            <div className="h-100 py-5 mx-5">
                <div className="d-flex justify-content-center align-items-center h-100 flex-nowrap">
                    <div className="col-12">
                        <div className="row">
                            <div className="col-10">
                                <div className="d-flex justify-content-between align-items-center mb-4 text-center">
                                    <h3 className="fw-normal mb-0">My Transactions</h3>
                                </div>
                            </div>
                            <div className="col-2">
                                <div className="">
                                    <input type="search" ref={datepickerRef} id="datepicker" className="form-control" placeholder="Select Date" />
                                </div>
                            </div>
                        </div>
                        {
                            transactions.length > 0 && transactions.map(transaction => (
                                <div className="card mb-4">
                                    <div className="card-body p-4">
                                        <div className="row d-flex justify-content-between align-items-center">
                                            <div className="col-md-1 text-center">
                                                <i className={`fas fa-${transaction.type === 'Recharge' ? 'wallet' : 'box'} fa-3x text-secondary`}></i>
                                            </div>
                                            <div className="col-md-4">
                                                <p className="lead fw-normal mb-2">{transaction.type} (Payment: {Cleanup(transaction.payment)})</p>
                                                <p><span className="text-muted">Details: </span>{FormatItem(transaction.items)}</p>
                                            </div>
                                            <div className="col-md-2 text-nowrap">
                                                <p className="lead fw-normal mb-2">Status: {CapitalizeFront(transaction.status)}</p>
                                                <p>Expires at: {HumanizeTimestamp(transaction.expiresAt)}</p>
                                            </div>
                                            <div className="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                                                <h5>Amount</h5>
                                                <h5 className="mb-0">${FormatNumber(transaction.price)}</h5>
                                            </div>
                                            <div className="col-md-1 text-end">
                                                {
                                                    transaction.status?.toLowerCase() === 'pending' &&
                                                    <button className="btn btn-primary" onClick={() => HandlePay(transaction.id)} disabled={loading}>
                                                        Pay
                                                    </button>
                                                }
                                                {
                                                    transaction.status?.toLowerCase() === 'success' &&
                                                    <button className="btn btn-primary" onClick={() => HandleDetail(transaction)} disabled={loading}>
                                                        Details
                                                    </button>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}