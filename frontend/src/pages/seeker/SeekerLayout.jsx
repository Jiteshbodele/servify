import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/seeker', end: true, label: 'Overview' },
  { to: '/seeker/book', label: 'Book Service' },
  { to: '/seeker/bookings', label: 'My Bookings' },
  { to: '/seeker/profile', label: 'Profile' },
  { to: '/seeker/payments', label: 'Payments' },
  { to: '/seeker/calls', label: 'Call History' },
];

export default function SeekerLayout() {
  return (
    <div className="container page dashboard">
      <h1>Seeker Dashboard</h1>
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
