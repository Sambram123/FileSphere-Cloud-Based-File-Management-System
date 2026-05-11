import { Tooltip } from '@mui/material';
import { Box, Container } from '@mui/system';
import { useDataLayerValue } from '../../context-api/Datalayer';
import { actionTypes } from '../../context-api/reducer';
import { DarkModeSwitch } from '../../shared/ui-themes';

const LoginContainer = (props) => {
  const [{ isDark }, dispatch] = useDataLayerValue();

  const setTheme = () => {
    dispatch({
      type: actionTypes.SET_THEME,
      isDark: !isDark,
    });
  };

  const classes = 'card ' + props.className;

  return (
    <Container
      className={classes}
      component="main"
      maxWidth="xs"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          marginBottom: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {props.children}
        <Tooltip title="Change Mode">
          <DarkModeSwitch
            sx={{ marginTop: 2 }}
            checked={isDark}
            onChange={setTheme}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </Tooltip>
      </Box>
    </Container>
  );
};

export default LoginContainer;
