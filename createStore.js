const createStore = (reducer, enhancer) => {
  let state;
  const listeners = [];

  if (enhancer) {
    return enhancer(createStore)(reducer);
  }

  const getState = () => {
    return state;
  };

  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener) => {
    listeners.push(listener);

    return () => {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  };

  dispatch({ type: 'INIT' });

  return { getState, dispatch, subscribe };
};

// createStore(reducer, applyMiddleware(a, b, c))
const applyMiddleware = (...middlewares) => {
  return (createStore) => (reducer) => {
    const store = createStore(reducer);

    const middlewareAPI = {
      getState: store.getState,
      // dispatch: (action, ...args) => store.dispatch(action, ...args),
      dispatch: () => {},
    };

    const middlewareChain = middlewares.map((middleware) =>
      middleware(middlewareAPI)
    );
    const dispatch = compose(...middlewareChain)(store.dispatch);

    return {
      ...store,
      dispatch,
    };
  };
};

const compose = (...funcs) => {
  const length = funcs.length;
  if (!funcs || length === 0) {
    return (args) => args;
  }

  if (length === 1) {
    return funcs[0];
  }

  return funcs.reduce(
    (prev, current) =>
      (...args) =>
        prev(current(...args))
  );
};

const logger = ({ dispatch, getState }) => {
  return (next) => (action) => {
    const prevState = getState();
    console.log('Starting logging ...');
    console.log('previous state', prevState);
    console.log('action', action);
    const result = next(action);
    const nextState = getState();
    console.log('next', next);
    console.log('next result', result);
    console.log('Next state', nextState);
    console.log('End logging ...');
    return result;
  };
};

const reducer = (state = { number: 0 }, action) => {
  switch (action.type) {
    case 'INC':
      state.number = state.number + 1;
      break;
    case 'DEC':
      state.number = state.number - 1;
      break;
    default:
      break;
  }
  return state;
};

const store = createStore(reducer, applyMiddleware(logger));
const { getState, dispatch, subscribe } = store;
subscribe(() => {
  const state = getState();
  console.log(state);
});
dispatch({ type: 'INC' });
