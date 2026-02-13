import { RouterProvider } from 'react-router';
import { router } from './routes.js';
import { PlateProvider } from './contexts/PlateContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

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
