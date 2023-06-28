import {useEffect, useRef, useState} from "react";
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
  // not really the way react doing things
  // must be declarative, prevent direct DOM manipulation
  // useEffect(() => {
  //   const el = document.querySelector('.search');
  //   el.focus();
  // }, []);

  const inputEl = useRef(null);

  useEffect(() => {
    function callback(e) {
      if (document.activeElement === inputEl.current) {
        return;
      }

      if (e.code === 'Enter') {
        inputEl.current.focus();
        setQuery('');
      }
    }

    document.addEventListener('keydown', callback);

    return () => document.removeEventListener('keydown', callback);
  }, [setQuery])

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
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

  const countRef = useRef(0);

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

  // #1 break the linked-list: defining hooks inside conditional
  // if (imdbRating > 8) {
  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   const [isTop, setIsTop] = useState(true);
  // }

  // #2 break the linked-list: using early return
  // if (imdbRating > 8) return <p>Greatest ever!</p>

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

  useEffect(() => {
    if (userRating) {
      // not to use regular variable, because it's not persisted across renders
      countRef.current = countRef.current + 1;
    }
  }, [userRating]);

  function handleAdd() {
    const newWatchedMovie = {
      countRatingDecisions: countRef.current,
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const [watched, setWatched] = useState(() => {
    // initialize state using callback
    // a.k.a Lazy Initial State / Lazy Evaluation
    // must be pure and accept no args; called only on initial render
    const storedValue = localStorage.getItem('usePopcorn:watched');
    return storedValue ? JSON.parse(storedValue) : [];
  });

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

    // at the end: this `fetchMovies` could be moved out
    // as an event handler, instead of side effect
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

    handleCloseMovie();
    fetchMovies();

    return () => {
      // clean up data fetching
      // make sure no race condition: fast typing, multiple button click, etc
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    localStorage.setItem('usePopcorn:watched', JSON.stringify(watched));
  }, [watched]);

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
