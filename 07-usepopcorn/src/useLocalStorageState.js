import {useEffect, useState} from "react";

// naming: use[...]State
// to indicates this is "useState"
// returning [val, setVal] (convention)
export function useLocalStorageState(initialState = [], key) {
  const [value, setValue] = useState(() => {
    // initialize state using callback
    // a.k.a Lazy Initial State / Lazy Evaluation
    // must be pure and accept no args; called only on initial render
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue];
}
