import React, { useContext, useState } from 'react';
import { convertToRaw, EditorState, Modifier, RichUtils } from 'draft-js';

// Icons
import { BiLink } from 'react-icons/bi';
import { BsFillTriangleFill } from 'react-icons/bs';

// Context
import PopupContext from './context';
import EditorContext from '../context';

/**
 * Popup url editor.
 */
function PopupUrl() {
  // Context
  let [popup, setPopup] = useContext(PopupContext);
  let [draftState, setDraftState] = useContext(EditorContext);

  // State
  let [url, setUrl] = useState(popup.isSelectUrl);

  // Handler
  let handleSaveUrl = () => {
    // Prepare url before save
    let userUrl = url.replace(/\s|http:\/\/|https:\/\//g, '');
    let isHasHTTP = userUrl.indexOf('https://') === 0;
    let currentUrl = isHasHTTP ? userUrl : 'http://' + userUrl;
    let newUrl = currentUrl + (currentUrl.slice(-1) === '/' ? '' : '/');

    // Create new link entity
    let contentState = draftState.getCurrentContent();
    let contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', {
      url: newUrl,
    });

    let entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    let newEditorState = EditorState.set(draftState, {
      currentContent: contentStateWithEntity,
    });

    // Update editor state
    let newLinkedContent = RichUtils.toggleLink(
      newEditorState,
      newEditorState.getSelection(),
      entityKey,
    );

    // Collapsed current content before modify the content
    let newSelections = newLinkedContent.getSelection();
    let collapsed = newSelections.merge({
      anchorOffset: newSelections.getEndOffset(),
    });

    let newCollapsed = EditorState.forceSelection(newLinkedContent, collapsed);

    // Additional space
    let blocks = convertToRaw(draftState.getCurrentContent()).blocks;
    let currentSelection = newCollapsed.getSelection();
    let anchorKey = currentSelection.getAnchorKey();
    let cursorPosition = currentSelection.getAnchorOffset();
    let addonsSpace;

    for (let doc of blocks) {
      if (doc.key === anchorKey) {
        addonsSpace = cursorPosition === doc.text.length ? ' ' : '';
      }
    }

    // Update draft editor
    setDraftState(
      EditorState.push(
        draftState,
        Modifier.insertText(
          newCollapsed.getCurrentContent(),
          newCollapsed.getSelection(),
          addonsSpace,
        ),
        ' ',
      ),
    );

    // Update popup state
    setPopup(docs => ({
      ...docs,
      ...{ isOpen: true, isSelectUrl: newUrl, mode: null },
    }));
  };

  let handleRemoveUrl = () => {
    let newContent = Modifier.removeInlineStyle(
      draftState.getCurrentContent(),
      draftState.getSelection(),
      'LINK',
    );

    let newStateState = EditorState.set(draftState, {
      currentContent: newContent,
    });

    let selections = newStateState.getSelection();
    setDraftState(
      EditorState.forceSelection(
        newStateState,
        selections.merge({
          anchorOffset: selections.getFocusOffset(),
          focusOffset: selections.getFocusOffset(),
        }),
      ),
    );

    setPopup(docs => ({ ...docs, ...{ mode: null, isOpen: false } }));
  };

  let handleTypeUrl = e => {
    setUrl(e.target.value.toLowerCase());

    if (e.which === 13) {
      handleSaveUrl();
    }
  };

  let handleClosePopupUrl = () => {
    if (!url || !popup.isSelectUrl) {
      handleRemoveUrl();
      return;
    }

    setPopup(docs => ({ ...docs, ...{ mode: null, isOpen: false } }));
  };

  // Render URL editor
  return (
    <div style={{ display: popup.isOpen ? 'grid' : 'none' }}>
      <div
        className='popup-cover'
        onClick={handleClosePopupUrl.bind(this)}
      ></div>
      <div
        className='popup-box'
        style={{
          top: popup.position.top,
          left: popup.position.left,
        }}
      >
        <BsFillTriangleFill size={14} />
        <div className='popup-link'>
          <div className='popup-icon' onClick={handleSaveUrl.bind(this)}>
            <BiLink size={23} />
          </div>
          <input
            type='text'
            placeholder='Paste link here'
            autoFocus
            defaultValue={url}
            onKeyUp={e => handleTypeUrl(e)}
          />
        </div>
      </div>
    </div>
  );
}

export default PopupUrl;
