import React, { useContext, useEffect, useState } from 'react';
import { Editor, EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import $ from 'jquery';

// Addons
import { GetLocalStorage, SetLocalStorage } from '../lib/local-storage';

// Draft.js
import {
  CustomBlockMap,
  CustomBlockStyleMap,
  CustomStyleMap,
  DecoratorLists,
} from './draft/setup';
import KeyCommand from './draft/key-command';
import KeyBinding from './draft/key-binding';
import SyncTimelines from './draft/sync-timeline';
import WordCounter from './draft/word-counter';
import 'draft-js/dist/Draft.css';

// Context
import TypeContext from '../context';
import EditorContext from './context';

// Components
import PopupBox from './popup';
import EditorPanel from './panel';
import WordCountBox from './addons/word-count';

/**
 * Editor box.
 */
function EditorBox() {
  // Context
  let [state, setState] = useContext(TypeContext);

  // State
  let [initialized, setInitialized] = useState(false);
  let [draftState, setDraftState] = useState(
    EditorState.createEmpty(DecoratorLists()),
  );

  // Handler
  let handleKeyCommand = (command, editorState) => {
    KeyCommand(command, editorState, draftState, setDraftState);
  };

  let handleKeyBinding = e => {
    return KeyBinding(e, draftState);
  };

  // Effects
  useEffect(() => {
    // Cookies
    if (!initialized) {
      let cookies = GetLocalStorage('editor');
      if (cookies) {
        setDraftState(
          EditorState.createWithContent(
            convertFromRaw(cookies),
            DecoratorLists(),
          ),
        );
      }

      SyncTimelines(setState);
      setInitialized(true);
    } else {
      SetLocalStorage('editor', convertToRaw(draftState.getCurrentContent()));
    }

    // Word count
    $('body').on('keyup', function (e) {
      if (
        [' ', 'Enter', 'Backspace', '.', '?', '!'].includes(e.key) ||
        (e.ctrlKey && ['v', 'x', 'z'].includes(e.key.toLowerCase())) ||
        (e.shiftKey && e.ctrlKey && e.key.toLowerCase() === 'z')
      ) {
        WordCounter(draftState, setState);
        SyncTimelines(setState);
      }
    });

    return () => $('body').off('keyup');
  }, [initialized, draftState, setDraftState, state, setState]);

  // Render
  let DraftConfig = {
    blockRenderMap: CustomBlockMap,
    blockStyleFn: CustomBlockStyleMap,
    customStyleMap: CustomStyleMap,
    editorState: draftState,
    handleKeyCommand: handleKeyCommand,
    onChange: setDraftState,
    placeholder: 'Start writing . . .',
    spellCheck: true,
    stripPastedStyles: true,
    keyBindingFn: handleKeyBinding,
  };

  return (
    <EditorContext.Provider value={[draftState, setDraftState]}>
      <div className={`type-box ${state.editor.textWidth}-box`}>
        <EditorPanel />
        <div className='type-wrap'>
          <PopupBox />
          <div className={`type-editor ${state.editor.fontFamily}-box`}>
            <Editor {...DraftConfig} />
          </div>
        </div>
        <WordCountBox />
      </div>
    </EditorContext.Provider>
  );
}

export default EditorBox;
