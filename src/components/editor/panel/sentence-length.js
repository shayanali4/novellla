import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { convertToRaw, EditorState, Modifier, SelectionState } from 'draft-js';
import $ from 'jquery';

// Addons
import { GetLocalStorage, SetLocalStorage } from '../../lib/local-storage';

// Context
import EditorContext from '../context';

// Icons
import { BsFillQuestionCircleFill } from 'react-icons/bs';

// Sentences
function GetAllSentences(contents) {
  let sentences = [];

  for (let sentence of contents) {
    sentences.push({
      key: sentence.key,
      type: null,
      position: { start: 0, end: sentence.text.length },
    });
  }

  return sentences;
}

// Sentence type
function GetSentenceType(contents, current) {
  let typeLists = [];

  for (let block of contents) {
    let content = block.text.split(' ');

    let startPosition = 0;
    let endPosition = 0;
    let wordsLists = [];
    let endOfSentences = ['.', '?', '!'];

    for (let [index, text] of content.entries()) {
      endPosition += text.length + 1;
      wordsLists.push(text);

      if (
        endOfSentences.includes(text.slice(-1)) ||
        index === content.length - 1
      ) {
        let type = 'short';
        let totalWord = wordsLists.filter(text => text.length).length;

        if (totalWord > 10) {
          type = 'longest';
        } else if (totalWord > 4 && totalWord < 11) {
          type = 'long';
        } else if (totalWord > 2 && totalWord < 6) {
          type = 'medium';
        }

        if (totalWord) {
          typeLists.push({
            key: block.key,
            type: type,
            position: {
              start: startPosition,
              end:
                endPosition - (endOfSentences.includes(text.slice(-1)) ? 2 : 1),
            },
          });
        }

        wordsLists = [];
        startPosition = endPosition;
      }
    }
  }

  if (!current.length) {
    return typeLists;
  }

  let newLists = [];
  for (let list of typeLists) {
    let isExists = false;

    for (let doc of current) {
      if (
        doc.key === list.key &&
        doc.position.start === list.position.start &&
        doc.position.end === list.position.end
      ) {
        isExists = true;
      }
    }

    if (!isExists) newLists.push(list);
  }

  return newLists;
}

/**
 * Sentence length.
 */
function SentenceLength(props) {
  // Reference
  let btnRef = useRef();
  let boxRef = useRef();

  // Context
  let [draftState, setDraftState] = useContext(EditorContext);

  // State
  let [initialized, setInitialized] = useState(false);
  let [openPopup, setOpenPopup] = useState(false);


  let [Focus, setFocus] = useState(false);

  




  let [sentence, setSentence] = useState({
    active: false,
    added: [],
    listed: [],
    removed: [],
    completed: false,
    syncing: false,
    selection: {},
  });

  // Handler
  let handlerApplySentenceLength = useCallback(() => {
    setFocus(!Focus)
    if (sentence.syncing) {
      
      return;
    }

    let content = convertToRaw(draftState.getCurrentContent());
    let currentSelection = draftState.getSelection();
    let newSelection = {
      focusOffset: currentSelection.getFocusOffset(),
      anchorOffset: currentSelection.getAnchorOffset(),
    };

    if (!sentence.active) {
      let styleContent = GetSentenceType(content.blocks, sentence.listed);
      let currentListed = [...sentence.listed, ...styleContent];
      let isCompleted = currentListed.length ? false : true;

      setSentence(docs => ({
        ...docs,
        active: true,
        added: styleContent,
        listed: currentListed,
        completed: isCompleted,
        selection: newSelection,
      }));
    } else {
      let AllSentences = GetAllSentences(content.blocks);
      let sentencesLists = AllSentences.length ? AllSentences : sentence.listed;

      setSentence(docs => ({
        ...docs,
        active: false,
        listed: [],
        removed: sentencesLists,
        completed: false,
        selection: newSelection,
      }));
    }
  }, [draftState, sentence]);

  let handlerSyncSentenceLength = useCallback(() => {
    let content = convertToRaw(draftState.getCurrentContent());
    let styleContent = GetSentenceType(content.blocks, sentence.listed);

    if (sentence.syncing || !styleContent.length) {
      return;
    }

    let currentSelection = draftState.getSelection();
    let newSelection = {
      focusOffset: currentSelection.getFocusOffset(),
      anchorOffset: currentSelection.getAnchorOffset(),
    };

    setSentence(docs => ({
      ...docs,
      added: styleContent,
      completed: styleContent.length ? false : true,
      listed: [...docs.listed, ...styleContent],
      selection: newSelection,
    }));
  }, [draftState, sentence]);

  let handlerAddStyle = useCallback(
    ({ key, position, type }) => {
      if (sentence.syncing) {
        return;
      }

      // Mark as syncing
      setSentence(docs => ({ ...docs, syncing: true }));

      // Highlighting text
      let updateSelection = new SelectionState({
        anchorKey: key,
        anchorOffset: position.start,
        focusKey: key,
        focusOffset: position.end,
      });
      let newEditor = EditorState.acceptSelection(draftState, updateSelection);

      let contentState = draftState.getCurrentContent();
      let contentStateWithEntity = contentState.createEntity(
        'SENTENCE',
        'MUTABLE',
        {
          type: type,
        },
      );

      let entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      let newContentState = Modifier.applyEntity(
        contentStateWithEntity,
        newEditor.getSelection(),
        entityKey,
      );

      if ([...sentence.added].length === 1) {
        let contentStateWithEntity = EditorState.set(draftState, {
          currentContent: newContentState,
        });

        let newSelection = contentStateWithEntity
          .getSelection()
          .merge(sentence.selection);

        newContentState = EditorState.forceSelection(
          contentStateWithEntity,
          newSelection,
        );
      } else {
        newContentState = EditorState.set(draftState, {
          currentContent: newContentState,
        });
      }

      setDraftState(newContentState);

      // Update sentence lists
      let lastSentence = [...sentence.added];
      let newSentence = lastSentence.slice(1, lastSentence.length);
      let isCompleted = !newSentence.length ? true : false;

      setSentence(docs => ({
        ...docs,
        syncing: false,
        added: newSentence,
        completed: isCompleted,
      }));
    },
    [draftState, setDraftState, sentence],
  );

  let handlerRemoveStyle = useCallback(
    ({ key, position, type }) => {
      if (sentence.syncing) {
        return;
      }

      // Mark as syncing
      setSentence(docs => ({ ...docs, syncing: true }));

      // Highlighting text
      let updateSelection = new SelectionState({
        anchorKey: key,
        anchorOffset: position.start,
        focusKey: key,
        focusOffset: position.end,
      });
      let newEditor = EditorState.acceptSelection(draftState, updateSelection);
      let newContentState = Modifier.applyEntity(
        newEditor.getCurrentContent(),
        newEditor.getSelection(),
        null,
      );

      if ([...sentence.removed].length === 1) {
        let contentStateWithEntity = EditorState.set(draftState, {
          currentContent: newContentState,
        });

        let newSelection = contentStateWithEntity
          .getSelection()
          .merge(sentence.selection);

        newContentState = EditorState.forceSelection(
          contentStateWithEntity,
          newSelection,
        );
      } else {
        newContentState = EditorState.set(draftState, {
          currentContent: newContentState,
        });
      }

      setDraftState(newContentState);

      // Update sentence lists
      let lastSentence = [...sentence.removed];
      let newSentence = lastSentence.slice(1, lastSentence.length);
      let isCompleted = !newSentence.length ? true : false;

      setSentence(docs => ({
        ...docs,
        syncing: false,
        removed: newSentence,
        completed: isCompleted,
      }));
    },
    [draftState, setDraftState, sentence],
  );

  let handlerSyncListed = useCallback(() => {
    let content = convertToRaw(draftState.getCurrentContent()).blocks;
    let latestContent = ((content[0] || {}).text || '').length;

    if (!latestContent) {
      setSentence(docs => ({ ...docs, listed: [] }));
    }
  }, [draftState, setSentence]);

  // Effects
  useEffect(() => {
    // Hide highligh if clicked outside
    $('body').on('click', function (e) {
      let clickInside = $(e.target).closest('.sentence-guide').length;
      let clickButton = $(e.target).closest('.sentence-box').length;

      if (!clickInside && openPopup && !clickButton) {
        setOpenPopup(false);
      }
    });

    // Apply highlight
    if (sentence.added.length && !sentence.syncing) {
      handlerAddStyle(sentence.added[0]);
    }

    if (sentence.removed.length && !sentence.syncing) {
      handlerRemoveStyle(sentence.removed[0]);
    }

    // Save to cookies
    if (!initialized) {
      let cookies = GetLocalStorage('sentence');
      if (cookies) {
        setSentence({ ...cookies });
      }

      setInitialized(true);
    } else {
      SetLocalStorage('sentence', sentence);
    }

    // Auto set highlight
    $('body').on('keyup', function (e) {
      let endOfSentences = ['.', '?', '!', 'Enter'];
      if (
        sentence.completed &&
        endOfSentences.includes(e.key) &&
        !sentence.syncing &&
        sentence.active
      ) {
        handlerSyncSentenceLength();
      } else if (e.key === 'Backspace' && sentence.active) {
        handlerSyncListed();
      }
    });

    return () => $('body').off();
  }, [
    handlerAddStyle,
    handlerRemoveStyle,
    handlerApplySentenceLength,
    handlerSyncListed,
    handlerSyncSentenceLength,
    initialized,
    openPopup,
    setOpenPopup,
    sentence,
    setSentence,
  ]);


  // Render
  return (
    <li 
    >
      <div className='sentence-box panel-icon'>
        <svg style={ Focus? { color:"#444"} : {color:"rgba(0,0,0,0.2"}}
          xmlns='http://www.w3.org/2000/svg'
          width='31'
          height='31'
          viewBox='0 0 50 30.55'
          onClick={handlerApplySentenceLength}
          onChange
          fill='currentColor'
        
        >
          <title>Sentence length</title>
          <g id='Layer_2' data-name='Layer 2'>
            <g id='Layer_1-2' data-name='Layer 1'>
              <path d='M47.21,25.21v-2.1H45.84l-1,1.68-.94-1.7H42.52l-.83,1.68-1-1.66H39.27l-.87,1.66-.9-1.68H36.2l-1.09,1.69-.85-1.68H33l-.91,1.68-.92-1.69H29.87l-1.1,1.68a7.78,7.78,0,0,1-.51-1.84c0-2.35.27-2.63,2.53-2.63H47.67c2,0,2.32.27,2.32,2.3s0,4,0,5.95c0,1-.13,2-1.33,2s-1.45-.92-1.42-1.95a2.58,2.58,0,0,0-.12-.57H4.88C.77,28,0,27.24,0,23.07V5.51c0-2.89,1.08-4,3.94-4.18Q12.21.73,20.47,0c2.71-.23,4,.52,5,3.05,1.15,2.86,2.26,5.73,3.43,8.58a5.38,5.38,0,0,1-.11,4.91c-.51.92-.76,2-1.29,2.89-1,1.8-.87,3.71-.75,5.74Zm-33.4-20a9.31,9.31,0,0,0-9.2,9.29,9.24,9.24,0,0,0,18.47-.08A9.28,9.28,0,0,0,13.81,5.21Zm17.55.07-.92-.92c-.61-.57-1.21-1.15-1.85-1.69-.43-.36-.92-.65-1.39-1-.11.56-.46,1.2-.29,1.66.89,2.5,1.87,5,2.91,7.41.18.44.84,1,1.2,1,.8-.12.7-.82.55-1.53-.31-1.54-.49-3.11-.73-4.67ZM13.81,22.35A7.91,7.91,0,1,0,6,14.42,7.9,7.9,0,0,0,13.81,22.35Z' />
            </g>
          </g>
        </svg>
        <span
          onClick={() => {
            props.setOpen(props.panel.sentence ? '' : 'sentence')
            setOpenPopup(!openPopup);
          }}
          ref={btnRef}
        >
          <BsFillQuestionCircleFill size={12} />
        </span>
      </div>
      <div
        className='panel-popup sentence-guide'
        style={{ display: openPopup ? 'block' : 'none' }}
        ref={boxRef}
      >
        <p>
          <span className='sentence-short'>Now listen.</span>
          <span className='sentence-long'>
            I vary the sentence length and I create music.
          </span>
          <span className='sentence-short'>Music.</span>
          <span className='sentence-medium'>The writing sings.</span>
          <span className='sentence-long'>
            It has a pleasant rhythm, a littl, a harmomy.
          </span>
          <span className='sentence-medium'>I use short sentences.</span>
          <span className='sentence-long'>
            And I use sentences of medium length.
          </span>
          <span className='sentence-longest'>
            And sometimes when I am certain the reader is rested, I will engage
            him with a sentence of considerable length, a sentence that burns
            with energy and builds with all the impetus of a crescendo, the roll
            of the drumbs, the crash of the cymbals - sounds that say listen to
            this, it is important.
          </span>
        </p>
        <p>
          <span className='sentence-longest'>
            So write with a combination of short, medium, and long sentences.
          </span>
          <span className='sentence-long'>
            Create a sound that pleases the reader's ear.
          </span>
          <span className='sentence-medium'>Don't just write words.</span>
          <span className='sentence-short'>Write music.</span>
        </p>
        <div className='sentence-explain'>
          <span className='sentence-short'>1-2 words</span>
          <span className='sentence-medium'>3-5 words</span>
          <span className='sentence-long'>6-9 words</span>
          <span className='sentence-longest'>10+ words</span>
        </div>
      </div>
    </li>
  );
}

export default SentenceLength;
