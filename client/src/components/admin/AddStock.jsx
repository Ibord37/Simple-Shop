import React from "react";
import Swal from 'sweetalert2';
import { ToSquare } from "../../utils/Image";

import axios from '../../utils/axios';

export default function AddStock() {
    const [file, setFile] = React.useState(null);
    const [validated, setValidated] = React.useState(false);
    const [item, setItem] = React.useState({
        item_name: '',
        item_quantity: 0,
        item_price: 0,
        item_code: '',
        items_per_price: 0,
        item_display: ''
    });

    const HandleSubmit = async (event) => {
        event.preventDefault();

        const form = event.currentTarget;

        if (!form.checkValidity()) {
            event.stopPropagation();
            setValidated(false);
            return;
        }

        setValidated(true);

        if (!file)
            throw new Error('No file selected.');

        const form_data = new FormData();
        const compressed_file = await ToSquare(file, 800, 1);

        const file_name = compressed_file.name;

        const renamed_file = new File([compressed_file], file_name, {
            type: compressed_file.type,
            lastModified: Date.now(),
        });

        form_data.append('file', renamed_file);

        try {
            const res = await axios.post('/api/upload', form_data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            const edit_item = { ...item, item_display: res.data.fileUrl };
            setItem(edit_item);

            axios.post('/api/stock_add', edit_item)
                .then(result => {
                Swal.fire({
                    title: 'Added Item!',
                    text: result.data?.message,
                    icon: 'success'
                });
            }).catch(err => {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something is wrong when trying to add item.",
                    footer: err.response?.data?.message
                });
            });
        } catch (err) {
            console.error(err);
            throw new Error("Failed to upload file.");
        }

        // send function
        // data: { item_name, item_quantity, item_price, item_code }
    };

    return (
        <div className="main-content">
            <div className="container-fluid">
                <div className="row sm-12 mb-3">
                    <h2 className='text-left'>Add Stock</h2>
                </div>

                <div className="card">
                    <div className="card-header bg-primary text-white">
                        <h3 className="card-title">Add Stock</h3>
                    </div>
                    <div className="card-body">
                        <form noValidate className={validated ? "was-validated" : ""} onSubmit={HandleSubmit}>
                            <div className="input-data mt-2 mb-2">
                                <label htmlFor="item_name" className="faw fw-bold">Item Name</label>
                                <div className="input-group mt-2">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <i className="fa-solid fa-box" style={{ padding: '4px' }}></i>
                                        </span>
                                    </div>
                                    <input type="text" className="form-control" placeholder="Item Name"
                                        onChange={(e) => setItem({ ...item, item_name: e.target.value })} required />
                                </div>
                            </div>
                            {/* {<div className="input-data mt-2">
                                <label htmlFor="item_quantity" className="faw fw-bold">Item Quantity (Set -1 to make infinity)</label>
                                <div className="input-group mt-2">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <i className="fa-solid fa-box" style={{ padding: '4px' }}></i>
                                        </span>
                                    </div>
                                    <input type="number" className="form-control" placeholder="Item Quantity" min="-1"
                                        onChange={(e) => setItem({ ...item, item_quantity: +e.target.value })} required />
                                </div>
                            </div>} */}
                            <div className="input-data mt-2">
                                <label htmlFor="item_code" className="faw fw-bold">Item Count per Price</label>
                                <div className="input-group mt-2">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <i className="fa-solid fa-box" style={{ padding: '4px' }}></i>
                                        </span>
                                    </div>
                                    <input type="text" className="form-control" placeholder="Item per Price"
                                        onChange={(e) => setItem({ ...item, items_per_price: +e.target.value })} required />
                                </div>
                            </div>
                            <div className="input-data mt-2">
                                <label htmlFor="item_price" className="faw fw-bold">Item Price</label>
                                <div className="input-group mt-2">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <i className="fa-solid fa-box" style={{ padding: '4px' }}></i>
                                        </span>
                                    </div>
                                    <input type="number" className="form-control" placeholder="Item Price" min="1"
                                        onChange={(e) => setItem({ ...item, item_price: +e.target.value })} required />
                                </div>
                            </div>
                            <div className="input-data mt-2">
                                <label htmlFor="item_code" className="faw fw-bold">Item Code</label>
                                <div className="input-group mt-2">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <i className="fa-solid fa-box" style={{ padding: '4px' }}></i>
                                        </span>
                                    </div>
                                    <input type="text" className="form-control" placeholder="Item Code"
                                        onChange={(e) => setItem({ ...item, item_code: e.target.value })} required />
                                </div>
                            </div>
                            <div className="input-data mt-2">
                                <label htmlFor="items_list" className="faw fw-bold">Stock List (code_1, code_2, ...)</label>
                                <div className="input-group mt-2">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <i className="fa-solid fa-box" style={{ padding: '4px' }}></i>
                                        </span>
                                    </div>
                                    <input type="text" className="form-control" placeholder="Item Code"
                                        onChange={(e) => setItem({ ...item, 
                                            items_list: e.target.value.split(',').map(x => x.trim()) })} required />
                                </div>
                            </div>
                            <div className="input-data mt-2">
                                <label htmlFor="item_file" className="faw fw-bold">Item Display</label>
                                <div className="input-group mt-2">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <i className="fa-solid fa-image" style={{ padding: '4px' }}></i>
                                        </span>
                                    </div>
                                    <input type="file" accept=".png,.jpeg,.jpg" className="form-control" placeholder="Item Code"
                                        onChange={(e) => setFile(e.target.files[0])} required />
                                </div>
                            </div>
                            <div className="card-footer mt-2" style={{ height: '8vh' }}>
                                <button type="submit" className="btn btn-success">Add Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}