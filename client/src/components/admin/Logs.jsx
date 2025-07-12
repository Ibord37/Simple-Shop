import React from 'react';
import flatpickr from 'flatpickr';

import { HumanizeTimestamp } from "../../utils/Format";

import axios from '../../utils/axios';

import "flatpickr/dist/flatpickr.min.css";

export default function Logs() {
    const [logs, setLogs] = React.useState([]);

    const [current, setCurrent] = React.useState(1);
    const [total, setTotal] = React.useState(0);

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
        const fp = flatpickr(datepickerRef.current, {
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

        return () => {
            fp.destroy();
        };
    }, []);

    function GetLogs(page, date, search = '') {
        axios({
            method: 'GET',
            url: '/api/logs',
            params: {
                page, limit: page_limit, search, date
            }
        }).then(result => {
            setLogs(result.data.logs);
            setCurrent(result.data.page);
            setTotal(result.data.total);
        }).catch(err => console.log(err));
    }

    function Paginate(page) {
        setCurrent(page);
    }

    React.useEffect(() => {
        GetLogs(current, selectedDate, search);
    }, [current, selectedDate, search]);

    return (
        <div className="main-content">
            <div className="container-fluid">
                <div className="row sm-12 mb-3">
                    <h2 className='text-left'>User Logs</h2>
                </div>

                <div className="card">
                    <div className="card-header bg-primary text-white">
                        <h3 className="card-title">Showing User Logs</h3>
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
                                    GetLogs(current, selectedDate, search);
                                }}>
                                    <i className="fas fa-magnifying-glass"></i>
                                </button>
                            </form>

                            <div className="item-table mt-3" style={{ width: '100%' }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '10%' }}>Logs ID</th>
                                            <th style={{ width: '10%' }}>Issuer ID</th>
                                            <th style={{ width: '10%' }}>Issuer Name</th>
                                            <th style={{ width: '40%' }}>Action</th>
                                            <th style={{ width: '20%' }}>Time</th>
                                            <th style={{ width: '10%' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            logs.length === 0 ?
                                                <tr className="text-center">
                                                    <td colSpan="6">No item found in the table.</td>
                                                </tr>
                                                :
                                                logs.map(log => {
                                                    return (
                                                        <tr>
                                                            <td>#{log.id}</td>
                                                            <td>{log.issuer_id}</td>
                                                            <td>{log.issuer_name}</td>
                                                            <td>{log.details}</td>
                                                            <td>{HumanizeTimestamp(log.time)}</td>
                                                            <td>{log.success ? "Success" : "Failed"}</td>
                                                        </tr>
                                                    )
                                                })
                                        }
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th style={{ width: '10%' }}>Logs ID</th>
                                            <th style={{ width: '10%' }}>Issuer ID</th>
                                            <th style={{ width: '10%' }}>Issuer Name</th>
                                            <th style={{ width: '40%' }}>Action</th>
                                            <th style={{ width: '20%' }}>Time</th>
                                            <th style={{ width: '10%' }}>Status</th>
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
    );
}