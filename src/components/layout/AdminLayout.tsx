import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../../components/layout/AdminSidebar';

export const AdminLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 75px)', background: '#F8FAFC' }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};
