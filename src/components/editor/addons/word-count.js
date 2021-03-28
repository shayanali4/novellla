import React, { useContext } from 'react';

// Draftjs
import { GetReadingTime } from '../draft/lib';

// Context
import TypeContext from '../../context';

/**
 * Word count.
 */
function WordCountBox() {
  // Context
  let [state] = useContext(TypeContext);

  // Render
  return state.settings.wordCount ? (
    <div
      className='word-count'
      style={{
        visibility: state.settings.onFocus ? 'visible' : 'visible',
        opacity: state.settings.onFocus ? 1 : 1,
        pointerEvents: state.settings.onFocus ? 'none' : 'auto',
      }}
    >
      <div>
        <div>
          <div className='word-label'>
            <span   >{state.editor.totalWord}  words</span>
          </div>
          <div className='word-label'>
            <span>{GetReadingTime(state.editor.totalWord)} reading time</span>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}

export default WordCountBox;
