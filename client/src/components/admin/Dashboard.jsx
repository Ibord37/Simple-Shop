import React from 'react';
import Swal from 'sweetalert2';

import { useNavigate } from 'react-router-dom';

import axios from '../../utils/axios';

import { FormatNumber, HumanizeTimestamp, CapitalizeFront } from '../../utils/Format';

import '../../../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';

import './Insider.css';

export default function Dashboard() {
    const navigate = useNavigate();

    const [search, setSearch] = React.useState('');
    const [searchT, setSearchT] = React.useState('');
    const [selection, setSelection] = React.useState('by_name');

    const [items, setItems] = React.useState([]);
    const [transactions, setTransactions] = React.useState([]);

    const [data, setData] = React.useState({
        items_total: 0,
        sales_total: 0,
        expense_total: 0,
        income_total: 0,
        profit_total: 0,
        inv_items: 0,
        networth: 0
    });

    function GetItem(search_query, search_type = "") {
        const by_name = search_type === 'by_name';

        axios({
            method: 'GET',
            url: '/api/stocks',
            params: {
                page: 1, limit: 5, search: search_query, by_name, empty_only: true
            }
        }).then(result => {
            setItems(result.data.items);
        })
            .catch(err => console.log(err));
    }

    function GetTransaction(search = '') {
        axios({
            method: 'GET',
            url: '/api/transactions',
            params: {
                page: 1, limit: 5, search
            }
        }).then(result => {
            setTransactions(result.data.transactions);
        }).catch(err => console.log(err));
    }

    async function RestockItem(item) {
        const result = await Swal.fire({
            title: "Input new stock quantity.",
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Restock",
            preConfirm: (amount) => {
                if (!amount || isNaN(amount) || Number(amount) <= 0) {
                    Swal.showValidationMessage("Please enter a valid number or more than zero.");
                }
                return amount;
            }
        });

        if (result.isConfirmed) {
            try {
                item.item_quantity = Number(result.value);
                await axios.put(`/api/stock_update/${item.id}`, item);

                Swal.fire({
                    title: "Operation Success.",
                    text: `Item with code ${item.item_code} has been restocked.`,
                    icon: "success"
                });

                GetItem(search);
            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something is wrong when trying to add item.",
                    footer: err.response?.data?.message || ""
                });
            }
        }
    }

    React.useEffect(() => {
        GetItem(search, selection);
    }, [search, selection]);

    React.useEffect(() => {
        GetTransaction(searchT);
    }, [searchT]);

    React.useEffect(() => {
        axios({
            method: 'GET',
            url: '/api/dashboard'
        }).then(result => {
            setData(result.data);
        }).catch(err => {
            console.log(err);
        });
    }, []);

    return (
        <div className="main-content">
            <div className="container-fluid mb">
                <div className="row sm-12 mb-3">
                    <h2 className='text-left'>Dashboard</h2>
                </div>
                <div className="card">
                    <div className="card-header bg-primary text-white">
                        <h3 className="card-title">Summary of Current Inventory</h3>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-12 col-sm-6 col-md-6">
                                <div className="info-box d-flex align-items-center py-3 mb-3" style={{ background: '#FFFFFF', border: '1px solid #ccc', borderRadius: '8px' }}>
                                    <span className="info-box-icon bg-success d-flex align-items-center justify-content-center elevation-1 mx-3" style={{ fontSize: '20px', padding: '16px 20px' }}><i className="fas fa-box"></i></span>
                                    <div className="info-box-content">
                                        <div className="fw">Inventory Items Count</div>
                                        <div className="fw-bold">{FormatNumber(data.inv_items)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-md-6">
                                <div className="info-box d-flex align-items-center py-3 mb-3" style={{ background: '#FFFFFF', border: '1px solid #ccc', borderRadius: '8px' }}>
                                    <span className="info-box-icon bg-warning d-flex align-items-center justify-content-center elevation-1 mx-3" style={{ fontSize: '20px', padding: '16px 20px' }}><i className="fas fa-box"></i></span>
                                    <div className="info-box-content">
                                        <div className="fw">Stock Count</div>
                                        <div className="fw-bold">{FormatNumber(data.stock_count)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-md-6">
                                <div className="info-box d-flex align-items-center py-3 mb-3" style={{ background: '#FFFFFF', border: '1px solid #ccc', borderRadius: '8px' }}>
                                    <span className="info-box-icon bg-success d-flex align-items-center justify-content-center elevation-1 mx-3" style={{ fontSize: '20px', padding: '16px 20px' }}><i className="fas fa-wallet"></i></span>
                                    <div className="info-box-content">
                                        <div className="fw">Networth Estimation</div>
                                        <div className="fw-bold">${FormatNumber(data.networth)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-md-6">
                                <div className="info-box d-flex align-items-center py-3 mb-3" style={{ background: '#FFFFFF', border: '1px solid #ccc', borderRadius: '8px' }}>
                                    <span className="info-box-icon bg-warning d-flex align-items-center justify-content-center elevation-1 mx-3" style={{ fontSize: '20px', padding: '16px 17px' }}><i className="fas fa-store"></i></span>
                                    <div className="info-box-content">
                                        <div className="fw">Total Items Sold</div>
                                        <div className="fw-bold">{FormatNumber(data.items_total)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-md-6">
                                <div className="info-box d-flex align-items-center py-3 mb-3" style={{ background: '#FFFFFF', border: '1px solid #ccc', borderRadius: '8px' }}>
                                    <span className="info-box-icon bg-success d-flex align-items-center justify-content-center elevation-1 mx-3" style={{ fontSize: '20px', padding: '16px 18px' }}><i className="fas fa-cash-register"></i></span>
                                    <div className="info-box-content">
                                        <div className="fw">Sales Total</div>
                                        <div className="fw-bold">${FormatNumber(data.sales_total)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-md-6">
                                <div className="info-box d-flex align-items-center py-3 mb-3" style={{ background: '#FFFFFF', border: '1px solid #ccc', borderRadius: '8px' }}>
                                    <span className="info-box-icon bg-warning d-flex align-items-center justify-content-center elevation-1 mx-3" style={{ fontSize: '20px', padding: '16px 20px' }}><i className="fas fa-file-lines"></i></span>
                                    <div className="info-box-content">
                                        <div className="fw">Transactions Total</div>
                                        <div className="fw-bold">{FormatNumber(data.transaction_count)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-md-6">
                                <div className="info-box d-flex align-items-center py-3 mb-3" style={{ background: '#FFFFFF', border: '1px solid #ccc', borderRadius: '8px' }}>
                                    <span className="info-box-icon bg-success d-flex align-items-center justify-content-center elevation-1 mx-3" style={{ fontSize: '20px', padding: '16px 17px' }}><i className="fas fa-folder-closed"></i></span>
                                    <div className="info-box-content">
                                        <div className="fw">Success Transactions</div>
                                        <div className="fw-bold">{FormatNumber(data.success_count)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-md-6">
                                <div className="info-box d-flex align-items-center py-3 mb-3" style={{ background: '#FFFFFF', border: '1px solid #ccc', borderRadius: '8px' }}>
                                    <span className="info-box-icon bg-warning d-flex align-items-center justify-content-center elevation-1 mx-3" style={{ fontSize: '20px', padding: '16px 17px' }}><i className="fas fa-folder-closed"></i></span>
                                    <div className="info-box-content">
                                        <div className="fw">Pending Transactions</div>
                                        <div className="fw-bold">{FormatNumber(data.pending_count)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-md-6">
                                <div className="info-box d-flex align-items-center py-3 mb-3" style={{ background: '#FFFFFF', border: '1px solid #ccc', borderRadius: '8px' }}>
                                    <span className="info-box-icon bg-danger d-flex align-items-center justify-content-center elevation-1 mx-3" style={{ fontSize: '20px', padding: '16px 17px' }}><i className="fas fa-folder-closed"></i></span>
                                    <div className="info-box-content">
                                        <div className="fw">Failed Transactions</div>
                                        <div className="fw-bold">{FormatNumber(data.failed_count)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h3 className="card-title">Recent Empty Stocks</h3>
                            </div>
                            <div className="card-body">
                                <form className="d-flex align-items-center justify-content-end">
                                    <select
                                        className="form-select form-select-lg mt-2 mb-2 mx-3"
                                        aria-label=".form-select-lg example"
                                        value={selection}
                                        onChange={(e) => setSelection(e.target.value)}
                                        style={{ fontSize: '15px' }}
                                    >
                                        <option value="">Filter Search</option>
                                        <option value="by_name">By Name</option>
                                        <option value="by_code">By Code</option>
                                    </select>
                                    <input
                                        className="form-control me-2"
                                        style={{ width: '60%' }}
                                        type="search"
                                        placeholder="Search"
                                        aria-label="Search"
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <button className="btn btn-outline-success" type="submit"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            GetItem(search, selection);
                                        }}>
                                        <i className="fas fa-magnifying-glass"></i>
                                    </button>
                                </form>
                                <div className="item-table mt-3" style={{ width: '100%' }}>
                                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>Item Code</th>
                                                <th>Item Name</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                            {
                                                items.length === 0 ?
                                                    <tr>
                                                        <td colSpan="3">No item found in the table.</td>
                                                    </tr>
                                                    :
                                                    items.map(item => (
                                                        <tr>
                                                            <td>{item.item_code}</td>
                                                            <td>{item.item_name}</td>
                                                            <td>
                                                                <button className="btn btn-primary" onClick={() => RestockItem(item)}>Restock</button>
                                                            </td>
                                                        </tr>
                                                    ))
                                            }
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <th>Item Code</th>
                                                <th>Item Name</th>
                                                <th>Action</th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                    <div className="mt-3">
                                        <button className="btn btn-primary" onClick={() => navigate('/admin/stocks')}>View Stocks</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h3 className="card-title">Recent Transactions</h3>
                            </div>
                            <div className="card-body">
                                <form className="d-flex align-items-center justify-content-end">
                                    <input
                                        className="form-control me-2"
                                        style={{ width: '25%' }}
                                        type="search"
                                        placeholder="Search"
                                        aria-label="Search"
                                        onChange={(e) => setSearchT(e.target.value)}
                                    />
                                    <button className="btn btn-outline-success" type="submit" onClick={(e) => {
                                        e.preventDefault();
                                        GetTransaction(searchT);
                                    }}>
                                        <i className="fas fa-magnifying-glass"></i>
                                    </button>
                                </form>
                                {
                                    /* 
                                    <div className="row mx-1 mt-3">
                                    <input type="text" id="datepicker" className="form-control" placeholder="Select Date" />
                                </div>
                                    */
                                }
                                <div className="item-table mt-3" style={{ width: '100%' }}>
                                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Issuer</th>
                                                <th>Created at</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                transactions.length === 0 ?
                                                    <tr>
                                                        <td colSpan="4">No item found in the table.</td>
                                                    </tr>
                                                    :
                                                    transactions.map(transaction => (
                                                        (
                                                            <tr>
                                                                <td>#{transaction.id}</td>
                                                                <td>{transaction.issuer}</td>
                                                                <td>{HumanizeTimestamp(transaction.createdAt)}</td>
                                                                <td>{CapitalizeFront(transaction.status)}</td>
                                                            </tr>
                                                        )
                                                    ))
                                            }
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <th>ID</th>
                                                <th>Issuer</th>
                                                <th>Created at</th>
                                                <th>Status</th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                    <div className="mt-3">
                                        <button className="btn btn-primary" onClick={() => navigate('/admin/transactions')}>View Transactions</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}