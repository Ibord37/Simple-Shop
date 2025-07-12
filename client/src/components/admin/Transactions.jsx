import React from "react";
import flatpickr from "flatpickr";

import axios from "../../utils/axios";

import { Cleanup, HumanizeTimestamp, CapitalizeFront, FormatNumber } from "../../utils/Format";

import "flatpickr/dist/flatpickr.min.css";

export default function Transactions() {
    const [transactions, setTransactions] = React.useState([]);
    const [current, setCurrent] = React.useState(1);
    const [total, setTotal] = React.useState(0);

    const [items, setItems] = React.useState([]);

    const [search, setSearch] = React.useState('');

    const [selectedDate, setSelectedDate] = React.useState(null);
    const datepickerRef = React.useRef(null);

    const page_limit = 5;
    const page_total = Math.ceil(total / page_limit);

    const visible_limit = 5;
    const half = Math.floor(visible_limit / 2);

    let start = Math.max(1, current - half);
    let end = Math.min(page_total, start + visible_limit - 1);

    if (end - start + 1 < visible_limit)
        start = Math.max(1, end - visible_limit + 1);

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

    function GetTransaction(page, date, search = '') {
        axios({
            method: 'GET',
            url: '/api/transactions',
            params: {
                page, limit: page_limit, search, date
            }
        }).then(result => {
            setTransactions(result.data.transactions);
            setCurrent(result.data.page);
            setTotal(result.data.total);
        }).catch(err => console.log(`${err.response?.data?.message || err.message}`));
    }

    function FormatItem(items) {
        return items.map(item => {
            const meta = item_map[item.item_id];
            if (!meta && item.item_type !== "coin")
                return `x${FormatNumber(item.item_count)} Item ${item.item_id}`;
            return item.item_type === "coin" ? `x${FormatNumber(item.item_count)} Untitled Coins` : `x${FormatNumber(item.item_count)} ${meta.item_name} (${meta.item_code})`;
        }).join(', ');
    }

    function Paginate(page) {
        setCurrent(page);
    }

    React.useEffect(() => {
        GetTransaction(current, selectedDate, search);
    }, [current, selectedDate, search]);

    return (
        <div className="main-content">
            <div className="container-fluid">
                <div className="row sm-12 mb-3">
                    <h2 className="text-left">Transaction Data</h2>
                </div>
                <div className="card">
                    <div className="card-header bg-primary text-white">
                        <h3 className="card-title">Table of Transaction Data</h3>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <form className="d-flex align-items-center justify-content-end">
                                <div className="row mx-2">
                                    <input type="search" ref={datepickerRef} id="datepicker" className="form-control" placeholder="Select Date" />
                                </div>
                                <input
                                    className="form-control me-2"
                                    style={{ width: '20%' }}
                                    type="search"
                                    placeholder="Search"
                                    aria-label="Search"
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button className="btn btn-outline-success" type="submit" onClick={(e) => {
                                    e.preventDefault();
                                    GetTransaction(current, selectedDate, search);
                                }}>
                                    <i className="fas fa-magnifying-glass"></i>
                                </button>
                            </form>

                            <div className="item-table mt-3" style={{ width: '100%' }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '5%' }}>ID</th>
                                            <th style={{ width: '35%' }}>Details</th>
                                            <th style={{ width: '15%' }}>Payment</th>
                                            <th style={{ width: '15%' }}>Created at</th>
                                            <th style={{ width: '15%' }}>Expired at</th>
                                            <th style={{ width: '15%' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            transactions.length === 0 ?
                                                <tr className="text-center">
                                                    <td colSpan="6">No item found in the table.</td>
                                                </tr>
                                                :
                                                transactions.map(transaction => (
                                                    (
                                                        <tr>
                                                            <td>#{transaction.id}</td>
                                                            <td>{transaction.issuer} {transaction.type.toLowerCase() + 's'} {FormatItem(transaction.items)} for ${FormatNumber(transaction.price)}.</td>
                                                            <td>{Cleanup(transaction.payment)}</td>
                                                            <td>{HumanizeTimestamp(transaction.createdAt)}</td>
                                                            <td>{HumanizeTimestamp(transaction.expiresAt)}</td>
                                                            <td>{CapitalizeFront(transaction.status)}</td>
                                                        </tr>
                                                    )
                                                ))
                                        }
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th style={{ width: '5%' }}>ID</th>
                                            <th style={{ width: '35%' }}>Details</th>
                                            <th style={{ width: '15%' }}>Payment</th>
                                            <th style={{ width: '15%' }}>Created at</th>
                                            <th style={{ width: '15%' }}>Expired at</th>
                                            <th style={{ width: '15%' }}>Status</th>
                                        </tr>
                                    </tfoot>
                                </table>

                                <nav aria-label="Page navigation" className="mt-3">
                                    <ul className="pagination">
                                        <li className={`page-item ${current === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => Paginate(1)}>&laquo;&laquo;</button>
                                        </li>

                                        <li className={`page-item ${current === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => Paginate(current - 1)}>&laquo;</button>
                                        </li>

                                        {
                                            Array.from({ length: end - start + 1 }, (_, i) => start + i).map((page) => (
                                                <li key={page} className={`page-item ${page === current ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => Paginate(page)}>{page}</button>
                                                </li>
                                            ))
                                        }

                                        <li className={`page-item ${current === page_total ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => Paginate(current + 1)}>&raquo;</button>
                                        </li>

                                        {/* Last */}
                                        <li className={`page-item ${current === page_total ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => Paginate(page_total)}>&raquo;&raquo;</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}