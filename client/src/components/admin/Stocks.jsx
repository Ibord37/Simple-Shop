import React from 'react';
import Swal from 'sweetalert2';
import { ToSquare } from '../../utils/Image';

import axios from '../../utils/axios';

import { FormatNumber } from '../../utils/Format';

export default function Stocks() {
    const [current, setCurrent] = React.useState(1);
    const [total, setTotal] = React.useState(0);

    const [search, setSearch] = React.useState('');
    const [selection, setSelection] = React.useState('by_name');

    const [items, setItems] = React.useState([]);
    const [file, setFile] = React.useState(null);
    const [editingItem, setEditingItem] = React.useState(null);
    const [only_empty, setOnlyEmpty] = React.useState(false);

    const page_limit = 5;
    const page_total = Math.ceil(total / page_limit);

    const visible_limit = 5;
    const half = Math.floor(visible_limit / 2);

    let start = Math.max(1, current - half);
    let end = Math.min(page_total, start + visible_limit - 1);

    if (end - start + 1 < visible_limit)
        start = Math.max(1, end - visible_limit + 1);

    function GetItem(page, search = '', search_type = 'by_name', empty_only = false) {
        const by_name = search_type === 'by_name';

        axios({
            method: 'GET',
            url: '/api/stocks',
            params: {
                page, limit: page_limit, search, by_name, empty_only
            }
        }).then(result => {
            setItems(result.data.items);
            setCurrent(result.data.page);
            setTotal(result.data.total);
        }).catch(err => console.log(err));
    }

    function Paginate(page) {
        setCurrent(page);
    }

    function HandleEdit(id) {
        const item = items.find(i => i.id === id);
        setEditingItem({ ...item });
    }

    async function HandleSave() {
        if (!editingItem) return;

        try {
            let file_name = editingItem.item_display;

            if (file) {
                const form_data = new FormData();
                const compressed_file = await ToSquare(file, 800, 1);

                console.log(file_name);
                await axios.delete(`/api/delete-file/${file_name}`);

                file_name = compressed_file.name;

                const renamed_file = new File([compressed_file], file_name, {
                    type: compressed_file.type,
                    lastModified: Date.now(),
                });

                form_data.append('file', renamed_file);

                const res = await axios.post('/api/upload', form_data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                file_name = res.data.fileUrl;
            }

            const edit_item = { ...editingItem, item_display: file_name };

            await axios.put(`/api/stock_update/${editingItem.id}`, edit_item);

            Swal.fire("Saved!", "Item has been updated.", "success");

            setFile(null); 
            setEditingItem(null); 
            
            GetItem(current, search, selection, only_empty);
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
                footer: `Error: ${err.response?.data?.message || err.message}`
            });
        }
    }

    async function HandleDelete(id) {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/stock_rm/${id}`);
                Swal.fire({
                    title: "Deleted!",
                    text: "Item has been removed from inventory.",
                    icon: "success"
                });
                GetItem(current, search, selection, only_empty);
            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong!",
                    footer: `Error: ${err.response?.data?.message}`
                });
            }
        }
    }

    React.useEffect(() => {
        GetItem(current, search, selection, only_empty);
    }, [current, search, selection, only_empty]);

    return (
        <div className="main-content">
            <div className="container-fluid">
                <div className="row sm-12 mb-3">
                    <h2 className='text-left'>Stocks</h2>
                </div>
                <div className="card" style={{ minHeight: '40vh', maxHeight: '80vh' }}>
                    <div className="card-header bg-primary text-white">
                        <h3 className="card-title">Inventory Items</h3>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <form className="d-flex align-items-center justify-content-end">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked={only_empty}
                                        onChange={(e) => {
                                            setOnlyEmpty(e.target.checked);
                                            GetItem(current, search, selection, only_empty);
                                        }} />
                                    <label className="form-check-label" htmlFor="flexCheckChecked">
                                        Empty Stocks Only
                                    </label>
                                </div>
                                <select
                                    className="form-select form-select-lg mt-2 mb-2 mx-3"
                                    aria-label=".form-select-lg example"
                                    value={selection}
                                    onChange={(e) => setSelection(e.target.value)}
                                    style={{ width: '15%', fontSize: '15px' }}
                                >
                                    <option value="">Filter Search</option>
                                    <option value="by_name">By Name</option>
                                    <option value="by_code">By Code</option>
                                </select>
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
                                    GetItem(current, search, selection);
                                }}>
                                    <i className="fas fa-magnifying-glass"></i>
                                </button>
                            </form>

                            <div className="item-table mt-3" style={{ width: '100%' }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead style={{ textAlign: 'center' }}>
                                        <tr>
                                            <th style={{ width: '8%' }}>Item ID</th>
                                            <th style={{ width: '20%' }}>Name</th>
                                            <th style={{ width: '7%' }}>Quantity</th>
                                            <th style={{ width: '13%' }}>Items Per Price</th>
                                            <th style={{ width: '12%' }}>Price</th>
                                            <th style={{ width: '20%' }}>Code</th>
                                            <th style={{ width: '20%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            items.length === 0 ?
                                                <tr className="text-center">
                                                    <td colSpan="6">No item found in the table.</td>
                                                </tr>
                                                :
                                                items.map(item => (
                                                    (
                                                        <tr>
                                                            <td>{item.id}</td>
                                                            <td>{item.item_name}</td>
                                                            <td>{item.item_quantity === -1 ? "Infinity" : FormatNumber(item.item_quantity)}</td>
                                                            <td>{FormatNumber(item.items_per_price)} pcs</td>
                                                            <td>${FormatNumber(item.sell_price)}</td>
                                                            <td>{item.item_code}</td>
                                                            <td>
                                                                <>
                                                                    <button className="btn btn-primary mx-2" data-bs-toggle="modal" data-bs-target="#exampleModal" data-target="#exampleModal" onClick={() => HandleEdit(item.id)}>Edit</button>
                                                                    <button className="btn btn-danger" onClick={() => HandleDelete(item.id)}>Delete</button>
                                                                </>
                                                            </td>
                                                        </tr>
                                                    )
                                                ))
                                        }
                                        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                            <div className="modal-dialog">
                                                <div className="modal-content">
                                                    <div className="modal-header">
                                                        <h5 className="modal-title" id="exampleModalLabel">Edit Item</h5>
                                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                    </div>
                                                    <div className="modal-body">
                                                        {editingItem && (
                                                            <form>
                                                                <div className="mb-3">
                                                                    <label className="form-label">Item Name</label>
                                                                    <input type="text" className="form-control" value={editingItem.item_name}
                                                                        onChange={(e) => setEditingItem({ ...editingItem, item_name: e.target.value })} />
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label className="form-label">Stock List (code_1, code_2, ...)</label>
                                                                    <input type="text" className="form-control" value={editingItem.items_list.join(', ')}
                                                                        onChange={(e) => setEditingItem({ ...editingItem, items_list: e.target.value.split(",").map(x => x.trim()) })} />
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label className="form-label">Items per Price</label>
                                                                    <input type="number" className="form-control" value={editingItem.items_per_price}
                                                                        onChange={(e) => setEditingItem({ ...editingItem, items_per_price: +e.target.value })} />
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label className="form-label">Price</label>
                                                                    <input type="number" className="form-control" value={editingItem.sell_price}
                                                                        onChange={(e) => setEditingItem({ ...editingItem, sell_price: +e.target.value })} />
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label className="form-label">Item Code</label>
                                                                    <input type="text" className="form-control" value={editingItem.item_code}
                                                                        onChange={(e) => setEditingItem({ ...editingItem, item_code: e.target.value })} />
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label className="form-label">Item Display - Current: {editingItem.item_display}</label>
                                                                    <input type="file" className="form-control"
                                                                        onChange={(e) => setFile(e.target.files[0])} />
                                                                </div>
                                                            </form>
                                                        )}
                                                    </div>
                                                    <div className="modal-footer">
                                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={HandleSave}>Save Changes</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </tbody>
                                    <tfoot className="mb-2" style={{ textAlign: 'center' }}>
                                        <tr>
                                            <th style={{ width: '8%' }}>Item ID</th>
                                            <th style={{ width: '20%' }}>Name</th>
                                            <th style={{ width: '7%' }}>Quantity</th>
                                            <th style={{ width: '13%' }}>Items Per Price</th>
                                            <th style={{ width: '12%' }}>Price</th>
                                            <th style={{ width: '20%' }}>Code</th>
                                            <th style={{ width: '20%' }}>Action</th>
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