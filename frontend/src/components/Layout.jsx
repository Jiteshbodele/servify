import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} ServiceHub — Microservices Platform</p>
        </div>
      </footer>
    </div>
  );
}
