import { ListItem } from '@mui/material';
import React from 'react';

export const pageArray = ['My Files', 'Archived Files', 'Trash'];

export const IgnoreDisabledListItem = React.forwardRef(
  function IgnoreDisabledListItem({ disabled, ...other }, ref) {
    return <ListItem {...other} ref={ref} />;
  }
);
