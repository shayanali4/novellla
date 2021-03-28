import React, { useContext } from 'react';

// Context
import TypeContext from '../../context';

/**
 * Focus.
 */
function Focus(props) {
  // Context
  let [, setState] = useContext(TypeContext);

  // Handler
  let handlerFocusNow = () => {
    setState(docs => ({
      ...docs,
      settings: { ...docs.settings, onFocus: true },
    }));
  };

  // Render
  return (
    <li className='focus-now'>
      <div
        title='Focus'
        onClick={() => {
          props.setOpen();
          handlerFocusNow();
        }}
      >
        <span>Focus!</span>
      </div>
    </li>
  );
}

export default Focus;
