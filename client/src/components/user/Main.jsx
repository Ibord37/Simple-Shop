import React from 'react';
import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Landing from './Landing';
import Shop from './Shop';
import PageNavbar from './Navbar';
import Cart from './Cart';
import Transactions from './Transactions';
import Profile from './Profile';
import MyInventory from './Inventory';

function MainContent() {
  return (
    <div className="layout-wrapper">
        <div className="container-wrapper">
          <PageNavbar/>
          <Routes>
            <Route path="/" element={<Navigate to="landing" replace />} />
            <Route path="landing" element={<Landing />} />
            <Route path="shop" element={<Shop />} />
            <Route path="my-cart" element={<Cart />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="profile" element={<Profile />} />
            <Route path="inventory" element={<MyInventory />} />
          </Routes>
        </div>
    </div>
  );
}

export default MainContent;