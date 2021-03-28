import React, { useContext } from 'react';
import { RichUtils } from 'draft-js';

// Icons
import { BiItalic } from 'react-icons/bi';

// Context
import EditorContext from '../context';
import PopupContext from './context';

/**
 * Italic.
 */
function BeItalic() {
  // Context
  let [draftState, setDraftState] = useContext(EditorContext);
  let [popup] = useContext(PopupContext);

  // Handler
  let handlerItalic = () => {
    setDraftState(RichUtils.toggleInlineStyle(draftState, 'ITALIC'));
  };

  // Render
  return popup.options.italic ? (
    <div>
      <div className='popup-icon' title='Italic' onClick={handlerItalic}>
        <BiItalic size={23} />
      </div>
    </div>
  ) : null;
}

export default BeItalic;
