import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
