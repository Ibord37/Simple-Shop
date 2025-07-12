import React from "react";
import Swal from "sweetalert2";

import axios from "../../utils/axios";
import GetUser from "../../utils/GetUser";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';

import '../../../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css';
import './User.css';

import { FormatNumber, Cleanup } from "../../utils/Format";

export default function Cart() {
    const [cart, setCart] = React.useState([]);
    const [items, setItems] = React.useState([]);

    const [user, setUser] = React.useState(null);
    const [userDB, setUserDB] = React.useState({});

    const [total, setTotal] = React.useState(0);
    const [option, setOption] = React.useState('');

    function GetCart() {
        axios({
            method: 'GET',
            url: '/api/my-cart',
        }).then(result => {
            setCart(result.data?.cart);
        }).catch(err => {
            console.log(err);
        })
    }

    React.useEffect(() => {
        GetCart();
    }, []);

    function AddTransaction() {
        if (option.trim() === '') {
            Swal.fire("Oops...", "You must choose a payment method.", "error");
            return;
        }

        axios({
            method: 'POST',
            url: '/api/transactions_add',
            data: {
                option, actual_price: -1
            }
        }).then(result => {
            if (result.status === 200)
                Swal.fire("Success!", "Cart has been checked out.", "success");
            else
                Swal.fire("Oops...", result.data.message, "error");
        }).catch(err => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err.response?.data?.message || err.message,
            });
        });

        setCart([]);
    }

    function GetItem() {
        axios({
            method: 'GET',
            url: `/api/stocks`,
            params: {
                page: 1, limit: -1, search: '', by_name: true, empty_only: false
            }
        }).then(result => {
            setItems(result.data.items);
        }).catch(err => console.log(err));
    }

    React.useEffect(() => {
        GetItem();
    }, []);

    async function HandleDelete(item) {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `You are removing x${item.item_count} ${item.item_name} from your cart.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Remove it!"
        });

        if (result.isConfirmed) {
            try {
                const res = await axios.delete(`/api/cart-rm/${item.id}`);

                //setTotal(prev => prev - item.sell_price * item.item_count);
                setCart(res.data?.cart);
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

    function UpdateQuantity(item, count) {
        const item_id = item.id;

        setCart(prev =>
            prev.map(it =>
                it.item_id === item_id ? { ...it, item_count: count } : it
            )
        );

        //setTotal(prev => prev + item.sell_price * item.item_count);

        axios.post("/api/add-cart", {
            item_id,
            item_count: count,
        }).catch(err => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err.response?.data?.message || err.message,
            });
        });
    }


    const actual_cart = React.useMemo(() => {
        if (!cart.length || !items.length) return [];
        return cart.map(item => {
            const stock = items.find(s => s.id === item.item_id);
            return {
                ...item,
                ...stock
            };
        });
    }, [cart, items]);

    //console.log(actual_cart);
    React.useEffect(() => {
        const new_total = actual_cart.reduce((sum, item) => sum + (item.sell_price * item.item_count), 0);
        setTotal(new_total);
    }, [actual_cart]);

    React.useEffect(() => {
        const FetchUser = async () => {
            const users = await GetUser();
            setUser(users);
        };

        FetchUser();
    }, []);

    React.useEffect(() => {
        const FetchUserDB = () => {
            axios({
                method: 'GET',
                url: '/api/get-extra-db'
            }).then(result => {
                //console.log(result.data.user_db);
                setUserDB(result.data.user_db);
            }).catch(err => {
                console.log(err.response?.data?.message || err.message);
                setUserDB(null);
            });
        }

        FetchUserDB();
    });

    const payment_options = React.useMemo(() => {
        if (!user || !userDB) return [];
        return [
            {
                id: 1,
                title: "Discord",
                content: `Linked account: ${user.discord_id}`,
                option: "discord",
                icon: "fa-brands fa-discord"
            },
            {
                id: 2,
                title: "Untitled Coin",
                content: `Current Balance: $${FormatNumber(userDB.balance)}`,
                option: "untitled_coin",
                icon: "fas fa-wallet"
            }
        ];
    });

    return (
        <div className="container-fluid cart">
            <section className="h-100">
                <div className="container h-100 py-5">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-normal mb-0">Shopping Cart</h3>
                            </div>
                            {
                                actual_cart.length > 0 && (
                                    <>
                                        {
                                            actual_cart.map((item, index) => {
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
                                                                        <p><span className="text-muted">Min buy: </span>{FormatNumber(item.items_per_price)} pcs.</p>
                                                                        {
                                                                            /*<p><span className="text-muted">Code: </span>{item.item_code}</p>*/
                                                                        }
                                                                    </div>
                                                                    <div className="col-md-3 col-lg-3 col-xl-2 d-flex">
                                                                        <button data-mdb-button-init data-mdb-ripple-init className="btn btn-link px-2"
                                                                            onClick={() => UpdateQuantity(item, Math.max(1, item.item_count - 1))}>
                                                                            <i className="fas fa-minus"></i>
                                                                        </button>

                                                                        <input id="form1" min="0" max={item.item_quantity} name="quantity" value={item.item_count} type="number"
                                                                            className="form-control form-control-sm" onChange={(e) => UpdateQuantity(item, !isNaN(+e.target.value) ?? +e.target.value)} />

                                                                        <button data-mdb-button-init data-mdb-ripple-init className="btn btn-link px-2"
                                                                            onClick={() => UpdateQuantity(item, Math.min(item.item_quantity, item.item_count + 1))}>
                                                                            <i className="fas fa-plus"></i>
                                                                        </button>
                                                                    </div>
                                                                    <div className="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                                                                        <h5 className="mb-0">${FormatNumber(item.sell_price * item.item_count)}</h5>
                                                                    </div>
                                                                    <div className="col-md-1 col-lg-1 col-xl-1 text-end">
                                                                        <button className="btn text-danger" onClick={() => HandleDelete(item)}>
                                                                            <i className="fas fa-trash fa-lg"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                )
                                            })
                                        }
                                        <div className="card">
                                            <div className="card-header mt-1 d-flex justify-content-between">
                                                <h4>Total: </h4>
                                                <h4 className="text-end">${FormatNumber(total)}</h4>
                                            </div>
                                            <div className="card-body">
                                                <div className="mt-1 d-flex justify-content-between">
                                                    <h5>Payment method: </h5>
                                                    <h5 className="text-end">{Cleanup(option)}</h5>
                                                </div>
                                                {
                                                    payment_options.map(menu => (
                                                        <div className="col-12 my-3" key={menu.id} onClick={() => {
                                                            setOption(menu.option)
                                                        }} style={{ cursor: "pointer" }}>
                                                            <div className={`info-box d-flex align-items-center py-3 mb-3 ${option === menu.option ? "border border-primary" : ""}`} style={{ background: '#FFFFFF', border: '1px solid #ccc', borderRadius: '8px' }}>
                                                                <span className="info-box-icon d-flex align-items-center justify-content-center elevation-1 mx-2" style={{ fontSize: '20px', padding: '16px 20px' }}><i className={menu.icon}></i></span>
                                                                <div className="info-box-content">
                                                                    <div className="fw">{menu.title}</div>
                                                                    <div className="fw-bold">{menu.content}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                            <div className="card-footer">
                                                <button type="button" data-mdb-button-init data-mdb-ripple-init className="btn btn-warning btn-block btn-lg my-1"
                                                    onClick={AddTransaction}>Checkout</button>
                                            </div>
                                        </div>
                                    </>
                                )
                            }
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}