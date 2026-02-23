import { Outlet } from 'react-router';
import { AdminAuthProvider } from '../contexts/AdminAuthContext.jsx';

export function AdminLayout() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}
