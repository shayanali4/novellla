import React, { useContext } from 'react';
import { EditorState, Modifier } from 'draft-js';
import { BiLink } from 'react-icons/bi';

// Context
import EditorContext from '../context';
import PopupContext from './context';

/**
 * URL.
 */
function URLEditor() {
  // Context
  let [draftState, setDraftState] = useContext(EditorContext);
  let [popup, setPopup] = useContext(PopupContext);

  // Handler
  let handlerUrl = () => {
    let newContent = Modifier.applyInlineStyle(
      draftState.getCurrentContent(),
      draftState.getSelection(),
      'LINK',
    );

    setDraftState(
      EditorState.set(draftState, {
        currentContent: newContent,
      }),
    );

    setTimeout(() => {
      setPopup(docs => ({ ...docs, mode: 'url' }));
    }, 50);
  };

  // Render
  return popup.options.link ? (
    <div>
      <div className='popup-icon' title='Add links' onClick={handlerUrl}>
        <BiLink size={23} />
      </div>
    </div>
  ) : null;
}

export default URLEditor;
