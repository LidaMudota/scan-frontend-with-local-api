import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './layout.css';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="main">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
