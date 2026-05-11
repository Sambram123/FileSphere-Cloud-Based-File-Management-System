import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {
  Card,
  CardActions,
  FormHelperText,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useRef, useState } from 'react';
import { useDataLayerValue } from '../../../context-api/Datalayer';
import { actionTypes } from '../../../context-api/reducer';
import { addFileNote, editNote } from '../../../firebase';

const AddNote = (props) => {
  const inputRef = useRef();
  const initialValues = {
    title: '',
    note: '',
  };
  const [oldNote, setOldNote] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});

  const [isUpdate, setUpdate] = useState(false);
  const [{ isLoading }, dispatch] = useDataLayerValue();

  const handleEdit = () => {
    props.handleEdit();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevState) => {
      return { ...prevState, [name]: value };
    });
  };

  const validate = (values) => {
    const errors = {};

    /* Un Comment if title needs to be mandatory */

    // if (!values.title || values.title.trim() === '') {
    //   errors.title = 'Title is required!';
    // } else if (values.title.length < 4) {
    //   errors.title = 'Title must be more than 4 characters';
    // } else if (values.title.length > 25) {
    //   errors.title = 'Title cannot exceed more than 25 characters';
    // }

    if (!isUpdate && !selectedFile) {
      errors.note = 'Please upload a file.';
    }

    if (values.note && values.note.trim() !== '' && values.note.length < 4) {
      errors.note = 'Description must be more than 4 characters';
    }

    if (isUpdate) {
      if (oldNote === values.note) {
        errors.note = 'Please update note';
      }
    }

    return errors;
  };

  const closeEdit = () => {
    setFormValues(initialValues);
    setFormErrors({});
    setSelectedFile(null);
    setUpdate(false);
    props.closeEdit();
  };

  const setLoader = (isLoading) => {
    dispatch({
      type: actionTypes.SET_LOADER,
      isLoading: isLoading,
    });
  };

  const setSnackBar = (isError, message) => {
    dispatch({
      type: actionTypes.SET_SNACKBAR,
      snackbar: {
        isOpen: true,
        isError: isError,
        message: message,
      },
    });
  };

  const addNoteToDB = async () => {
    setLoader(true);
    try {
      if (selectedFile) {
        await addFileNote(
          formValues.title,
          formValues.note,
          selectedFile,
          props.uid
        );
      }
      setSnackBar(false, 'File uploaded successfully.');
      setFormValues(initialValues);
      setSelectedFile(null);
      props.closeEdit();
      props.onAdd();
    } catch (err) {
      console.error('[AddNote] Upload error:', err);
      const errorMsg = err?.message
        ? `Upload failed: ${err.message.substring(0, 120)}`
        : 'An error occurred while uploading file.';
      setSnackBar(true, errorMsg);
    } finally {
      setLoader(false);
    }
  };

  const updateNoteToDB = async () => {
    setLoader(true);
    try {
      await editNote(formValues.title, formValues.note, props.uid, props.id);
      setSnackBar(false, 'Note updated successfully.');
    } catch (err) {
      console.log(err);
      setSnackBar(true, 'An error occured while updating note.');
    }
    setLoader(false);
    setFormValues(initialValues);
    setUpdate(false);
    props.closeEdit();
    props.onAdd();
  };

  const addEditNote = (e) => {
    e.preventDefault();
    const errors = validate(formValues);
    const isSubmit = Object.keys(errors).length === 0;
    setFormErrors(errors);

    if (isSubmit) {
      if (isUpdate) {
        updateNoteToDB();
        return;
      }
      addNoteToDB();
    }
  };

  useEffect(() => {
    // const timeout = setTimeout(() => {
    inputRef.current.focus();
    // }, 100);

    // return () => {
    //   clearTimeout(timeout);
    // };
  }, [props.edit]);

  useEffect(() => {
    if (props.isUpdate) {
      setFormValues({ title: props.title, note: props.note });
      setOldNote(props.note);
      setUpdate(true);
    }
  }, [props.isUpdate, props.note, props.title]);

  return (
    <Card
      variant="outlined"
      sx={{
        maxWidth: 400,
        minWidth: 200,
        margin: '0 auto',
        borderRadius: '20px',
        marginBottom: '30px',
      }}
      onClick={handleEdit}
    >
      <Typography
        sx={{ padding: '20px', ...(props.edit && { display: 'none' }) }}
      >
        Upload a file ...
      </Typography>
      <Box
        sx={{
          padding: '20px 20px 0 20px',
          transition: 'display 2s',
          ...(!props.edit && { display: 'none' }),
        }}
      >
        <form onSubmit={addEditNote}>
          <TextField
            error={formErrors.title && formErrors.title !== ''}
            helperText={formErrors.title}
            id="standard-basic"
            label="Title.."
            variant="outlined"
            size="small"
            name="title"
            value={formValues.title}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            error={formErrors.note && formErrors.note !== ''}
            helperText={formErrors.note}
            id="standard-multiline-flexible"
            label="Add description (optional)"
            multiline
            maxRows={4}
            fullWidth
            name="note"
            value={formValues.note}
            onChange={handleChange}
            inputRef={inputRef}
            variant="outlined"
            size="small"
            sx={{
              marginTop: '20px',
            }}
          />
          {!isUpdate && (
            <>
              <TextField
                type="file"
                fullWidth
                size="small"
                inputProps={{
                  accept:
                    '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.mp4,.mkv',
                }}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedFile(file);
                }}
                sx={{ marginTop: '20px' }}
              />
              {selectedFile && (
                <FormHelperText>
                  Selected file: {selectedFile.name}
                </FormHelperText>
              )}
            </>
          )}
          <CardActions
            disableSpacing
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingRight: 0,
            }}
          >
            <IconButton
              variant="outlined"
              color="error"
              aria-label="add to favorites"
              disabled={isLoading}
              onClick={closeEdit}
            >
              <CloseIcon />
            </IconButton>
            <IconButton
              variant="outlined"
              color="primary"
              aria-label="share"
              type="submit"
              disabled={isLoading}
            >
              <AddIcon />
            </IconButton>
          </CardActions>
        </form>
      </Box>
    </Card>
  );
};

export default AddNote;
