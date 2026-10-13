import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import Home from "./Home";
import Movies from "./Movies";
import MyList from "./MyList";
import Profile from "./Profile";
import MovieDetails from "./MovieDetails";
import Auth from "./Auth";

function App() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [myList, setMyList] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("cinematch_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Load user's watchlist from backend
  const fetchMyList = useCallback(async () => {
    const token = localStorage.getItem("cinematch_token");
    if (!token) return;

    try {
      const res = await fetch("/api/my-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("cinematch_token");
        localStorage.removeItem("cinematch_user");
        setUser(null);
        setMyList([]);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMyList(data);
        }
      }
    } catch (err) {
      console.warn("Could not fetch user's my-list:", err);
    }
  }, []);

  useEffect(() => {
    fetchMyList();
  }, [user, fetchMyList]);

  const handleLogout = () => {
    localStorage.removeItem("cinematch_token");
    localStorage.removeItem("cinematch_user");
    setUser(null);
    setMyList([]);
    navigate("/");
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    fetchMyList();
  };

  // Add or remove from My List with backend synchronization
  const handleToggleToList = async (movie) => {
    if (!movie) return;

    const alreadyExists = myList.some(
      (item) =>
        item.movieId === movie.movieId ||
        item.title?.toLowerCase() === movie.title?.toLowerCase()
    );

    const token = localStorage.getItem("cinematch_token");

    if (alreadyExists) {
      // Remove
      setMyList((prev) =>
        prev.filter(
          (item) =>
            item.movieId !== movie.movieId &&
            item.title?.toLowerCase() !== movie.title?.toLowerCase()
        )
      );

      if (token) {
        try {
          const id = movie.movieId || encodeURIComponent(movie.title);
          await fetch(`/api/my-list/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          console.warn("Failed to remove from backend list:", err);
        }
      }
    } else {
      // Add
      setMyList((prev) => [...prev, movie]);

      if (token) {
        try {
          const id = movie.movieId || encodeURIComponent(movie.title);
          await fetch(`/api/my-list/${id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err) {
          console.warn("Failed to save to backend list:", err);
        }
      }
    }
  };

  const handleRemoveFromList = async (movie) => {
    setMyList((prev) =>
      prev.filter(
        (item) =>
          item.movieId !== movie.movieId &&
          item.title?.toLowerCase() !== movie.title?.toLowerCase()
      )
    );

    const token = localStorage.getItem("cinematch_token");
    if (token) {
      try {
        const id = movie.movieId || encodeURIComponent(movie.title);
        await fetch(`/api/my-list/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn("Failed to delete from backend list:", err);
      }
    }
  };

  return (
    <>
      <Navbar
        search={search}
        setSearch={setSearch}
        user={user}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              search={search}
              myList={myList}
              onAddToList={handleToggleToList}
            />
          }
        />

        <Route
          path="/auth"
          element={<Auth onLoginSuccess={handleLoginSuccess} />}
        />

        <Route
          path="/movies"
          element={
            <Movies
              search={search}
              setSearch={setSearch}
              myList={myList}
              onAddToList={handleToggleToList}
            />
          }
        />

        <Route
          path="/my-list"
          element={
            <MyList
              myList={myList}
              setMyList={setMyList}
              onRemoveFromList={handleRemoveFromList}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <Profile
              user={user}
              onLogout={handleLogout}
              myList={myList}
            />
          }
        />

        <Route
          path="/movie/:title"
          element={
            <MovieDetails
              myList={myList}
              onAddToList={handleToggleToList}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
