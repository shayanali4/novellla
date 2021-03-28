import React, { useContext, useEffect, useRef, useState } from 'react';
import { convertToRaw, EditorState, Modifier, SelectionState } from 'draft-js';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';

// Icons
import { FiSearch } from 'react-icons/fi';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { VscWordWrap } from 'react-icons/vsc';

// Context
import EditorContext from '../context';

/**
 * Find & replace
 * @param {object} props parent property
 */
function FindAndReplace(props) {
  // Reference
  let inputRef = useRef();
  let findBoxRef = useRef();

  // Context
  let [draftState, setDraftState] = useContext(EditorContext);

  // State
  let initialState = { word: '', replace: '', current: 0, founded: [] };
  let [find, setFind] = useState(initialState);
  let [syncing, setSyncing] = useState(false);

  // Handler
  let handleRandomPlaceholder = () => {
    let result = '';
    let characters = 'abcdefghijklmnopqrstuvwxyz';
    let charactersLength = characters.length;
    for (var i = 0; i < find.word.length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    if (result === find.word) {
      handleRandomPlaceholder();
    } else {
      return result;
    }
  };

  let handleAddHighlight = (words, editor) => {
    let { key, start, end } = words;
    let updateSelection = new SelectionState({
      anchorKey: key,
      anchorOffset: start,
      focusKey: key,
      focusOffset: end,
    });
    let newEditor = EditorState.acceptSelection(editor, updateSelection);
    let newState = Modifier.applyInlineStyle(
      newEditor.getCurrentContent(),
      newEditor.getSelection(),
      'FIND',
    );

    return EditorState.push(editor, newState);
  };

  let handleRemoveHighlight = (words, editor) => {
    let { key, start, end } = words;
    let updateSelection = new SelectionState({
      anchorKey: key,
      anchorOffset: start,
      focusKey: key,
      focusOffset: end,
    });
    let newEditor = EditorState.acceptSelection(editor, updateSelection);
    let newState = Modifier.removeInlineStyle(
      newEditor.getCurrentContent(),
      newEditor.getSelection(),
      'FIND',
    );

    return EditorState.push(editor, newState);
  };

  let handleGetWords = () => {
    let blocks = convertToRaw(draftState.getCurrentContent()).blocks;
    let founded = [];

    for (let block of blocks) {
      let text = block.text;
      let regex = new RegExp(find.word);
      let holder = handleRandomPlaceholder();

      while (text.includes(find.word)) {
        let start = text.indexOf(find.word);

        founded.push({
          key: block.key,
          start: start,
          end: start + find.word.length,
        });

        text = text.replace(regex, holder);
      }
    }

    return founded;
  };

  let handleFindNow = () => {
    if (syncing) {
      return;
    }

    setSyncing(true);

    let words = handleGetWords();
    setFind(doc => ({ ...doc, current: 0, founded: words }));

    if (words.length) {
      setDraftState(handleAddHighlight(words[0], draftState));
    }

    setSyncing(false);
  };

  let handleNextWord = () => {
    if (find.current + 1 === find.founded.length) {
      return;
    }

    // Remove current highlight
    let currentWord = find.founded[find.current];
    let newRemovedState = handleRemoveHighlight(currentWord, draftState);

    // Add new highlight
    let nextWord = find.founded[find.current + 1];
    let newAddedState = handleAddHighlight(nextWord, newRemovedState);

    setDraftState(newAddedState);

    // Update current index
    setFind(doc => ({ ...doc, current: doc.current + 1 }));

    // Move word highlight
    handleScrollHighlight(find.current + 1);
  };

  let handlePrevWord = () => {
    if (!find.current) {
      return;
    }

    // Remove current highlight
    let currentWord = find.founded[find.current];
    let newRemovedState = handleRemoveHighlight(currentWord, draftState);

    // Add new highlight
    let nextWord = find.founded[find.current - 1];
    let newSelection = handleAddHighlight(nextWord, newRemovedState);

    setDraftState(newSelection);

    // Update current index
    setFind(doc => ({ ...doc, current: doc.current - 1 }));

    // Move word highlight
    handleScrollHighlight(find.current - 1);
  };

  let handlePressEnter = e => {
    if (e.key === 'Enter' && find.word.length > 1) {
      handleFindNow();
    }
  };

  let handleTypeWord = e => {
    setFind(doc => ({ ...doc, word: e.target.value }));
  };

  let handleTypeReplace = e => {
    setFind(doc => ({ ...doc, replace: e.target.value }));
  };

  let handleSwitchingBox = e => {
    if (e.ctrlKey && e.key === 'g') {
      e.preventDefault();
      if (props.panel.replace) {
        props.setOpen('');
        setFind(initialState);
        $('.find-and-replace').draggable('destroy');

        if (find.founded.length) {
          handleRemoveHighlight(find.founded[find.current]);
        }
      } else {
        props.setOpen('replace');
        inputRef.current.focus();
        $('.find-and-replace').draggable('enable');
      }
    }
  };

  let handleResetFindWord = e => {
    let clickBox = $(e.target).closest(findBoxRef.current).length;
    if (!clickBox && find.founded.length) {
      let newState = handleRemoveHighlight(
        find.founded[find.current],
        draftState,
      );

      setDraftState(newState);
      setFind(initialState);
    }
  };

  let handleReplaceText = (word, editor) => {
    let { key, start, end } = word;
    let updateSelection = new SelectionState({
      anchorKey: key,
      anchorOffset: start,
      focusKey: key,
      focusOffset: end,
    });
    let newEditor = EditorState.acceptSelection(editor, updateSelection);
    let newState = Modifier.replaceText(
      newEditor.getCurrentContent(),
      newEditor.getSelection(),
      find.replace,
    );

    return EditorState.push(editor, newState);
  };

  let handleReplaceOne = () => {
    if (!find.founded.length) {
      return;
    }

    // Replace current text
    let newReplacedState = handleReplaceText(
      find.founded[find.current],
      draftState,
    );

    // Sync found words
    let currentWords = handleSyncPosition([...find.founded]);
    currentWords.splice(find.current, 1);

    let currentIndex =
      find.current + 1 > currentWords.length
        ? currentWords.length
        : find.current;

    // Sync current highlight
    if (currentWords.length) {
      let newContentHighlight = handleAddHighlight(
        currentWords[currentIndex],
        newReplacedState,
      );

      setDraftState(newContentHighlight);
      setFind(doc => ({
        ...doc,
        current: currentIndex,
        founded: currentWords,
      }));
    } else {
      setDraftState(newReplacedState);
      setFind(initialState);
      props.setOpen('');
    }

    // Move word highlight
    handleScrollHighlight(find.current);
  };

  let handleReplaceAll = () => {
    if (!find.founded.length) {
      return;
    }

    // Replace the word
    let words = [...find.founded];
    let newState = draftState;

    while (words.length) {
      newState = handleReplaceText(words[0], newState);
      words = handleSyncPosition(words);
      words.splice(0, 1);
    }

    // Update and reset the default value
    setDraftState(newState);
    setFind(initialState);
    props.setOpen('');
  };

  let handleScrollHighlight = index => {
    let box = find.founded[index];
    let boxPosition = $(
      `[data-contents="true"] > [data-offset-key="${box.key}-0-0"]`,
    ).position();
    let position = $(
      '[style="background-color: rgb(250, 183, 18);"]',
    ).position();
    let addons = boxPosition ? 20 : 0;
    let totalPosition = boxPosition.top + addons + position.top - 20;

    if (totalPosition) {
      window.scrollTo({ top: totalPosition, behavior: 'smooth' });
    }
  };

  let handleSyncPosition = words => {
    if (find.replace.length === find.word.length) {
      return words;
    }

    let different = find.replace.length - find.word.length;
    let current = find.founded[find.current];

    return words.map((doc, index) => {
      if (index > find.current && doc.key === current.key) {
        doc.start = doc.start + different;
        doc.end = doc.end + different;
      }

      return doc;
    });
  };

  // Effects
  useEffect(() => {
    $('.find-and-replace').draggable();
    $('body').on('click', handleResetFindWord);
    window.addEventListener('keydown', handleSwitchingBox);

    return () => {
      $('body').off('click', handleResetFindWord);
      window.removeEventListener('keydown', handleSwitchingBox);
    };
  });

  // Render
  return (
    <div
      className='find-and-replace'
      style={{ display: props.panel.replace ? 'block' : 'none' }}
      ref={findBoxRef}
    >
      <div className='find-box'>
        <FiSearch size={24} />
        <input
          type='text'
          placeholder='Find in document'
          onInput={handleTypeWord}
          onKeyDown={handlePressEnter}
          ref={inputRef}
          value={find.word}
        />
        <span
          style={{
            display: find.founded.length ? 'block' : 'none',
          }}
        >
          {find.current + 1}/{find.founded.length}
        </span>
      </div>
      <div className='find-box'>
        <VscWordWrap size={20} />
        <input
          type='text'
          placeholder='Replace with'
          onInput={handleTypeReplace}
          value={find.replace}
        />
      </div>
      <div className='find-button'>
        <div onClick={handleReplaceOne}>
          <span>Replace</span>
        </div>
        <div onClick={handleReplaceAll}>
          <span>Replace all</span>
        </div>
        <div
          title='Previous'
          onClick={handlePrevWord}
          className={find.current ? '' : 'find-disable'}
        >
          <MdChevronLeft size={22} />
        </div>
        <div
          title='Next'
          onClick={handleNextWord}
          className={
            find.current + 1 === find.founded.length ? 'find-disable' : ''
          }
        >
          <MdChevronRight size={22} />
        </div>
      </div>
    </div>
  );
}

export default FindAndReplace;
