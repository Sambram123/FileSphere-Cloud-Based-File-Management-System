import { CssBaseline, Paper, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './components/login/Login.js';
import Register from './components/login/Register';
import Reset from './components/login/Reset';
import SimpleBackDrop from './components/UI/SimpleBackDrop';
import SimpleSnackbar from './components/UI/SimpleSnackbar';
import { useDataLayerValue } from './context-api/Datalayer';
import { darkTheme, lightTheme } from './shared/ui-themes.js';

const App = () => {
  const [{ isDark }] = useDataLayerValue();

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <Paper sx={{ height: '100%' }}>
        <SimpleBackDrop />
        <SimpleSnackbar />
        <Router>
          <Routes>
            <Route path="/" element={<Login />}></Route>
            <Route exact path="/register" element={<Register />}></Route>
            <Route exact path="/reset" element={<Reset />}></Route>
            <Route exact path="/notes" element={<Layout />}></Route>
          </Routes>
        </Router>
      </Paper>
    </ThemeProvider>
  );
};

export default App;
