import { RouterProvider } from 'react-router';
import { router } from './routes.jsx';
import { PlateProvider } from './contexts/PlateContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { AdminAuthProvider } from './contexts/AdminAuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <PlateProvider>
        <AdminAuthProvider>
          <RouterProvider router={router} />
        </AdminAuthProvider>
      </PlateProvider>
    </AuthProvider>
  );
}

export default App;
