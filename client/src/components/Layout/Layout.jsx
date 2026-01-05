import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './layout.css';

export default function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
