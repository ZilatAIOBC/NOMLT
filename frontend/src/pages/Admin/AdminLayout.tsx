import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#0F0F0F]">
      <AdminSidebar />
      {/* Responsive margin: 16 (64px) for mobile/tablet collapsed, 64 (256px) for expanded */}
      <main className="flex-1 overflow-auto ml-16 lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}

