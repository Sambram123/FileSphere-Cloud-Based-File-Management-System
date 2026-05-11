import { Archive, Delete, Edit } from '@mui/icons-material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { setLocation, deleteNote } from '../../../firebase';
import { useDataLayerValue } from '../../../context-api/Datalayer';
import { actionTypes } from '../../../context-api/reducer';
import AlertDialog from '../../UI/AlertDialog';
import { useTheme } from '@emotion/react';

const Note = (props) => {
  const [prompt, setPrompt] = useState(false);
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [{ isLoading }, dispatch] = useDataLayerValue();

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

  const setLocationinFS = async (locationField, flag) => {
    const locationObj = {
      isNote: false,
      isArchived: false,
      isTrashed: false,
      [locationField]: flag,
    };
    setLoader(true);
    try {
      await setLocation(locationObj, props.uid, props.id);
    } catch (err) {
      console.log(err);
    }
    setLoader(false);
    props.onClick();
  };

  const deleteNoteFromFS = async () => {
    setLoader(true);
    try {
      await deleteNote(props.uid, props.id);
      setSnackBar(false, 'File deleted.');
    } catch (err) {
      console.log(err);
      setSnackBar(true, 'Deleting file failed.');
    }
    setLoader(false);
    props.onClick();
  };

  const editNote = () => {
    props.editNote(props.title, props.note, props.id, props.uid);
  };

  const openDialog = () => {
    setPrompt(true);
  };

  const closeDialog = () => {
    setPrompt(false);
  };

  const agreeDelete = () => {
    deleteNoteFromFS();
    setPrompt(false);
  };

  const isImage =
    props.fileType?.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(props.fileName || '');
  const isAudio = props.fileType?.startsWith('audio/');
  const isVideo = props.fileType?.startsWith('video/');
  const isPdf = props.fileType === 'application/pdf';
  const isDoc =
    props.fileType === 'application/msword' ||
    props.fileType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isText = props.fileType?.startsWith('text/');

  const extFromMime = (mime) => {
    const t = (mime || '').toLowerCase();
    const map = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'text/plain': 'txt',
      'text/csv': 'csv',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/x-matroska': 'mkv',
    };
    if (map[t]) return map[t];
    if (t.startsWith('image/') || t.startsWith('audio/') || t.startsWith('video/')) {
      return t.split('/')[1];
    }
    return '';
  };

  const normalizeDownloadName = (filename, mime, responseMime) => {
    const safeBase = (filename || 'download').trim() || 'download';
    const hasExt = /\.[a-z0-9]{1,8}$/i.test(safeBase);
    if (hasExt) return safeBase;
    const ext = extFromMime(mime) || extFromMime(responseMime) || '';
    return ext ? `${safeBase}.${ext}` : safeBase;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (url, filename, type) => {
    if (!url) return;
    try {
      setLoader(true);
      const response = await fetch(url);
      const blob = await response.blob();

      const responseMime = response?.headers?.get?.('content-type') || blob?.type || '';
      const finalName = normalizeDownloadName(filename, type, responseMime);
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed', error);
      window.open(url, '_blank');
    } finally {
      setLoader(false);
    }
  };

  // Google Docs Viewer can preview PDFs and Office docs from any public URL
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
    props.fileUrl || ''
  )}&embedded=true`;

  const showOpenAction = props.isFile && (isImage || isPdf || isDoc || isText);
  const openLabel = isImage ? 'View image' : `Open ${isPdf ? 'PDF' : 'File'}`;
  const openHref = isDoc ? googleViewerUrl : props.fileUrl;

  const FileActions = () => {
    if (!props.isFile) return null;
    return (
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {showOpenAction && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
            href={openHref}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ flex: 1, borderRadius: '999px', textTransform: 'none' }}
          >
            {openLabel}
          </Button>
        )}
        <Button
          variant="contained"
          size="small"
          startIcon={<FileDownloadIcon />}
          onClick={() => handleDownload(props.fileUrl, props.fileName, props.fileType)}
          sx={{ flex: 1, borderRadius: '999px', textTransform: 'none' }}
        >
          Download
        </Button>
      </Stack>
    );
  };

  const FileMeta = () => {
    if (!props.isFile) return null;
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mt: 0.5,
          px: 1,
          py: 0.75,
          borderRadius: '12px',
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.04)',
        }}
      >
        <Typography variant="caption" noWrap sx={{ minWidth: 0, flex: 1 }}>
          {props.fileName || 'File'}
        </Typography>
        {props.fileSize > 0 && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {formatFileSize(props.fileSize)}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <>
      <AlertDialog
        open={prompt}
        agree={agreeDelete}
        close={closeDialog}
        isSingle={true}
      />
      <Card
        variant="outlined"
        sx={{ width: 280, borderRadius: '20px', marginBottom: '10px' }}
      >
        <CardHeader
          title={
            <Tooltip title={props.title}>
              <Typography noWrap gutterBottom variant="h6" component="h4">
                {props.title}
              </Typography>
            </Tooltip>
          }
          subheader={
            <Typography
              sx={{
                fontSize: '11px',
                fontStyle: 'oblique',
              }}
            >
              {props.createdDate}
            </Typography>
          }
          sx={{ display: 'block', overflow: 'hidden' }}
        />
        <CardContent sx={{ paddingBottom: '3px' }}>
          {!props.isFile && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ overflowWrap: 'break-word' }}
            >
              {props.note}
            </Typography>
          )}
          {props.isFile && (
            <Box>
              {props.note && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ marginBottom: '8px', overflowWrap: 'break-word' }}
                >
                  {props.note}
                </Typography>
              )}

              {/* Image preview */}
              {isImage && (
                <Box sx={{ position: 'relative', marginBottom: '8px' }}>
                  <Box
                    component="img"
                    src={props.fileUrl}
                    alt={props.fileName}
                    sx={{
                      width: '100%',
                      height: 190,
                      objectFit: 'cover',
                      borderRadius: '12px',
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(0,0,0,0.03)',
                    }}
                  />
                </Box>
              )}

              {/* PDF Preview */}
              {isPdf && (
                <Box
                  component="iframe"
                  src={props.fileUrl}
                  title={props.fileName}
                  sx={{
                    width: '100%',
                    height: 220,
                    marginBottom: '8px',
                    border: 0,
                    borderRadius: '12px',
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(0,0,0,0.03)',
                  }}
                />
              )}

              {/* Document Preview via Google Docs Viewer */}
              {isDoc && (
                <Box
                  component="iframe"
                  src={googleViewerUrl}
                  title={props.fileName}
                  sx={{
                    width: '100%',
                    height: 220,
                    marginBottom: '8px',
                    border: 0,
                    borderRadius: '12px',
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(0,0,0,0.03)',
                  }}
                />
              )}

              {/* Audio preview */}
              {isAudio && (
                <Box sx={{ marginBottom: '8px' }}>
                  <audio
                    controls
                    src={props.fileUrl}
                    style={{ width: '100%' }}
                  />
                </Box>
              )}

              {/* Video preview */}
              {isVideo && (
                <Box sx={{ marginBottom: '8px' }}>
                  <video
                    controls
                    src={props.fileUrl}
                    style={{ width: '100%' }}
                  />
                </Box>
              )}

              {/* Generic placeholder for non-previewable types */}
              {!isImage && !isPdf && !isDoc && !isAudio && !isVideo && !isText && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    height: 120,
                    marginBottom: '8px',
                    borderRadius: '12px',
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(0,0,0,0.03)',
                  }}
                >
                  <InsertDriveFileIcon sx={{ fontSize: 34, color: '#757575' }} />
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                    File attached
                  </Typography>
                </Box>
              )}

              <FileMeta />
              <FileActions />
            </Box>
          )}
        </CardContent>
        <CardActions
          disableSpacing
          sx={{
            display: 'flex',
            justifyContent: 'right',
            paddingTop: 0,
          }}
        >
          {props.isNote && !props.isFile && (
            <Tooltip title="Edit">
              <IconButton
                aria-label="edit"
                disabled={isLoading}
                className={isPhone ? 'show-button' : 'hidden-button'}
                onClick={editNote}
              >
                <Edit />
              </IconButton>
            </Tooltip>
          )}

          {(props.isNote || props.isArchived) && (
            <Tooltip title="Archive">
              <IconButton
                aria-label="archive"
                disabled={isLoading}
                className={isPhone ? 'show-button' : 'hidden-button'}
                onClick={() => setLocationinFS('isArchived', true)}
              >
                <Archive />
              </IconButton>
            </Tooltip>
          )}
          {props.isArchived && (
            <Tooltip title="Unarchive">
              <IconButton
                aria-label="archive"
                disabled={isLoading}
                className={isPhone ? 'show-button' : 'hidden-button'}
                onClick={() => setLocationinFS('isNote', true)}
              >
                <UnarchiveIcon />
              </IconButton>
            </Tooltip>
          )}
          {props.isTrashed && (
            <Tooltip title="Restore">
              <IconButton
                aria-label="delete"
                disabled={isLoading}
                className={isPhone ? 'show-button' : 'hidden-button'}
                onClick={() => setLocationinFS('isNote', true)}
              >
                <RestoreFromTrashIcon />
              </IconButton>
            </Tooltip>
          )}
          {props.isTrashed && (
            <Tooltip title="Delete Forever">
              <IconButton
                aria-label="delete"
                disabled={isLoading}
                className={isPhone ? 'show-button' : 'hidden-button'}
                onClick={openDialog}
              >
                <DeleteForeverIcon />
              </IconButton>
            </Tooltip>
          )}
          {(props.isNote || props.isArchived) && (
            <Tooltip title="Delete">
              <IconButton
                aria-label="delete"
                disabled={isLoading}
                className={isPhone ? 'show-button' : 'hidden-button'}
                onClick={() => setLocationinFS('isTrashed', true)}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          )}
        </CardActions>
      </Card>
    </>
  );
};

export default Note;
