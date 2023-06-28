import {useEffect} from "react";

export function useKey(key, action) {
  useEffect(() => {
    function callback(e) {
      if (e.code.toLowerCase() === key.toLowerCase()) {
        action();
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
  }, [key, action]);
}
