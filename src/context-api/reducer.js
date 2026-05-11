const getStoredTheme = () => {
  const isDark = localStorage.getItem('isDark');
  return !isDark ? false : JSON.parse(isDark.toLowerCase());
};

export const initialState = {
  isDark: getStoredTheme(),
  isOpen: false,
  isLoading: false,
  snackbar: {
    isOpen: false,
    isError: false,
    message: '',
  },
};

export const actionTypes = {
  SET_THEME: 'SET_THEME',
  SET_DRAWER: 'SET_DRAWER',
  SET_LOADER: 'SET_LOADER',
  SET_SNACKBAR: 'SET_SNACKBAR',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_THEME:
      localStorage.setItem('isDark', action.isDark);
      return {
        ...state,
        isDark: action.isDark,
      };
    case actionTypes.SET_DRAWER:
      return {
        ...state,
        isOpen: action.isOpen,
      };
    case actionTypes.SET_LOADER:
      return {
        ...state,
        isLoading: action.isLoading,
      };
    case actionTypes.SET_SNACKBAR:
      return {
        ...state,
        snackbar: action.snackbar,
      };
    default:
      return state;
  }
};

export default reducer;
