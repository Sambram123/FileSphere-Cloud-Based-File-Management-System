import { Box } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { useDataLayerValue } from '../../context-api/Datalayer';
import { actionTypes } from '../../context-api/reducer';
import { auth, getNotes } from '../../firebase';
import Dashboard from './Dashboard';
import Header from './Header';
import SideDrawer from './SideDrawer';

const Layout = () => {
  const [notes, setNotes] = useState([]);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [showAddNote, setShowAddNote] = useState(true);

  const [fetchNotes, setFetchNotes] = useState(true);
  const [fetchArchived, setFetchArchived] = useState(false);
  const [fetchTrashed, setFetchTrashed] = useState(false);
  const [{ isOpen }, dispatch] = useDataLayerValue();

  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const handleAdd = () => {
    fetchDataFromFireStore('isNote');
  };

  const handleDrawer = () => {
    dispatch({
      type: actionTypes.SET_DRAWER,
      isOpen: false,
    });
  };

  const handleGetNotes = () => {
    handleDrawer();
    setShowAddNote(true);
    setShowDeleteAll(false);
    setFetchNotes(true);
    setFetchArchived(false);
    setFetchTrashed(false);
    setNotes([]);
    fetchDataFromFireStore('isNote');
  };

  const handleGetArchived = () => {
    handleDrawer();
    setShowAddNote(false);
    setShowDeleteAll(false);
    setFetchNotes(false);
    setFetchArchived(true);
    setFetchTrashed(false);
    setNotes([]);
    fetchDataFromFireStore('isArchived');
  };

  const handleGetTrashed = () => {
    handleDrawer();
    setShowAddNote(false);
    setShowDeleteAll(true);
    setFetchNotes(false);
    setFetchArchived(false);
    setFetchTrashed(true);
    setNotes([]);
    fetchDataFromFireStore('isTrashed');
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

  const fetchDataFromFireStore = useCallback(
    async (queryClause) => {
      setLoader(true);
      const receivedNotes = [];
      try {
        const receivedNotesSnapShot = await getNotes(user?.uid, queryClause);
        receivedNotesSnapShot.forEach((d) => {
          const doc = d.data();
          receivedNotes.push({
            id: d.id,
            title: doc.title,
            note: doc.note,
            date: new Date(doc.date.toDate()),
            isNote: doc.isNote,
            isArchived: doc.isArchived,
            isTrashed: doc.isTrashed,
            lastEdited: new Date(doc.lastEdited.toDate()),
            isFile: doc.isFile || false,
            fileName: doc.fileName || '',
            fileType: doc.fileType || '',
            fileSize: doc.fileSize || 0,
            fileUrl: doc.fileUrl || '',
          });
        });

        receivedNotes.sort((a, b) => b.lastEdited - a.lastEdited);
      } catch (err) {
        console.log(err);
      }
      setNotes(receivedNotes);
      setLoader(false);
    },
    [setLoader, user?.uid]
  );

  const handleOnClickLocation = () => {
    if (fetchNotes) fetchDataFromFireStore('isNote');
    if (fetchTrashed) fetchDataFromFireStore('isTrashed');
    if (fetchArchived) fetchDataFromFireStore('isArchived');
  };

  useEffect(() => {
    if (loading) {
      setLoader(true);
      return;
    }
    setLoader(false);
    if (!user) return navigate('/');
    fetchDataFromFireStore('isNote');
  }, [fetchDataFromFireStore, loading, navigate, setLoader, user]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <Header user={user} />
      <SideDrawer
        getNotes={handleGetNotes}
        getArchived={handleGetArchived}
        getTrashed={handleGetTrashed}
        isOpen={isOpen}
      />
      <Dashboard
        onAdd={handleAdd}
        onClickLocation={handleOnClickLocation}
        notes={notes}
        showAddNote={showAddNote}
        showDeleteAll={showDeleteAll}
        uid={user?.uid}
        getTrashed={handleGetTrashed}
      />
    </Box>
  );
};

export default Layout;
