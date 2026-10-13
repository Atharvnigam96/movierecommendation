import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-label">PERSONALIZED FOR YOU</p>

        <h1>
          Movies you'll
          <br />
          love to watch.
        </h1>

        <p className="hero-description">
          Discover movies picked just for you with our neural recommendation engine,
          trained on over 20 million ratings.
        </p>

        <div className="hero-buttons">
          <Link to="/movies" className="watch-btn" style={{ textDecoration: "none" }}>
            ▶ Explore Movies
          </Link>

          <Link to="/my-list" className="list-btn" style={{ textDecoration: "none" }}>
            ＋ My List
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;