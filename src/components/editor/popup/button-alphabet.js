import React, { useContext, useEffect, useRef } from 'react';
import { getSelectionText } from 'draftjs-utils';
import { EditorState, Modifier } from 'draft-js';
import $ from 'jquery';

// Icons
import { BsFillTriangleFill } from 'react-icons/bs';
import { MdTranslate } from 'react-icons/md';

// Context
import EditorContext from '../context';
import PopupContext from './context';

/**
 * Text type.
 */
function SwitchAlphabet() {
  // Reference
  let boxRef = useRef();

  // Context
  let [draftState, setDraftState] = useContext(EditorContext);
  let [popup, setPopup] = useContext(PopupContext);

  // Handler
  let handleAlphabet = language => {
    let text = getSelectionText(draftState);
    let character = [
      'a b c d e f g h i j k l m n o p q r s t u v w x y z',
      'ǎ б ц д ɛ ф г ĥ и й к л ḿ н ó п ȹ ŕ ś т ũ в щ ẃ ы з',
      '月 官 匹 刀 三 下 巨 升 工 丁 水 心 冊 內 口 戶 已 尺 弓 七 臼 人 山 父 了 乙',
    ];
    let code = ['en', 'ru', 'tr'];
    let replacedChar;
    let modifiedText = text.toLowerCase().split('');

    for (let [index, name] of code.entries()) {
      if (name === language) {
        replacedChar = character[index].split(' ');
      }
    }

    for (let char of character) {
      for (let [number, name] of modifiedText.entries()) {
        for (let [index, alphabet] of char.split(' ').entries()) {
          if (name === alphabet) {
            modifiedText[number] = replacedChar[index];
          }
        }
      }
    }

    let currentText = modifiedText.join('');

    let selection = draftState.getSelection();
    if (!selection.isCollapsed()) {
      let newAlphabet = Modifier.replaceText(
        draftState.getCurrentContent(),
        selection,
        currentText,
        null,
      );

      setDraftState(EditorState.push(draftState, newAlphabet, 'new-alphabet'));
    }
  };

  // Effects
  useEffect(() => {
    $('body').on('click', function (e) {
      let clickInside = $(e.target).closest(boxRef.current).length;
      if (!clickInside && popup.open.toggleAlphabet) {
        setPopup(docs => ({
          ...docs,
          open: {
            ...docs.open,
            toggleAlphabet: false,
          },
        }));
      }
    });

    return () => $('body').off();
  });

  // Render
  let titles = ['English', 'Russian', 'Traditional'];
  let languages = ['en', 'ru', 'tr'];

  return popup.options.toggleAlphabet ? (
    <div ref={boxRef}>
      <div
        className='popup-icon'
        title='Toggle alphabet'
        onClick={() => {
          setPopup(docs => ({
            ...docs,
            open: {
              ...docs.open,
              toggleAlphabet: !docs.open.toggleAlphabet,
            },
          }));
        }}
      >
        <MdTranslate size={23} />
      </div>
      <div
        className='popup-options popup-alphabet'
        style={{
          display: popup.open.toggleAlphabet ? 'block' : 'none',
        }}
      >
        <BsFillTriangleFill size={10} />
        {titles.map((title, index) => {
          return (
            <div
              key={index}
              onClick={handleAlphabet.bind(this, languages[index])}
            >
              {title}
            </div>
          );
        })}
      </div>
    </div>
  ) : null;
}

export default SwitchAlphabet;
