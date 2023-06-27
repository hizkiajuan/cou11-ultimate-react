import {useEffect, useState} from "react";
import config from "./config.json"
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0).toFixed(2);

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function MovieDetails({ selectedId, watched, onCloseMovie, onAddWatched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  const isWatched = watched
    .map((w) => w.imdbID)
    .includes(selectedId);
  const watchedUserRating = watched
    .find((w) => w.imdbID === selectedId)?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
    imdbRating,
  } = movie;

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);

      const res = await fetch(`https://omdbapi.com/?apikey=${config.omdbApiKey}&i=${selectedId}`);
      const data = await res.json();

      setMovie(data);
      setIsLoading(false);
    }

    getMovieDetails();
  }, [selectedId]);

  // use one useEffect hook for each side effect
  useEffect(() => {
    if (title) {
      document.title = `Movie | ${title}`;
    }

    // executed on: between render & unmounted
    return () => {
      document.title = 'usePopcorn';

      // closure: this function still remembers the `title`
      console.log(`Clean up effect for movie ${title}`);
    };
  }, [title]);

  useEffect(() => {
    function callback(e) {
      if (e.code === 'Escape') {
        onCloseMovie();
      }
    }

    // kinda react "hack"
    // useEffect enables us to communicate with the DOM ("outside world")
    document.addEventListener('keydown', callback);

    return () => {
      // important: not to always addEventListener when re-render/unmounted
      // `callback` must be the same with the initialization
      document.removeEventListener('keydown', callback);
    };
  }, [onCloseMovie]);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      imdbRating: +imdbRating,
      runtime: +runtime.split(' ').at(0),
      title,
      year,
      poster,
      userRating,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  return (
    <div className="details">
      {
        isLoading
          ? <Loader />
          : (
            <>
              <header>
                <button className="btn-back" onClick={onCloseMovie}>⬅</button>
                <img src={poster} alt={`Poster of  ${movie}`} />
                <div className="details-overview">
                  <h2>{title}</h2>
                  <p>{released} &bull; {runtime}</p>
                  <p>{genre}</p>
                  <p><span>⭐</span>{imdbRating} IMDb rating</p>
                </div>
              </header>

              <section>
                <div className="rating">
                  {
                    !isWatched ? (
                      <>
                        <StarRating maxRating={10} size={24} onSetRating={setUserRating}/>
                        {
                          userRating > 0 && (
                            <button className="btn-add" onClick={handleAdd}>
                              + Add to list
                            </button>
                          )
                        }
                      </>
                    ) : (
                      <p>
                        You rated this movie {watchedUserRating}
                        <span>🌟</span>
                      </p>
                    )
                  }
                </div>
                <p><em>{plot}</em></p>
                <p>Starring {actors}</p>
                <p>Directed by {director}</p>
              </section>
            </>
          )
      }
    </div>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>📆</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function Watched({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
      </div>
    </li>
  );
}

function WatchedList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <Watched key={movie.imdbID} movie={movie} onDeleteWatched={onDeleteWatched} />
      ))}
    </ul>
  );
}

function Loader() {
  return (
    <p className="loader">Loading...</p>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function Main({ children }) {
  return (
    <main className="main">
      {children}
    </main>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  /** #1 Basic **/
  /*
  // This is how to fetch data on mount
  useEffect(() => {
    // do not overuse useEffect, use event handler if possible
    // function x() { fetch(...) }
    // event handler would be triggered onClick, onBlur, etc

    // effect
    fetch(`https://omdbapi.com/?apikey=${config.omdbApiKey}&s=interstellar`)
      .then((res) => res.json())
      .then((data) => setMovies(data.Search));

    // cleanup function
    return () => console.log('cleanup...');
  }, []); // empty array: only trigger once when state is empty
  // ^^dependency array
  */

  /** #2 Refactored using async/await **/
  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError(''); // reset

        const res = await fetch(
          `https://omdbapi.com/?apikey=${config.omdbApiKey}&s=${query}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error('Something went wrong with fetching movies.');
        }

        const data = await res.json();

        if (data.Response === 'False') {
          throw new Error('Movie not found');
        }

        setMovies(data.Search);

        // logged twice, because <React.StrictMode> (see index.js)
        // only happened in React 18+, in development env
        // console.log(data.Search);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError('');
      return;
    }

    fetchMovies();

    return () => {
      // clean up data fetching
      // make sure no race condition: fast typing, multiple button click, etc
      controller.abort();
    };
  }, [query]);

  function handleSelectMovie(id) {
    setSelectedId((currId) => currId === id ? null : id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((w) => w.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        {/* Alternative; e.g. used by react-router */}
        {/*
          <Box element={<MovieList movies={movies} />} />
          <Box element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedList watched={watched} />
            </>
          } />
        */}

        <Box>
          {
            isLoading && <Loader />
          }
          {
            !isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          }
          {
            error && <ErrorMessage message={error} />
          }
        </Box>

        <Box>
          {
            selectedId
              ? (
                <MovieDetails
                  selectedId={selectedId}
                  watched={watched}
                  onCloseMovie={handleCloseMovie}
                  onAddWatched={handleAddWatched}
                />
              )
              : (
                <>
                  <WatchedSummary watched={watched} />
                  <WatchedList
                    watched={watched}
                    onDeleteWatched={handleDeleteWatched}
                  />
                </>
              )
          }
        </Box>
      </Main>
    </>
  );
}
