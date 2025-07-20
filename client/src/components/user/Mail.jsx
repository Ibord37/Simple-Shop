import React from "react";
import { useParams } from "react-router-dom";

import axios from "../../utils/axios";
import { HumanizeTimestamp, RenderMail } from "../../utils/Format";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './User.css';

export default function Mail() {
    const [mail, setMail] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const id = +useParams().id;

    function GetMail() {
        setLoading(true);

        axios({
            method: 'GET',
            url: `/api/my-mails/${id}`
        }).then(result => setMail(result.data.mail))
            .catch(err => console.log(err))
            .finally(_ => setLoading(false));
    }

    React.useEffect(() => {
        GetMail();
    }, []);

    if (loading || !mail)
        return <div>Loading Resources...</div>;

    return (
        <div>
            <div className="container-fluid mail">
                <div className="d-flex h-100 justify-content-center align-items-center flex-nowrap" style={{ flexDirection: 'column' }}>
                    <div className="email-header my-4 w-100">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="text-start">
                                <h3>Title: {mail.title}</h3>
                                <h6 className="ms-1">From: {mail.sender}</h6>
                            </div>
                            <div className="text-end text-nowrap">
                                <span>{HumanizeTimestamp(mail.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="email-body w-100">
                        <div className="mail-body-head m-1">
                            <h5>Message</h5>
                        </div>
                        <div className="mail-text-box">
                            <RenderMail content={mail.content} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}