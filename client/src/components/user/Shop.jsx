import React from "react";
import Swal from "sweetalert2";

import axios from "../../utils/axios";

import { FormatNumber } from "../../utils/Format";

import BlackShores from "../../resources/blackshores.png";
import Rinascita from "../../resources/rinascita.png";
import RinascitaInsider from "../../resources/rinascita-insider.jpg";
import MountFirmament from "../../resources/mt-firmament.jpg";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import '../../../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css';

import Carousel from 'bootstrap/js/dist/carousel';

import './User.css';

export default function Shop() {
    const [items, setItems] = React.useState([]);
    const [search, setSearch] = React.useState('');

    const [limit, setLimit] = React.useState(5);
    const [total, setTotal] = React.useState(0);

    const [filter, setFilter] = React.useState("by_name");

    function GetItem(search, limit, type = 'by_name') {
        axios({
            method: 'GET',
            url: '/api/stocks',
            params: {
                page: 1, limit, search, by_name: type === 'by_name', empty_also: false
            }
        }).then(result => {
            setItems(result.data.items);
            setTotal(result.data.total);
        }).catch(err => {
            console.log(err);
        });
    }

    function AddToCart(item) {
        Swal.fire({
            title: 'Add Item',
            text: `How many of ${item.item_name} would you like to add to cart?`,
            html: `
                <div style="display:flex;align-items:center;gap:12px;justify-content:center">
                <button id="decrement" class="btn btn-secondary">-</button>
                <input id="swal-quantity" type="number" min=${item.items_per_price} max=${item.item_quantity} value=${item.items_per_price} style="width:60px;text-align:center;padding:8px;" />
                <button id="increment" class="btn btn-secondary">+</button>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Add to Cart',
            didOpen: () => {
                const input = document.getElementById('swal-quantity');
                document.getElementById('increment').addEventListener('click', () => {
                    if (+input.value < +input.max) input.stepUp();
                });
                document.getElementById('decrement').addEventListener('click', () => {
                    if (+input.value > +input.min) input.stepDown();
                });
            },
            preConfirm: async () => {
                const input = document.getElementById('swal-quantity');
                const amount = parseInt(input.value);

                if (!amount || isNaN(amount) || Number(amount) < item.items_per_price || (Number(amount) > item.item_quantity && item.item_quantity !== -1)) {
                    Swal.showValidationMessage("Please enter a valid number.");
                    return false;
                }

                return amount;
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                const count = +result.value;

                axios({
                    method: 'POST',
                    url: '/api/add-cart',
                    data: {
                        item_id: item.id, item_count: count
                    }
                }).then(result => {
                    if (result.status === 200)
                        Swal.fire("Added!", `x${count} ${item.item_name} has been added to cart.`, "success");
                    else
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "Something went wrong!",
                            footer: `Error: ${result.data?.message}`
                        });
                }).catch(err => {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Something went wrong!",
                        footer: `Error: ${err.response?.data?.message || err.message}`
                    });
                });

                GetItem(search, limit, filter);
            }
        });
    }

    React.useEffect(() => {
        GetItem(search, limit, filter);
    }, [search, limit, filter]);

    React.useEffect(() => {
        const carouselElement = document.querySelector('#carouselExampleCaptions');
        if (carouselElement) {
            new Carousel(carouselElement, {
                interval: 3000, // 3 seconds
                ride: 'carousel'
            });
        }
    }, []);

    return (
        <div className="container-fluid shop">
            <div className="shop-page">
                <div className="shop-header mb-3">
                    <div className="row justify-content-center mb-3">
                        <div className="col-lg-12 mx-auto">
                            <h2 className="text-center mb-3">Start Shopping Today!</h2>
                            <form className="d-flex" role="search">
                                <select
                                    className="form-select me-2"
                                    style={{ width: 'auto' }}
                                    value="🔍 Filter"
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="by_name">🔍 Filter</option>
                                    <option value="by_name">🔠 Item Name</option>
                                    <option value="by_code">🔠 Item Code</option>
                                </select>
                                <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" onChange={(e) => setSearch(e.target.value)} />
                                <button className="btn btn-outline-success" type="submit"><i className="fas fa-magnifying-glass"></i></button>
                            </form>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-10">
                            <div id="carouselExampleCaptions" className="carousel slide custom-carousel" data-bs-ride="carousel">
                                <div className="carousel-indicators">
                                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
                                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
                                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="3" aria-label="Slide 4"></button>
                                </div>
                                <div className="carousel-inner">
                                    <div className="carousel-item active">
                                        <img src={BlackShores} className="d-block" alt="..." />
                                        <div className="carousel-caption d-none d-md-block">
                                            <h5>First slide label</h5>
                                            <p>Some representative placeholder content for the first slide.</p>
                                        </div>
                                    </div>
                                    <div className="carousel-item">
                                        <img src={RinascitaInsider} className="d-block" alt="..." />
                                        <div className="carousel-caption d-none d-md-block">
                                            <h5>Second slide label</h5>
                                            <p>Some representative placeholder content for the second slide.</p>
                                        </div>
                                    </div>
                                    <div className="carousel-item">
                                        <img src={MountFirmament} className="d-block" alt="..." />
                                        <div className="carousel-caption d-none d-md-block">
                                            <h5>Third slide label</h5>
                                            <p>Some representative placeholder content for the third slide.</p>
                                        </div>
                                    </div>
                                    <div className="carousel-item">
                                        <img src={Rinascita} className="d-block" alt="..." />
                                        <div className="carousel-caption d-none d-md-block text-black"
                                            style={{ background: "rgba(255, 255, 255, 0.3)" }}>
                                            <h5>Fourth slide label</h5>
                                            <p>Some representative placeholder content for the fourth slide.</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
                                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Previous</span>
                                </button>
                                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
                                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Next</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="shop-body">
                    <div className="row ps-4">
                        {
                            items.map(item => (
                                (
                                    <div className="card mx-3 my-4" style={{ width: '16rem' }}>
                                        <img src={`http://${window.location.hostname}:1337/shop-icons/${item.item_display}`} className="card-img-top" alt="..." />
                                        <div className="card-body">
                                            <h5 className="card-title mb-3">{item.item_name}</h5>
                                            <p className="card-text">
                                                Code: {item.item_code} <br/>
                                                Stock: {item.item_quantity === -1 ? "Infinity" : (item.item_quantity < item.items_per_price && item.item_quantity !== -1) ? "OUT OF STOCK" : FormatNumber(item.item_quantity)}<br />
                                                Price: ${FormatNumber(item.sell_price)} per {item.items_per_price > 1 ? FormatNumber(item.items_per_price) : ''} pcs. <br/>
                                                Min buy: {FormatNumber(item.items_per_price)}
                                            </p>
                                            <button className="btn btn-primary" disabled={(item.item_quantity < item.items_per_price) && item.item_quantity !== -1} onClick={() => AddToCart(item)}>Add to cart</button>
                                        </div>
                                    </div>
                                )
                            ))
                        }
                        {
                            items.length < total && (
                                <div className="show-more text-center my-3">
                                    <button className="btn bg-none text-decoration-underline" style={{ fontSize: '20px' }}
                                        onClick={() => {
                                            setLimit(prev => Math.min(prev + 5, total));
                                        }}>Show more</button>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}