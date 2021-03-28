import React, { useContext, useEffect, useRef } from 'react';
import { Modifier, EditorState } from 'draft-js';
import $ from 'jquery';

// Icons
import {
  AiOutlineAlignLeft,
  AiOutlineAlignRight,
  AiOutlineAlignCenter,
} from 'react-icons/ai';
import { BsFillTriangleFill, BsJustify } from 'react-icons/bs';

// Context
import EditorContext from '../context';
import PopupContext from './context';

/**
 * Text align.
 */
function TextAlign() {
  // Reference
  let boxRef = useRef();

  // Context
  let [draftState, setDraftState] = useContext(EditorContext);
  let [popup, setPopup] = useContext(PopupContext);

  // Handler
  let Handler = style => {
    let selection = draftState.getSelection();
    let contentState = draftState.getCurrentContent();
    let textStyle = `text-${style.toLowerCase()}`;
    let blockData = Modifier.setBlockData(contentState, selection, {
      text_align: textStyle,
    });

    setDraftState(EditorState.push(draftState, blockData, 'text-align'));
  };

  // Effects
  useEffect(() => {
    $('body').on('click', function (e) {
      let clickInside = $(e.target).closest(boxRef.current).length;
      if (!clickInside && popup.open.textAlignment) {
        setPopup(docs => ({
          ...docs,
          open: {
            ...docs.open,
            textAlignment: false,
          },
        }));
      }
    });

    return () => $('body').off();
  });

  // Render
  let titles = ['Justify', 'Left', 'Right', 'Center'];
  let icons = [
    <BsJustify size={21} />,
    <AiOutlineAlignLeft size={21} />,
    <AiOutlineAlignRight size={21} />,
    <AiOutlineAlignCenter size={21} />,
  ];

  return popup.options.textAlignment ? (
    <div ref={boxRef}>
      <div
        className='popup-icon'
        title='Text align'
        onClick={() => {
          setPopup(docs => ({
            ...docs,
            open: {
              ...docs.open,
              textAlignment: !docs.open.textAlignment,
            },
          }));
        }}
      >
        <AiOutlineAlignLeft size={23} />
      </div>
      <div
        className='popup-options'
        style={{
          display: popup.open.textAlignment ? 'grid' : 'none',
          gridRowGap: '3px',
        }}
      >
        <BsFillTriangleFill size={10} />
        {titles.map((title, index) => {
          return (
            <div
              key={index}
              title={title}
              className='popup-icon'
              onClick={Handler.bind(this, title)}
            >
              {icons[index]}
            </div>
          );
        })}
      </div>
    </div>
  ) : null;
}

export default TextAlign;
