import React, { useContext, useEffect, useState } from 'react';

// Components
import NotesList from './list';
import NotesEditor from './editor';
import NotesDelete from './delete-box';
import { SetLocalStorage, GetLocalStorage } from '../lib/local-storage';

// Context
import TypeContext from '../context';

// Icons
import NotesIcon from './icons';
import { IoCloseSharp } from 'react-icons/io5';

/**
 * Notes.
 */
function NotesBox() {
  // Context
  let [state, setState] = useContext(TypeContext);

  // State
  let [openNotes, setOpenNotes] = useState(false);
  let [initialized, setInitialized] = useState(false);

  // Handler
  let handleOpenNewNote = e => {
    if (e.ctrlKey && e.altKey && e.key === 'm') {
      setOpenNotes(true);
    }
  };

  // Effects
  useEffect(() => {
    if (!initialized) {
      let notes = GetLocalStorage('notes');
      if (notes) {
        setState(docs => ({ ...docs, notes: { ...docs.notes, ...notes } }));
      }
      setInitialized(true);
    } else {
      SetLocalStorage('notes', state.notes);
    }

    window.addEventListener('keydown', handleOpenNewNote);
    return () => window.removeEventListener('keydown', handleOpenNewNote);
  }, [setState, state, initialized]);

  // Render
  return (
    <div
      className={`${openNotes ? 'notes-box' : 'notes-icon'}`}
      style={{
        visibility: state.settings.onFocus ? 'hidden' : 'visible',
        opacity: state.settings.onFocus ? 0 : 1,
        pointerEvents: state.settings.onFocus ? 'none' : 'auto',
      }}
    >
      <div className='notes-handler'>
        {openNotes ? (
          <div onClick={() => setOpenNotes(false)}>
            <IoCloseSharp size={15} />
            <span>Close</span>
          </div>
        ) : (
          <div onClick={() => setOpenNotes(true)}>
            <NotesIcon />
          </div>
        )}
      </div>
      <div
        style={{
          display: openNotes ? 'block' : 'none',
        }}
      >
        <NotesList />
      </div>
      {state.notes.isOnEdit && openNotes ? <NotesEditor /> : null}
      {state.notes.isOnDelete && openNotes ? <NotesDelete /> : null}
    </div>
  );
}

export default NotesBox;
