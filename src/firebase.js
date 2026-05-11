import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const userCollectionRef = collection(db, 'users');
const userDataRef = collection(db, 'userData');

// ─── Cloudinary configuration (FREE tier) ────────────────────────────
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

/**
 * Determine the correct Cloudinary resource type for a file.
 * Some browsers/devices provide an empty `file.type`, so we also fall back to the filename extension.
 *
 * - Images & PDFs → 'image' (enables thumbnails/transforms, bypasses raw restrictions)
 * - Videos/Audio → 'video'
 * - docs, text, everything else → 'raw' (serves original file as-is)
 */
const getResourceType = (fileType, fileName = '') => {
  const t = (fileType || '').toLowerCase();
  const ext = (fileName.split('.').pop() || '').toLowerCase();

  if (t === 'application/pdf' || ext === 'pdf') return 'image';
  if (t.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext))
    return 'image';
  if (
    t.startsWith('video/') ||
    t.startsWith('audio/') ||
    ['mp4', 'mkv', 'mov', 'webm', 'mp3', 'wav', 'ogg', 'm4a'].includes(ext)
  )
    return 'video';
  return 'raw';
};

/**
 * Upload a file to Cloudinary (free tier).
 * Uses unsigned upload preset — no server-side auth needed.
 */
const uploadToCloudinary = async (file, folder) => {
  const resourceType = getResourceType(file.type, file.name);
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  console.log('[Cloudinary] Uploading:', file.name, 'Size:', file.size, 'Type:', file.type, 'ResourceType:', resourceType);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Cloudinary] Upload failed:', response.status, errorData);
    throw new Error(errorData?.error?.message || `Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log('[Cloudinary] Upload successful:', data.secure_url);
  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
  };
};

/**
 * Delete a file from Cloudinary.
 * Note: Unsigned deletion is not supported by Cloudinary, so we only
 * remove the Firestore document. The Cloudinary file will remain but
 * won't be accessible from the app. For production, use a backend endpoint.
 */
const deleteFromCloudinary = async (publicId) => {
  // Cloudinary does not support unsigned deletion from the client.
  // Files will be cleaned up when the free tier quota resets or
  // you can delete them from the Cloudinary dashboard manually.
  console.log('[Cloudinary] File marked for deletion (manual cleanup):', publicId);
};

// ─── Auth functions ──────────────────────────────────────────────────

const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const q = query(userCollectionRef, where('uid', '==', user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await addDoc(userCollectionRef, {
        uid: user.uid,
        name: user.displayName,
        authProvider: 'google',
        email: user.email,
      });
    }
  } catch (err) {
    throw new Error(err);
  }
};

const logInWithEmailAndPassword = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw new Error(err);
  }
};

const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      name,
      authProvider: 'local',
      email,
    });
  } catch (err) {
    throw new Error(err);
  }
};

const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    throw new Error(err);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    throw new Error(err);
  }
};

// ─── Notes CRUD ──────────────────────────────────────────────────────

const addNote = async (title, note, uid) => {
  try {
    const saveNote = {
      title: title,
      note: note,
      uid: uid,
      date: Timestamp.fromDate(new Date()),
      isNote: true,
      isArchived: false,
      isTrashed: false,
      lastEdited: Timestamp.fromDate(new Date()),
    };
    const notesRef = collection(userDataRef, uid, 'notes');
    await setDoc(doc(notesRef), saveNote);
  } catch (err) {
    throw new Error(err);
  }
};

const addFileNote = async (title, note, file, uid) => {
  const notesRef = collection(userDataRef, uid, 'notes');
  const noteRef = doc(notesRef);
  const folder = `notes-app/${uid}`;

  // Step 1: Upload file to Cloudinary (FREE)
  let uploadResult;
  try {
    uploadResult = await uploadToCloudinary(file, folder);
  } catch (uploadErr) {
    console.error('[addFileNote] Cloudinary upload failed:', uploadErr.message);
    throw uploadErr;
  }

  // Step 2: Save note metadata to Firestore (FREE on Spark plan)
  const saveNote = {
    title: title,
    note: note || '',
    uid: uid,
    date: Timestamp.fromDate(new Date()),
    isNote: true,
    isArchived: false,
    isTrashed: false,
    lastEdited: Timestamp.fromDate(new Date()),
    isFile: true,
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    fileUrl: uploadResult.url,
    cloudinaryPublicId: uploadResult.publicId,
  };

  try {
    await setDoc(noteRef, saveNote);
    console.log('[addFileNote] Firestore document saved');
  } catch (fsErr) {
    console.error('[addFileNote] Firestore save failed:', fsErr.message);
    throw fsErr;
  }
};

const editNote = async (title, note, uid, id) => {
  try {
    const noteRef = doc(userDataRef, uid, 'notes', id);
    const editNote = {
      title: title,
      note: note,
      lastEdited: Timestamp.fromDate(new Date()),
    };
    await updateDoc(noteRef, editNote);
  } catch (err) {
    throw new Error(err);
  }
};

const setLocation = async (locationObj, uid, id) => {
  try {
    const noteRef = doc(userDataRef, uid, 'notes', id);
    await updateDoc(noteRef, locationObj);
  } catch (err) {
    throw new Error(err);
  }
};

const getNotes = async (uid, queryClause) => {
  try {
    const notesRef = collection(userDataRef, uid, 'notes');
    const q = query(notesRef, where(queryClause, '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot;
  } catch (err) {
    throw new Error(err);
  }
};

const deleteNote = async (uid, id) => {
  try {
    const noteRef = doc(userDataRef, uid, 'notes', id);
    const notesSnap = await getDocs(
      query(collection(userDataRef, uid, 'notes'), where('__name__', '==', id))
    );
    // Try to clean up Cloudinary reference
    notesSnap.forEach((d) => {
      const data = d.data();
      if (data?.cloudinaryPublicId) {
        deleteFromCloudinary(data.cloudinaryPublicId);
      }
    });
    await deleteDoc(noteRef);
  } catch (err) {
    throw new Error(err);
  }
};

const deleteMultiple = async (noteIds, uid) => {
  try {
    if (!uid) {
      console.log('uid is missing');
      return;
    }
    const batch = writeBatch(db);
    const notesRef = collection(userDataRef, uid, 'notes');
    const notesSnapShot = await getDocs(notesRef);
    notesSnapShot.forEach((noteDoc) => {
      if (noteIds.includes(noteDoc.id)) {
        const noteData = noteDoc.data();
        if (noteData?.cloudinaryPublicId) {
          deleteFromCloudinary(noteData.cloudinaryPublicId);
        }
      }
    });
    noteIds.forEach((id) => {
      batch.delete(doc(userDataRef, uid, 'notes', id));
    });
    await batch.commit();
  } catch (err) {
    throw new Error(err);
  }
};

export {
  auth,
  db,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout,
  addNote,
  addFileNote,
  editNote,
  getNotes,
  setLocation,
  deleteNote,
  deleteMultiple,
};
