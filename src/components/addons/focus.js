import React, { useContext } from 'react';

// Context
import TypeContext from '../context';

// Icons
import { RiArrowGoBackLine } from 'react-icons/ri';

/**
 * Exit.
 */
function ExitFocusMode() {
  // Context
  let [state, setState] = useContext(TypeContext);

  // Render
  return !state.settings.onFocus ? null : (
    <div
      className='focus-exit'
      onClick={() => {
        setState(docs => ({
          ...docs,
          settings: { ...docs.settings, onFocus: false },
        }));
      }}
    >
      <span>Exit</span>
      <RiArrowGoBackLine size={16} />
    </div>
  );
}

export { ExitFocusMode };
