import React, { useContext, useEffect, useRef } from 'react';
import $ from 'jquery';

// Addons
import ButtonText from './button-text-type';
import ButtonURL from './button-url';
import ButtonBold from './button-bold';
import ButtonItalic from './button-italic';
import ButtonUnderline from './button-underline';
import ButtonTextAlign from './button-text-align';
import ButtonAlphabet from './button-alphabet';

// Icons
import { BsFillTriangleFill } from 'react-icons/bs';
import { HiPlus } from 'react-icons/hi';

// Context
import PopupContext from './context';

/**
 * Popup Container.
 */
function PopupContainer() {
  // Reference
  let coverRef = useRef();

  // Context
  let [popup, setPopup] = useContext(PopupContext);

  // Effects
  useEffect(() => {
    $(document).on('click', function (e) {
      let clickOutside = $(e.target).closest(coverRef.current).length;
      if (clickOutside && popup.isOpen) {
        if (window.getSelection) {
          if (window.getSelection().empty) {
            window.getSelection().empty();
          } else if (window.getSelection().removeAllRanges) {
            window.getSelection().removeAllRanges();
          }
        } else if (document.selection) {
          document.selection.empty();
        }

        setPopup(docs => ({ ...docs, isOpen: false }));
      }
    });

    return () => $(document).off();
  }, [popup, setPopup]);

  // Render
  return (
    <div style={{ display: popup.isOpen ? 'grid' : 'none' }}>
      <div className='popup-cover' ref={coverRef}></div>
      <div
        className='popup-box'
        style={{
          top: popup.position.top,
          left: popup.position.left,
        }}
      >
        <BsFillTriangleFill size={14} />
        <div className='popup-list'>
          <ButtonText />
          {/* <ButtonURL /> */}
          <ButtonBold />
          <ButtonItalic />
          <ButtonUnderline />
          <ButtonTextAlign />
          <ButtonAlphabet />
        </div>
        <div className='popup-icon' title='Settings'>
          <HiPlus
            size={23}
            onClick={() => {
              setPopup({ ...popup, mode: 'options' });
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default PopupContainer;
