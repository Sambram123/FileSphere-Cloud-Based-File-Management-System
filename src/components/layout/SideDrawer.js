import {
  ArchiveRounded,
  DeleteForeverRounded,
  NoteAddRounded,
} from '@mui/icons-material/';
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';
import { Drawer, DrawerHeader } from '../../shared/ui-themes';
import { pageArray } from '../../shared/utils';
import { useTheme } from '@emotion/react';
import { useDataLayerValue } from '../../context-api/Datalayer';
import { actionTypes } from '../../context-api/reducer';

const SideDrawer = (props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [, dispatch] = useDataLayerValue();

  const closeDrawer = () => {
    if (!isPhone) return;
    dispatch({
      type: actionTypes.SET_DRAWER,
      isOpen: false,
    });
  };

  const getNotes = (event, index) => {
    setSelectedIndex(index);
    props.getNotes();
    closeDrawer();
  };

  const getArchived = (event, index) => {
    setSelectedIndex(index);
    props.getArchived();
    closeDrawer();
  };

  const getTrashed = (event, index) => {
    setSelectedIndex(index);
    props.getTrashed();
    closeDrawer();
  };

  return (
    <Drawer
      variant={isPhone ? 'temporary' : 'permanent'}
      open={props.isOpen}
      onClose={closeDrawer}
      ModalProps={isPhone ? { keepMounted: true } : undefined}
      sx={
        isPhone
          ? {
              '& .MuiDrawer-paper': {
                width: 280,
                maxWidth: '85vw',
              },
            }
          : undefined
      }
    >
      <DrawerHeader />
      <Divider />
      <List>
        <ListItem key="notes" disablePadding sx={{ display: 'block' }}>
          <Tooltip title={props.isOpen ? '' : pageArray[0]} placement="right">
            <ListItemButton
              selected={selectedIndex === 0}
              onClick={(event) => getNotes(event, 0)}
              sx={{
                minHeight: 48,
                justifyContent: props.isOpen ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: props.isOpen ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <NoteAddRounded />
              </ListItemIcon>
              <ListItemText
                primary={pageArray[0]}
                sx={{ opacity: props.isOpen ? 1 : 0 }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <ListItem key="archived" disablePadding sx={{ display: 'block' }}>
          <Tooltip title={props.isOpen ? '' : pageArray[1]} placement="right">
            <ListItemButton
              selected={selectedIndex === 1}
              onClick={(event) => getArchived(event, 1)}
              sx={{
                minHeight: 48,
                justifyContent: props.isOpen ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: props.isOpen ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <ArchiveRounded />
              </ListItemIcon>
              <ListItemText
                primary={pageArray[1]}
                sx={{ opacity: props.isOpen ? 1 : 0 }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <Divider />
        <ListItem key="trashed" disablePadding sx={{ display: 'block' }}>
          <Tooltip title={props.isOpen ? '' : pageArray[2]} placement="right">
            <ListItemButton
              selected={selectedIndex === 2}
              onClick={(event) => getTrashed(event, 2)}
              sx={{
                minHeight: 48,
                justifyContent: props.isOpen ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: props.isOpen ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <DeleteForeverRounded />
              </ListItemIcon>
              <ListItemText
                primary={pageArray[2]}
                sx={{ opacity: props.isOpen ? 1 : 0 }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default SideDrawer;
