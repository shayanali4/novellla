import React, { useContext } from 'react';
import { RichUtils } from 'draft-js';
import { BiUnderline } from 'react-icons/bi';

// Context
import EditorContext from '../context';
import PopupContext from './context';

/**
 * Underline.
 */
function BeUnderline() {
  // Context
  let [draftState, setDraftState] = useContext(EditorContext);
  let [popup] = useContext(PopupContext);

  // Handler
  let handlerUnderline = () => {
    setDraftState(RichUtils.toggleInlineStyle(draftState, 'UNDERLINE'));
  };

  // Render
  return popup.options.underline ? (
    <div>
      <div className='popup-icon' title='Underline' onClick={handlerUnderline}>
        <BiUnderline size={23} />
      </div>
    </div>
  ) : null;
}

export default BeUnderline;
