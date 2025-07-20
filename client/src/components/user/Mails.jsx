import React from "react";
import flatpickr from "flatpickr";
import { useNavigate } from "react-router-dom";

import axios from "../../utils/axios";
import { HumanizeTimestamp } from "../../utils/Format";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function Mails() {
    const [selectedDate, setSelectedDate] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [mails, setMails] = React.useState([]);

    const datepickerRef = React.useRef(null);
    const navigate = useNavigate();

    function GetMails() {
        setLoading(true);
        axios({
            method: 'GET',
            url: '/api/my-mails'
        }).then(result => setMails(result.data.mails))
            .catch(err => console.log(err))
            .finally(_ => setLoading(false));
    }

    React.useEffect(() => {
        GetMails();
    }, []);

    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

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

    if (loading)
        return <div>Loading resources...</div>;

    return (
        <div>
            <div className="container-fluid mails" style={{ overflowY: 'hidden' }}>
                <div className="h-100 py-5 mx-5">
                    <div className="d-flex justify-content-center align-items-center h-100 flex-nowrap">
                        <div className="col-12">
                            <div className="row">
                                <div className="col-10">
                                    <div className="d-flex justify-content-between align-items-center mb-4 text-center">
                                        <h3 className="fw-normal mb-0">My Inbox</h3>
                                    </div>
                                </div>
                                <div className="col-2">
                                    <div className="">
                                        <input type="search" ref={datepickerRef} id="datepicker" className="form-control" placeholder="Select Date" />
                                    </div>
                                </div>
                            </div>
                            {
                                mails.length > 0 && mails.map(mail => (
                                    <div className="card mb-4" onClick={() => navigate(`/mails/${mail.id}`)} style={{ cursor: 'pointer' }}>
                                        <div className="card-body p-4">
                                            <div className="row d-flex justify-content-between align-items-center">
                                                <div className="col-md-1 text-center">
                                                    <i className="fas fa-envelope fa-3x text-secondary"></i>
                                                </div>
                                                <div className="col-md-8">
                                                    <p className="lead fw-normal mb-2">Title: {mail.title}</p>
                                                    <p><span className="text-muted">Click to view the message.</span></p>
                                                </div>
                                                <div className="col-md-3 text-end">
                                                    <p className="mb-5"><span>{HumanizeTimestamp(mail.createdAt)}</span></p>
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
        </div>
    );
}