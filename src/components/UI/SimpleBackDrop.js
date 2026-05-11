import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import * as React from 'react';
import { useDataLayerValue } from '../../context-api/Datalayer';

export default function SimpleBackDrop() {
  const [{ isLoading }] = useDataLayerValue();

  return (
    <div>
      <Backdrop
        sx={{
          width: '100%',
          height: '100vh',
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
