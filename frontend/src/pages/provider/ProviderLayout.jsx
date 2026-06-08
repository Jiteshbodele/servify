import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/provider', end: true, label: 'Overview' },
  { to: '/provider/services', label: 'My Services' },
  { to: '/provider/availability', label: 'Availability' },
  { to: '/provider/bookings', label: 'Bookings' },
  { to: '/provider/search', label: 'Search' },
  { to: '/provider/calls', label: 'Call History' },
];

export default function ProviderLayout() {
  return (
    <div className="container page dashboard">
      <h1>Provider Dashboard</h1>
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
