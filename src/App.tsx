import { RouterProvider } from 'react-router';
import { router } from './routes';
import { PlateProvider } from './contexts/PlateContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <PlateProvider>
        <RouterProvider router={router} />
      </PlateProvider>
    </AuthProvider>
  );
}

export default App;