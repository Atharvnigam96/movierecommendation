import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

function Navbar({ search, setSearch, user, onLogout }) {
  const navigate = useNavigate();

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  return (
    <nav>
      <Link to="/" style={{ textDecoration: "none" }}>
        <h2>🎬 CineMatch</h2>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/movies">Movies</Link>
        <Link to="/my-list">My List</Link>
        <Link to="/profile">Profile</Link>
      </div>

      <SearchBar
        search={search}
        setSearch={handleSearchChange}
      />

      <div className="nav-user">
        {user ? (
          <div className="nav-user-logged">
            <Link to="/profile" className="user-name-link">
              Hi, {user.name}
            </Link>

            <button
              onClick={onLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/auth" className="login-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
