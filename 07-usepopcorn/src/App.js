import {useEffect, useRef, useState} from "react";
import config from "./config.json"
import StarRating from "./StarRating";
import {useMovies} from "./useMovies";
import {useLocalStorageState} from "./useLocalStorageState";
import {useKey} from "./useKey";

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

  // custom hook
  useKey('Enter', () => {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery('');
  });

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

  // custom hook
  useKey('Escape', onCloseMovie);

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
  const [selectedId, setSelectedId] = useState(null);

  // custom hook
  // handleCloseMovie is hoisted -> it's declared by regular function
  // arrow function is not hoisted
  const {movies, isLoading, error} = useMovies(query, handleCloseMovie);

  // custom hook
  const [watched, setWatched] = useLocalStorageState([], 'usePopcorn:watched');

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
