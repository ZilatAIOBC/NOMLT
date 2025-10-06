import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#0F0F0F]">
      <AdminSidebar />
      {/* On mobile/tablet the sidebar can collapse to 64px; leave responsive margin */}
      <main className="flex-1 overflow-auto ml-16 md:ml-16 lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}

