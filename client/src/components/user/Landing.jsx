import React from "react";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';

import './User.css';

export default function Landing() {
    return (
        <div className="container-fluid landing">
           <div className="textbox">
                <h2 className="mb-4">Welcome to Untitled Project!</h2>
                <p className="mb-3">At Untitled Project, we believe shopping should be more than just a transaction — it should be an experience. Discover carefully selected items that match your style, needs, and values, all brought together in one thoughtfully crafted platform.</p>
                <a className="bg-primary" href="/shop">Explore now!</a>
            </div> 
        </div>
    )
}