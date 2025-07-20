import React from 'react';
import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import { Sidebar } from './Sidebar';

import AddStock from './AddStock';
import Dashboard from './Dashboard';
import Logs from './Logs';
import Stocks from './Stocks';
import Transactions from './Transactions';
import MailSender from './MailSender'; 

function MainContent() {
  const { collapsed } = useSidebar();
  //console.log("Collapsed state:", collapsed);

  return (
    <div className={`layout-wrapper ${collapsed ? 'collapsed' : ''}`}>
        <Sidebar />
        <div className="container-wrapper flex-grow-1">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="stocks" element={<Stocks />} />
            <Route path="addstock" element={<AddStock />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="send-mail" element={<MailSender />} />
            <Route path="logs" element={<Logs />} />
          </Routes>
        </div>
    </div>
  );
}

function Main() {
  return (
    <SidebarProvider>
      <MainContent/>    
    </SidebarProvider>
  )
}

export default Main;
