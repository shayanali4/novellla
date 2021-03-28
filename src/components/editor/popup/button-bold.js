import React, { useContext } from 'react';
import { RichUtils } from 'draft-js';

// Icons
import { AiOutlineBold } from 'react-icons/ai';

// Context
import EditorContext from '../context';
import PopupContext from './context';

/**
 * Bold.
 */
function BeBold() {
  // Context
  let [draftState, setDraftState] = useContext(EditorContext);
  let [popup] = useContext(PopupContext);

  // Handler
  let handlerBold = () => {
    setDraftState(RichUtils.toggleInlineStyle(draftState, 'BOLD'));
  };

  // Render
  return popup.options.bold ? (
    <div>
      <div className='popup-icon' title='Bold' onClick={handlerBold}>
        <AiOutlineBold size={23} />
      </div>
    </div>
  ) : null;
}

export default BeBold;
