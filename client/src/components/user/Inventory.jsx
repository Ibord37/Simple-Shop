import React from "react";
import Swal from "sweetalert2";

import axios from '../../utils/axios';
import { FormatNumber } from "../../utils/Format";

export default function MyInventory() {
    const [items, setItems] = React.useState([]);
    const [inv, setInv] = React.useState([]);

    const GetItem = () => {
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

    const GetDetails = (inv_data) => {
        let available_code = '';

        for (const x of inv_data.inv_items_list)
            available_code += `- ${x}<br/>`;

        Swal.fire({
            title: "Inventory Info",
            icon: "info",
            html: `
                <div style="width:100%;text-align:left;">
                    <div style="font-weight:bold; margin-bottom: 8px;text-align: center;">Available Codes:</div>
                    <div style="columns: 2; -webkit-columns: 2; -moz-columns: 2;">
                        ${available_code}
                    </div>
                </div>
            `,
            showCloseButton: true,
            focusConfirm: false,
            confirmButtonText: "OK",
        });
    }

    React.useEffect(() => {
        GetItem();
    }, []);

    React.useEffect(() => {
        const GetInv = () => {
            axios({
                method: 'GET',
                url: '/api/get-extra-db'
            }).then(result => {
                //console.log(result.data.user_db);
                setInv(result.data.user_db.inventory);
            }).catch(err => {
                console.log(err.response?.data?.message || err.message);
                setInv([]);
            });
        }

        GetInv();
    }, []);

    const actual_inv = React.useMemo(() => {
        if (!inv.length || !items.length) return [];
        return inv.map(item => {
            const stock = items.find(s => s.id === item.item_id);
            return {
                ...item,
                inv_items_list: item.items_list,
                ...stock
            };
        });
    }, [inv, items]);

    return (
        <div className="container-fluid inventory">
            <section className="h-100">
                <div className="container h-100 py-5">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-normal mb-0">My Inventory</h3>
                            </div>
                            {
                                actual_inv.length > 0 && (
                                    <>
                                        {
                                            actual_inv.map((item, index) => {
                                                //setTotal(prev => prev + item.sell_price * item.item_count);
                                                return (
                                                    <React.Fragment key={item.id ?? index}>
                                                        <div className="card rounded-3 mb-4">
                                                            <div className="card-body p-4">
                                                                <div className="row d-flex justify-content-between align-items-center">
                                                                    <div className="col-md-2 col-lg-2 col-xl-2">
                                                                        <img
                                                                            src={`http://${window.location.hostname}:1337/shop-icons/${item.item_display}`}
                                                                            className="img-fluid rounded-3" alt="Cotton T-shirt" />
                                                                    </div>
                                                                    <div className="col-md-3 col-lg-3 col-xl-3">
                                                                        <p className="lead fw-normal mb-2">{item.item_name}</p>
                                                                        <p><span className="text-muted">Code: </span>{item.item_code}</p>
                                                                    </div>
                                                                    <div className="col-md-3 col-lg-3 col-xl-3">
                                                                        <p className="lead fw-normal mb-2">Amount</p>
                                                                        <p>{FormatNumber(item.item_count)}</p>
                                                                    </div>
                                                                    <div className="col-md-2 col-lg-2 col-xl-2 text-center">
                                                                        <button className="btn btn-primary" onClick={() => GetDetails(item)}>
                                                                            View Items
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                )
                                            })
                                        }

                                    </>
                                )
                            }
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}