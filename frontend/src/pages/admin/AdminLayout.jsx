import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', end: true, label: 'Overview' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/services', label: 'Services' },
];

export default function AdminLayout() {
  return (
    <div className="container page dashboard">
      <h1>Admin Dashboard</h1>
      <nav className="subnav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className="subnav-link">
            {l.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
