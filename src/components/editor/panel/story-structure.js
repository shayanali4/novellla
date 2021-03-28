import React, { useContext, useState } from 'react';

// Context.
import TypeContext from '../../context';

// Icons.
import { IoIosArrowDown } from 'react-icons/io';

// Local
import { GetStructure } from './story-structure-lib';

/**
 * Story Structures
 */
function StoryStructure(props) {
  // Context
  let [, setState] = useContext(TypeContext);

  // State
  let [confirm, setConfirm] = useState(false);

  // Handler
  let handlerStructure = name => {
    let notes = GetStructure(name);
    let minimise = [];

    for (var i = 0; i < notes.length; i++) {
      minimise.push(false);
    }

    setState(docs => ({
      ...docs,
      notes: {
        ...docs.notes,
        lists: [...docs.notes.lists, ...notes],
        minimise: [...docs.notes.minimise, ...minimise],
      },
    }));
  };

  // Render
  let structure = [
    '3-Act-Structure',
    'Hero’s Journey',
    "Vogler’s Writer's Journey",
    'Freytag’s Pyramid',
    'Vladimir Propp',
    '27 Chapter Method',
    '8 Sequence Dramatic Structure',
    'Dan Harmon Story Circle',
    'Seven Point Story Structure',
    'General Story Structure',
    'Dean Koontz’s Classic Story Structure',
  ];

  return (
    <li>
      <div
        className='panel-icon'
        title='Story Structures'
        onClick={() => props.setOpen(props.panel.story ? '' : 'story')}
      >
        <IoIosArrowDown
          size={23}
          style={{
            transform: props.panel.story ? 'rotate(-180deg)' : 'rotate(0deg)',
          }}
        />
      </div>
      <div
        className='panel-popup story-structure'
        style={{ display: props.panel.story ? 'block' : 'none' }}
      >
        <div
          className='story-structure-confirm'
          style={{ visibility: confirm ? 'visible' : 'hidden' }}
        >
          <div>
            <p>
              Add <i>"{confirm || 'Blablabla'}"</i> to the notes?
            </p>
            <div className='story-action'>
              <div
                onClick={() => {
                  handlerStructure(confirm);
                  setConfirm(false);
                }}
              >
                Yes
              </div>
              <div onClick={() => setConfirm(false)}>Cancel</div>
            </div>
          </div>
        </div>
        {structure.map((text, index) => {
          return (
            <p key={index} onClick={() => setConfirm(text)}>
              {text}
            </p>
          );
        })}
      </div>
    </li>
  );
}

export default StoryStructure;
