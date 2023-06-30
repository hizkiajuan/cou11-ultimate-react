import {useReducer} from "react";

const initialState = {
  count: 0,
  step: 1,
};

// reducer: pure function, returns the next state
// accumulate/reduce `action`s over time (like arr.reduce)
function reducer(state, action) {
  // action: an object, that describes how to update state
  console.log(state, action);

  // common to use switch-case in reducer
  switch(action.type) {
    case 'dec':
      return { ...state, count: state.count - state.step };
    case 'inc':
      return { ...state, count: state.count + state.step };
    case 'setCount':
      return { ...state, count: action.payload };
    case 'setStep':
      return { ...state, step: action.payload };
    case 'reset':
      return initialState;
    default:
      throw new Error('Unknown action');
  }
}

function DateCounter() {
  // when to use reducer
  // #1 too many variables & states across multiple components
  // #2 multiple state init/update at the same time
  // #3 updating a state depends on one or more other states
  const [state, dispatch] = useReducer(reducer, initialState);
  const {count, step} = state;


  // This mutates the date object.
  const date = new Date("june 21 2027");
  date.setDate(date.getDate() + count);

  const dec = function () {
    // dispatch: like setState
    dispatch({ type: 'dec' });
  };

  const inc = function () {
    dispatch({ type: 'inc' });
  };

  const defineCount = function (e) {
    // convention: to have `type` & `payload` (like redux)
    dispatch({
      type: 'setCount',
      payload: +e.target.value,
    });
  };

  const defineStep = function (e) {
    dispatch({
      type: 'setStep',
      payload: +e.target.value,
    });
  };

  const reset = function () {
    dispatch({ type: 'reset' });
  };

  return (
    <div className="counter">
      <div>
        <input
          type="range"
          min="0"
          max="10"
          value={step}
          onChange={defineStep}
        />
        <span>{step}</span>
      </div>

      <div>
        <button onClick={dec}>-</button>
        <input value={count} onChange={defineCount} />
        <button onClick={inc}>+</button>
      </div>

      <p>{date.toDateString()}</p>

      <div>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
export default DateCounter;
