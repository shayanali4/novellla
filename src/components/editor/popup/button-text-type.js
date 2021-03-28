import React, { useContext, useEffect, useRef } from 'react';
import { EditorState, Modifier } from 'draft-js';
import $ from 'jquery';

// Icons
import { AiOutlineFontSize } from 'react-icons/ai';

// Context
import EditorContext from '../context';
import PopupContext from './context';

/**
 * Text type.
 */
function TextType() {
  // Reference
  let boxRef = useRef();

  // Context
  let [draftState, setDraftState] = useContext(EditorContext);
  let [popup, setPopup] = useContext(PopupContext);

  // Handler
  let handlerSwitchType = type => {
    let selection = draftState.getSelection();
    let contentState = draftState.getCurrentContent();
    let blockData = Modifier.setBlockType(
      contentState,
      selection,
      type.toLowerCase(),
    );

    setDraftState(EditorState.push(draftState, blockData, 'set-block-type'));
  };

  // Effects
  useEffect(() => {
    $('body').on('click', function (e) {
      let clickInside = $(e.target).closest(boxRef.current).length;
      if (!clickInside && popup.open.textType) {
        setPopup(docs => ({
          ...docs,
          open: {
            ...docs.open,
            textType: false,
          },
        }));
      }
    });

    return () => $('body').off();
  });

  // Render
  let titles = ['Section', 'Chapter', 'Scene', 'Normal'];

  return popup.options.text ? (
    <div ref={boxRef}>
      <div
        className='popup-icon'
        title='Text'
        onClick={() => {
          setPopup(docs => ({
            ...docs,
            open: {
              ...docs.open,
              textType: !docs.open.textType,
            },
          }));
        }}
      >
        <AiOutlineFontSize size={23} />
      </div>
      <div
        className='popup-text'
        style={{ display: popup.open.textType ? 'grid' : 'none' }}
      >
        {titles.map((title, index) => {
          return (
            <div key={index} onClick={handlerSwitchType.bind(this, title)}>
              <span>{title}</span>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;
}

export default TextType;
