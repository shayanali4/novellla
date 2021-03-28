import React, { useEffect, useState } from 'react';
import $ from 'jquery';

// Addons
import { GetLocalStorage, SetLocalStorage } from '../lib/local-storage';

// Components
import PopupContainer from './popup/main';
import PopupOptions from './popup/options';
import PopupUrl from './popup/url';

// Context
import PopupContext from './popup/context';

/**
 * Popup Box.
 */
function PopupBox() {
  // State
  let [initialized, setInitialized] = useState(false);
  let [popup, setPopup] = useState({
    isOpen: false,
    isSelectUrl: '',
    mode: null,
    open: {
      textType: false,
      textAlignment: false,
      toggleAlphabet: false,
    },
    options: {
      text: false,
      bold: true,
      italic: true,
      underline: false,
      link: true,
      textAlignment: false,
      toggleAlphabet: false,
    },
    position: {
      top: 0,
      left: 0,
    },
  });

  // Effects
  useEffect(() => {
    if (!initialized) {
      let cookies = GetLocalStorage('popup');
      if (cookies) {
        setPopup(docs => ({
          ...docs,
          options: { ...cookies },
        }));
      }

      setInitialized(true);
    } else {
      SetLocalStorage('popup', popup.options);
    }

    let limit = 0;
    $('.type-wrap').on('mouseup', function (e) {
      let getText = window.getSelection().toString().replace(/\s/g, '');
      let isOnPopup = $('.type-wrap > div:first-child').is(':visible');
      if (!getText || isOnPopup) return;

      let selected = window.getSelection().anchorNode.parentNode;
      let isUrl = $(selected).parent().parent().is('a');
      let isSelectUrl = isUrl ? $(selected).parent().parent().attr('href') : '';

      let offset = $('.type-wrap').offset().left;
      let position = {
        top: e.pageY - 145 + 'px',
        left: e.pageX - offset - 15 + 'px',
      };

      if (!limit) {
        setTimeout(() => {
          let selectText = window.getSelection().toString().replace(/\s/g, '');
          if (limit === 1 && selectText) {
            setPopup(docs => ({
              ...docs,
              ...{ isOpen: true, isSelectUrl: isSelectUrl, position: position },
            }));
          }

          limit = 0;
        }, 200);
      }

      limit++;
    });

    $('.type-wrap').on('keydown', function (e) {
      if (!$('.popup-link').length) {
        setPopup(docs => ({ ...docs, isOpen: false }));
      }
    });

    $('.popup-box').on('mousedown', function (e) {
      if (popup.isOpen) {
        e.preventDefault();
      }
    });

    return () => $('.type-wrap').off();
  }, [initialized, popup]);

  // Render
  let PopupContent;
  switch (popup.mode) {
    case 'options':
      PopupContent = PopupOptions;
      break;
   
    
     
    default:
      PopupContent = PopupContainer;
  }

  return (
    <PopupContext.Provider value={[popup, setPopup]}>
      <PopupContent />
    </PopupContext.Provider>
  );
}

export default PopupBox;
