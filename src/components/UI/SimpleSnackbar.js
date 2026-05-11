import { Stack } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import * as React from 'react';
import { useDataLayerValue } from '../../context-api/Datalayer';
import { actionTypes } from '../../context-api/reducer';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function SimpleSnackbar() {
  const [{ snackbar }, dispatch] = useDataLayerValue();

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch({
      type: actionTypes.SET_SNACKBAR,
      snackbar: { isOpen: false, isError: false, message: '' },
    });
  };

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {snackbar.isError && (
        <Snackbar
          open={snackbar.isOpen}
          autoHideDuration={6000}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
      {!snackbar.isError && (
        <Snackbar
          open={snackbar.isOpen}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Stack>
  );
}
