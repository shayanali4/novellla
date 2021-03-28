import React, { useContext, useState, useRef } from 'react';

// Context
import TypeContext from '../context';

// Icons
import { AiOutlineDelete } from 'react-icons/ai';

/**
 * Editor.
 */
function NotesEditor() {
  // Reference
  let saveNoteNow = useRef();

  // Context
  let [state, setState] = useContext(TypeContext);
  let { group, key, title, description, note } = state.notes.isOnEdit;

  // State
  let [noteTitle, setNoteTitle] = useState(title);
  let [noteDesc, setNoteDesc] = useState(description);
  let [noteNote, setNoteNote] = useState(note);

  // Handler
  let setNoteState = data => {
    setState(docs => ({ ...docs, notes: { ...docs.notes, ...data } }));
  };

  let handleDelete = () => {
    setNoteState({ isOnDelete: state.notes.isOnEdit });
  };

  let handleAddNew = () => {
    let newIndex = 0;

    for (let note of state.notes.lists) {
      for (let obj of note) {
        if (obj.key > newIndex) newIndex = obj.key;
      }
    }

    let nextIndex = newIndex + 1;
    let newNote = {
      key: nextIndex,
      title: noteTitle || 'Untitled-' + nextIndex,
      description: noteDesc || '',
      note: noteNote || '',
    };

    setNoteState({
      lists: [...state.notes.lists, [newNote]],
      minimise: [...state.notes.minimise, false],
    });
  };

  let handleUpdate = () => {
    let oldNotes = [...state.notes.lists];
    let newNotes = oldNotes.map(function (notes, index) {
      return notes.map(function (note) {
        if (note.key === key && index === group) {
          note.title = noteTitle;
          note.description = noteDesc;
          note.note = noteNote;
        }

        return note;
      });
    });

    setNoteState({ notes: newNotes });
  };

  let handleSave = () => {
    let isNew = typeof state.notes.isOnEdit === 'boolean';
    if (isNew) {
      handleAddNew();
    } else {
      handleUpdate();
    }

    setNoteState({ isOnEdit: false });
  };

  let handleCancel = () => {
    setNoteState({ isOnEdit: false });
  };

  let handleSaveShortcut = e => {
    if (e.ctrlKey && e.key === 'Enter') {
      saveNoteNow.current.click();
    }
  };

  // Render
  return (
    <div className='note-editor'>
      <label>Title</label>
      <input
        type='text'
        defaultValue={title}
        onInput={e => setNoteTitle(e.target.value)}
        onKeyDown={handleSaveShortcut.bind(this)}
      />
      <label>Description</label>
      <textarea
        defaultValue={description}
        onChange={e => setNoteDesc(e.target.value)}
        onKeyDown={handleSaveShortcut.bind(this)}
      />
      <label>Note</label>
      <textarea
        defaultValue={note}
        onChange={e => setNoteNote(e.target.value)}
        onKeyDown={handleSaveShortcut.bind(this)}
      />
      <div>
        <div>
          <button
            className='button-box primary-btn'
            type='button'
            onClick={handleSave.bind(this)}
            ref={saveNoteNow}
          >
            <span>Save</span>
          </button>
        </div>
        <div>
          <button
            className='button-box second-btn'
            type='button'
            onClick={handleCancel.bind(this)}
          >
            <span>Cancel</span>
          </button>
        </div>
        <div>
          <AiOutlineDelete size={25} onClick={handleDelete.bind(this)} />
        </div>
      </div>
    </div>
  );
}

export default NotesEditor;
