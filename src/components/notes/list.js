import React, { useContext, useEffect } from 'react';

// jQuery
import $ from 'jquery';
import 'jquery-ui/ui/widgets/sortable';
import 'jquery-ui/ui/widgets/draggable';

// Icons
import { CgNotes } from 'react-icons/cg';
import { FiPaperclip, FiDownload } from 'react-icons/fi';
import { HiOutlineTrash, HiMinusCircle } from 'react-icons/hi';

// Context
import TypeContext from '../context';

/**
 * Notes.
 */
function NotesList() {
  // Context
  let [state, setState] = useContext(TypeContext);
  // Handler
  let handleAddNew = () => {
    setState(docs => ({ ...docs, notes: { ...docs.notes, isOnEdit: true } }));
  };
  
  let handleEdit = (num, note) => {
    setState(docs => ({
      ...docs,
      notes: { ...docs.notes, isOnEdit: { group: num, ...note } },
    }));
  };
  
  let handleDelete = (num, note) => {
    setState(docs => ({
      ...docs,
      notes: { ...docs.notes, isOnDelete: { group: num, ...note } },
    }));
  };
  
  let handleNoteIcon = current => {
    let icons = <CgNotes size={15} />;
    
    if (current) {
      icons = <FiPaperclip size={14} />;
    }
    
    return icons;
  };
  

  let handleNoteMinimise = index => {
    let newMinimise = [...state.notes.minimise];
    let isMinimise = newMinimise[index] ? false : true;
    
    newMinimise.splice(index, 1, isMinimise);
    setState(docs => ({
      ...docs,
      notes: { ...docs.notes, minimise: newMinimise },
    }));
  };
  
  let handleToggleNoteButton = (list, index, num) => {
    let icons = null;
    
    if (list.length > 1 && !index) {
      icons = (
        <div
          className='toggle-note'
          onClick={handleNoteMinimise.bind(this, num)}
          >
          <HiMinusCircle />
        </div>
      );
    }
    
    return icons;
  };
  
  let handleDownloadNote = () => {
    let content = '';
    
    for (let [index, note] of state.notes.lists.entries()) {
      content += `# Note ${index + 1}\n\n`;
      
      for (let nt of note) {
        content += `Title: ${nt.title}\n`;
        content += `Description: ${nt.description}\n`;
        content += `Note: ${nt.note}\n`;
      }
      
      if (index + 1 !== state.notes.lists.length) {
        content += '\n';
      }
    }

    let element = document.createElement('a');
    let file = new Blob([content], { type: 'text/plain' });
    
    element.href = URL.createObjectURL(file);
    element.download = 'notes.txt';
    element.click();
  };
  
  /**
   * Effects
   */
  useEffect(() => {
    console.log("state",state.notes)
    
    let handleMoveToSubNotes = (from, to) => {
      console.log("from =>", from);
      console.log("to =>", to);
      // notes
      let newNotes = [...state.notes.lists];
      newNotes[to] = [...newNotes[to], ...newNotes[from]];
      newNotes = newNotes.filter((note, index) => index !== from);

      // minimise
      let newMinimise = [...state.notes.minimise];
      newMinimise.splice(from, 1);
      newMinimise[to] = true;
      console.log("minimize",newMinimise)

      setState(docs => ({
        ...docs,
        notes: { ...docs.notes, lists: newNotes, minimise: newMinimise },
      }));
    };

    let handleMoveToMainNotes = (from, id, target) => {
      console.log("from =>", from);
      console.log("id =>", id);
      console.log("target =>", target);
      let notes = [...state.notes.lists];
      let minimise = [...state.notes.minimise];
      let data = null;

      for (let note of notes[from]) {
        if (note.key === id) {
          data = note;
        }
      }

      // cant find not id
      if (!data) {
        console.log("no data")
        return
      } else {
        console.log("data",data)
      };

      // remove moved note from the last block
      notes[from] = notes[from].filter(doc => doc.key !== data.key);

      // insert a note on the specific index
      notes.splice(target, 0, [data]);
      minimise.splice(target, 0, false);

      // update state
      setState(docs => ({
        ...docs,
        notes: { ...docs.notes, lists: notes, minimise: minimise },
      }));
    };

    let handleMovePosition = (from, to) => {
      // notes
      let notes = [...state.notes.lists];
      let dragged = notes[from];

      // minimise
      let minimise = [...state.notes.minimise];
      let draggedMin = minimise[from];

      if (from > to) {
        notes.splice(from, 1);
        notes.splice(to, 0, dragged);
        minimise.splice(from, 1);
        minimise.splice(to, 0, draggedMin);
      } else {
        notes.splice(from, 1);
        notes.splice(to, 0, dragged);
        minimise.splice(from, 1);
        minimise.splice(to, 0, draggedMin);
      }

      setState(docs => ({
        ...docs,
        notes: { ...docs.notes, lists: notes, minimise: minimise },
      }));
    };

    let handleMoveSubNotePosition = (group, from, to) => {
      if (from === to) return;

      let notes = [...state.notes.lists];
      let subNotes = [...notes[group]];
      let dragged = subNotes[from];

      if (from > to) {
        subNotes.splice(from, 1);
        subNotes.splice(to, 0, dragged);
      } else {
        subNotes.splice(from, 1);
        subNotes.splice(to, 0, dragged);
      }

      notes[group] = subNotes;

      setState(docs => ({
        ...docs,
        notes: { ...docs.notes, lists: notes },
      }));
    };

    // open new note form by key command
    $(document).on('keydown', function (e) {
      if (e.ctrlKey && e.altKey && e.keyCode === 77) {
        setState(docs => ({
          ...docs,
          notes: { ...docs.notes, isOnEdit: true },
        }));
      }
    });

    // Main notes
    let dropOn = 0;
    let sortOn = 0;
    let parentNoteId;

    $('.notes-list').sortable({
      axis: 'y',
      items: '> [data-type="sort"]',
      containment: '.notes-list',
      start: function (event, ui) {
        parentNoteId = $(ui.item).data('note');
      },
      sort: function (event, ui) {
        // Dropable
        let parent = $(ui.item).parent().position();
        let blockPosition = parent.top + ui.position.top;
        let heightRange = 0;
        let notes = $('.notes-list').find(
          `> div:not([data-note="${parentNoteId}"])`,
        );

        $(notes).each(function (num, note) {
          let boxHeight = $(note).height();
          let rangeStart = heightRange;
          let rangeEnd = rangeStart + boxHeight;

          if (blockPosition > rangeStart && blockPosition < rangeEnd) {
            dropOn = num;
            sortOn = num;
          }

          heightRange += boxHeight + 12;
        });

        // Sortable
        let onSortHelper = $(notes[dropOn]).data('note');
        if (dropOn !== parentNoteId && typeof onSortHelper === 'number') {
          sortOn = false;
          $(ui.item).addClass('be-child');
        } else {
          dropOn = false;
          $(ui.item).removeClass('be-child');
        }
      },
      stop: function (event, ui) {
        $(this).sortable('cancel');
        $('.notes-list > div').addClass('be-child');

        if (typeof dropOn === 'number') {
          handleMoveToSubNotes(parentNoteId, dropOn);
        } else if (typeof sortOn === 'number') {
          handleMovePosition(parentNoteId, sortOn);
        }
      },
    });

    // Sub notes
    let sortOnOut = false;
    let goingOutPosition = 0;
    let sortSubNote;
    let subNoteId;

    $('.notes-list > div').sortable({
      items: '> div:not(:first-child)',
      containment: '.notes-list',
      axis: 'y',
      start: function (event, ui) {
        subNoteId = $(ui.item).data('id');
        parentNoteId = $(ui.item).data('note');

        $(ui.item).parent().find('> div').addClass('sorting');
      },
      sort: function (event, ui) {
        let parent = $(ui.item).parent().position();
        let height = $(ui.item).parent().outerHeight();
        let blockPosition = parent.top + ui.position.top;
        let isGoingUp = parent.top - 10 > blockPosition;
        let isGoingDown = parent.top + height - 10 < blockPosition;

        let subNotes = $(ui.item)
          .parent()
          .find(`> div:not([data-id="${subNoteId}"])`);

        if (isGoingUp || isGoingDown) {
          goingOutPosition = isGoingUp ? parentNoteId : parentNoteId + 1;
          console.log("hello ")
          sortOnOut = true;
        } else {
          sortOnOut = false;

          $(subNotes).each(function (num, note) {
            let isPlaceholder = $(note).hasClass('ui-sortable-placeholder');
            if (isPlaceholder) {
              sortSubNote = num;
            }
          });
        }
      },
      stop: function (event, ui) {
        $(this).sortable('cancel');
        $(ui.item).parent().find('> div').removeClass('sorting');

        if (sortOnOut) {
          handleMoveToMainNotes(parentNoteId, subNoteId, goingOutPosition);
        } else {
          handleMoveSubNotePosition(parentNoteId, subNoteId, sortSubNote);
        }
      },
    });
  }, [state, setState]);

  // Render
  return (
    <div
      className='notes-wrap'
      style={{
        display: state.notes.isOnEdit ? 'none' : 'block',
      }}
    >
      <div className='notes-list'>
        {state.notes.lists.map((doc, num) => {
          return (
            <div
              key={num}
              data-type='sort'
              data-note={num}
              className={state.notes.minimise[num] ? 'note-min' : ''}
            >
              {doc.map((note, index) => {
                return (
                  <div
                    className='note-list'
                    data-note={num}
                    data-id={index}
                    key={index}
                  >
                    <div>
                      {handleToggleNoteButton(
                        state.notes.lists[num],
                        index,
                        num,
                      )}



                      <div>{handleNoteIcon(index)}</div>
                      <div
                        className='note-content'
                        onClick={handleEdit.bind(this, num, note)}
                      >
                        <span>{note.title}</span>
                      </div>
                      <div>
                        <HiOutlineTrash
                          onClick={handleDelete.bind(this, num, note)}
                          size={17}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className='note-list-control'>
        <button
          type='button'
          className='button-box primary-btn'
          onClick={handleAddNew}
        >
          <span>Add note</span>
        </button>
        {state.notes.lists.length ? (
          <div onClick={handleDownloadNote.bind(this)}>
            <FiDownload size={23} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default NotesList;
