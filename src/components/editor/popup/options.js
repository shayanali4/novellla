import React, { useContext } from 'react';

// Icons
import {
  AiOutlineBold,
  AiOutlineFontSize,
  AiOutlineAlignLeft,
} from 'react-icons/ai';
import { BiLink, BiItalic, BiUnderline } from 'react-icons/bi';
import { FiCircle, FiCheckCircle } from 'react-icons/fi';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { MdTranslate } from 'react-icons/md';

// Load popup context
import PopupContext from './context';

/**
 * Options.
 */
function PopupOptions() {
  // Context
  let [popup, setPopup] = useContext(PopupContext);

  // Handler
  let handleButton = type => {
    let newOptions = { ...popup.options };
    newOptions[type] = popup.options[type] ? false : true;

    setPopup({ ...popup, options: newOptions });
  };

  let handleClosePopupOptions = () => {
    setPopup(docs => ({ ...docs, mode: null }));
  };

  // Render
  let type = [
    'text',
    'italic',
    'link',
    'bold',
    'underline',
    'textAlignment',
    'toggleAlphabet',
  ];

  let icons = [
    <AiOutlineFontSize size={23} />,
    <BiLink size={23} />,
    <AiOutlineBold size={23} />,
    <BiItalic size={23} />,
    <BiUnderline size={23} />,
    <AiOutlineAlignLeft size={21} />,
    <MdTranslate size={23} />,
  ];

  return (
    <div style={{ display: popup.isOpen ? 'grid' : 'none' }}>
      <div
        className='popup-cover'
        onClick={handleClosePopupOptions.bind(this)}
      ></div>
      <div
        className='popup-box'
        style={{
          top: popup.position.top,
          left: popup.position.left,
        }}
      >
        <div className='popup-option'>
          {icons.map((icon, index) => {
            return (
              <div key={index}>
                <div className='popup-icon'>{icon}</div>
                <div className='popup-icon'>
                  {popup.options[type[index]] ? (
                    <FiCheckCircle
                      size={18}
                      onClick={handleButton.bind(this, type[index])}
                    />
                  ) : (
                    <FiCircle
                      size={18}
                      onClick={handleButton.bind(this, type[index])}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className='popup-icon'>
          <RiArrowGoBackLine
            size={23}
            onClick={handleClosePopupOptions.bind(this)}
          />
        </div>
      </div>
    </div>
  );
}

export default PopupOptions;
