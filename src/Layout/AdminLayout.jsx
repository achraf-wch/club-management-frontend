import AdminSidebar from '../Componenets/AdminSidebar';
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
