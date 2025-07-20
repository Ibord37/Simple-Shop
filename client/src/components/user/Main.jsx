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
import Mails from './Mails';
import Mail from './Mail';

import MailSidebar from './MailSidebar';
import { useSidebar, SidebarProvider } from '../context/SidebarContext';

function MainContent() {
  const { collapsed } = useSidebar();

  return (
    <div className={`layout-wrapper ${collapsed ? 'collapsed' : ''}`}>
      <div className="container-wrapper flex-grow-1">
        <PageNavbar />
        <Routes>
          <Route path="/" element={<Navigate to="landing" replace />} />
          <Route path="landing" element={<Landing />} />
          <Route path="shop" element={<Shop />} />
          <Route path="my-cart" element={<Cart />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="profile" element={<Profile />} />
          <Route path="inventory" element={<MyInventory />} />
          <Route path="mails" element={
            <MailSidebar>
              <Mails />
            </MailSidebar>
          } />
          <Route path="mails/:id" element={
            <MailSidebar>
              <Mail />
            </MailSidebar>
          } />
        </Routes>
      </div>
    </div>
  );
}

function UserMain() {
  return (
    <SidebarProvider>
      <MainContent />
    </SidebarProvider>
  );
}

export default UserMain;