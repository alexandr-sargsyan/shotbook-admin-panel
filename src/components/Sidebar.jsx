import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <Link
          to="/categories"
          className={location.pathname === '/categories' ? 'active' : ''}
        >
          Categories
        </Link>
        <Link
          to="/video-references"
          className={location.pathname === '/video-references' ? 'active' : ''}
        >
          Video References
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;

