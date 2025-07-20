import React from "react";
import Swal from 'sweetalert2';

import '../../../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';

import axios from '../../utils/axios';

export default function MailSender() {
    const [validated, setValidated] = React.useState(false);
    const [mail, setMail] = React.useState({
        recipient_user: '',
        title: '',
        content: ''
    });

    const input_ref = React.useRef(null);

    const SetTextDecoration = (e, deco) => {
        e.preventDefault();
        const input = input_ref.current;
        if (input) {
            const { selectionStart, selectionEnd, value } = input;
            const selected = value.substring(selectionStart, selectionEnd);

            let formatted = '';

            switch (deco) {
                case 'bold': {
                    formatted = `**${selected}**`;
                    break;
                }
                case 'italic': {
                    formatted = `*${selected}*`;
                    break;
                }
                case 'underline': {
                    formatted = `__${selected}__`;
                    break;
                }
                default: break;
            }
            input.value = value.substring(0, selectionStart) + formatted + value.substring(selectionEnd);
            input.selectionStart = selectionStart;
            input.selectionEnd = selectionStart + formatted.length;

            input.focus();
        }
    }

    const HandleSubmit = async (event) => {
        event.preventDefault();

        const form = event.currentTarget;

        if (!form.checkValidity()) {
            event.stopPropagation();
            setValidated(false);

            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Title or Content can't be empty."
            });

            return;
        }

        setValidated(true);

        try {
            axios({
                method: 'POST',
                url: `/api/send-${mail.recipient_user.trim() === '' ? "broadcast" : "mail"}`,
                data: mail
            }).then(result => {
                Swal.fire({
                    icon: result.status === 200 ? "success" : "error",
                    title: result.status === 200 ? "Success!" : "Oops...",
                    text: result.data?.message
                });
            }).catch(err => {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something is wrong when trying to send mail.",
                    footer: err.response?.data?.message
                });
            })
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something is wrong when trying to send mail.",
                footer: err.response?.data?.message
            });
        }
    };

    return (
        <div className="main-content">
            <div className="container-fluid">
                <div className="row sm-12 mb-3">
                    <h2 className='text-left'>Compose Mail / Broadcast</h2>
                </div>

                <div className="card">
                    <div className="card-header bg-primary text-white">
                        <h3 className="card-title">Compose Mail / Broadcast</h3>
                    </div>
                    <div className="card-body">
                        <form noValidate className={validated ? "was-validated" : ""} onSubmit={(e) => HandleSubmit(e)}>
                            <div className="input-data mt-2 mb-2">
                                <label htmlFor="recipient_username" className="faw fw-bold">Recipient Username (Ignore if broadcast)</label>
                                <div className="input-group mt-2">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <i className="fas fa-user" style={{ padding: '4px' }}></i>
                                        </span>
                                    </div>
                                    <input type="text" className="form-control" placeholder="Recipient Username"
                                        onChange={(e) => setMail({ ...mail, recipient_user: e.target.value })} />
                                </div>
                            </div>
                            <div className="input-data mt-2">
                                <label htmlFor="mail_title" className="faw fw-bold">Mail Title</label>
                                <div className="input-group mt-2">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <i className="fas fa-envelope" style={{ padding: '4px' }}></i>
                                        </span>
                                    </div>
                                    <input type="text" className="form-control" placeholder="Mail Title"
                                        onChange={(e) => setMail({ ...mail, title: e.target.value })} required />
                                </div>
                            </div>
                            <div className="input-data mt-2">
                                <label htmlFor="mail_content" className="faw fw-bold">Mail Content</label>
                                <div className="input-group mt-2">
                                    <textarea ref={input_ref} contentEditable suppressContentEditableWarning
                                        type="text" className="form-control" placeholder="Mail Message..."
                                        onChange={(e) => setMail({ ...mail, content: e.target.value })} required>
                                    </textarea>
                                </div>
                            </div>
                            <div className="text-buttons mt-2 ms-1">
                                <button className={`btn btn-primary mx-1`} style={{ padding: '8px' }}
                                    onClick={(e) => SetTextDecoration(e, 'bold')}>Bold</button>
                                <button className="btn btn-primary mx-1" style={{ padding: '8px' }}
                                    onClick={(e) => SetTextDecoration(e, 'italic')}>Italic</button>
                                <button className="btn btn-primary mx-1" style={{ padding: '8px' }}
                                    onClick={(e) => SetTextDecoration(e, 'underline')}>Underline</button>
                            </div>
                            <div className="card-footer mt-3 ms-0" style={{ height: '8vh' }}>
                                <button type="submit" className="btn btn-success" ><i className="fa fa-paper-plane me-2" aria-hidden="true"></i>Send Mail</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}