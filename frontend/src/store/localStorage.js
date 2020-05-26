export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {};
  }
};

export const saveState = state => {
  const serializedState = JSON.stringify(state);
  localStorage.setItem('state', serializedState);
};

export const clear = () => localStorage.setItem('state', {});
