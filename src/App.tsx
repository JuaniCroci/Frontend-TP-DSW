import { AuthProvider } from './app/core/auth/AuthProvider.tsx';
import LoginPage from './app/features/auth/pages/LoginPage.tsx';

function App() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}

export default App;