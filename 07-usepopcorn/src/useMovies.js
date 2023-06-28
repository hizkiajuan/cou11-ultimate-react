import {useEffect, useState} from "react";
import config from "./config.json"

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    callback?.();

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

    fetchMovies();

    return () => {
      // clean up data fetching
      // make sure no race condition: fast typing, multiple button click, etc
      controller.abort();
    };
  }, [query]);

  return {movies, isLoading, error};
}
