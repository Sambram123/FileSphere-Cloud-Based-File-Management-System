import { AccountCircle, Logout } from '@mui/icons-material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DescriptionSharpIcon from '@mui/icons-material/DescriptionSharp';
import MenuIcon from '@mui/icons-material/Menu';
import { Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { useDataLayerValue } from '../../context-api/Datalayer';
import { actionTypes } from '../../context-api/reducer';
import { auth, db, logout } from '../../firebase';
import { AppBar } from '../../shared/ui-themes';
import { IgnoreDisabledListItem } from '../../shared/utils';

const Header = (props) => {
  const [name, setName] = useState('');

  const [{ isDark, isOpen, isLoading }, dispatch] = useDataLayerValue();

  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleDrawer = () => {
    dispatch({
      type: actionTypes.SET_DRAWER,
      isOpen: !isOpen,
    });
  };

  const setTheme = () => {
    dispatch({
      type: actionTypes.SET_THEME,
      isDark: !isDark,
    });
  };

  const setLoader = useCallback(
    (isLoading) => {
      dispatch({
        type: actionTypes.SET_LOADER,
        isLoading: isLoading,
      });
    },
    [dispatch]
  );

  const setSnackBar = useCallback(
    (isError, message) => {
      dispatch({
        type: actionTypes.SET_SNACKBAR,
        snackbar: {
          isOpen: true,
          isError: isError,
          message: message,
        },
      });
    },
    [dispatch]
  );

  const handleUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    setLoader(true);
    try {
      await logout();
    } catch (err) {
      console.log(err);
      setSnackBar(true, 'Failed to log out.');
    }
    setLoader(false);
  };

  useEffect(() => {
    const fetchUserName = async () => {
      setLoader(true);
      try {
        const q = query(
          collection(db, 'users'),
          where('uid', '==', props.user?.uid)
        );
        const doc = await getDocs(q);
        const data = doc.docs[0].data();
        setName(data.name);
      } catch (err) {
        console.log(err);
        setSnackBar(true, 'An error occured while fetching user data.');
      }
      setLoader(false);
    };

    if (props.user && !props.user.displayName) {
      fetchUserName();
    } else if (props.user?.displayName) {
      setName(props.user?.displayName);
    }
  }, [props.user, setLoader, setSnackBar]);

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawer}
          edge="start"
          sx={{
            marginRight: 2,
            ...(isOpen && { display: 'none' }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawer}
          edge="start"
          sx={{
            marginRight: 2,
            ...(!isOpen && { display: 'none' }),
          }}
        >
          {theme.direction === 'rtl' ? (
            <ChevronRightIcon />
          ) : (
            <ChevronLeftIcon />
          )}
        </IconButton>
        <DescriptionSharpIcon
          sx={{
            marginRight: 1,
          }}
        />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          FileSphere Drive
        </Typography>
        {auth && (
          <div>
            <Tooltip title={`Change Mode`}>
              <IconButton sx={{ ml: 1 }} onClick={setTheme} color="inherit">
                {theme.palette.mode === 'dark' ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Open User Menu">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleUserMenu}
                color="inherit"
              >
                {!props.user?.photoURL && <AccountCircle />}

                {props.user?.photoURL && (
                  <Avatar alt={name} src={props.user?.photoURL} />
                )}
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
            >
              <IgnoreDisabledListItem onClick={handleUserMenuClose} disabled>
                <AccountCircle sx={{ color: '#a3a3a3' }} />
                <Typography ml={0.5} noWrap sx={{ color: '#a3a3a3' }}>
                  {name}
                </Typography>
              </IgnoreDisabledListItem>
              <MenuItem
                onClick={handleLogout}
                disabled={isLoading}
                horizontalalignment="Right"
              >
                <Logout sx={{ color: '#a3a3a3' }} />
                <Typography ml={0.5} noWrap>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
