import React, { useContext } from 'react';
import { FaYinYang } from 'react-icons/fa';
import TypeContext from '../../context';

/**
 * Dark mode.
 */
function DarkMode(props) {
  let [, setState] = useContext(TypeContext);

  return (
    <li>
      <div className='panel-icon'>
        <FaYinYang
          size={21}
          onClick={() => {
            props.setOpen()
            setState(docs => ({
              ...docs,
              settings: {
                ...docs.settings,
                colorMode:
                  docs.settings.colorMode === 'dark' ? 'bright' : 'dark',
              },
            }));
          }}
        />
      </div>
    </li>
  );
}

export default DarkMode;
