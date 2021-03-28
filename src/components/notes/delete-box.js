import React, { useContext } from 'react';
import TypeContext from '../context';

/**
 * Delete box.
 */
function NotesDelete() {
  let [state, setState] = useContext(TypeContext);
  let { key, title, group } = state.notes.isOnDelete;

  // Handler
  let handleCancelDelete = () => {
    setState(docs => ({
      ...docs,
      notes: { ...docs.notes, isOnDelete: false },
    }));
  };

  let handleYesDelete = () => {
    let notes = [...state.notes.lists];
    let minimise = [...state.notes.minimise];

    let noteIndex = 0;
    let isHasSubNote = false;

    for (let [index, note] of notes.entries()) {
      for (let obj of note) {
        if (obj.key === key && index === group) {
          noteIndex = index;
          isHasSubNote = notes[index].length > 1;
        }
      }
    }

    if (isHasSubNote) {
      let isParent = false;

      for (let [index, note] of notes[noteIndex].entries()) {
        if (note.key === key) {
          isParent = index === 0;
        }
      }

      if (isParent) {
        notes.splice(noteIndex, 1);
        minimise.splice(group, 1);
      } else {
        notes[noteIndex] = notes[noteIndex].filter(doc => doc.key !== key);
      }
    } else {
      notes.splice(noteIndex, 1);
    }

    setState(docs => ({
      ...docs,
      notes: {
        ...docs.notes,
        lists: notes,
        minimise: minimise,
        isOnEdit: false,
        isOnDelete: false,
      },
    }));
  };

  /**
   * Render.
   */
  return (
    <div className='delete-note-confirm'>
      <div>
        <h4>Delete Note</h4>
        <p>
          "{title}" will be deleted. These actions can't be undone. Do you want
          to continue?
        </p>
        <button
          className='button-box primary-btn'
          type='button'
          onClick={handleCancelDelete}
        >
          <span>Cancel</span>
        </button>
        <button
          className='button-box second-btn'
          type='button'
          onClick={handleYesDelete}
        >
          <span>Yes</span>
        </button>
      </div>
    </div>
  );
}

export default NotesDelete;
