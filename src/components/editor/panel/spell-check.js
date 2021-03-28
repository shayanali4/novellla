import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { convertToRaw, EditorState, Modifier, SelectionState } from 'draft-js';
import axios from 'axios';
import $ from 'jquery';

// Addons
import { GetLocalStorage, SetLocalStorage } from '../../lib/local-storage';

// Context
import EditorContext from '../context';

// Icons
import { HiOutlineTrash } from 'react-icons/hi';
import { VscBook } from 'react-icons/vsc';

/**
 * Type Box.
 */
function TypoBox(props) {
  let {
    typo,
    handlerAddWhitelist,
    handleDismissTypo,
    handlerReplaceSpell,
  } = props;

  return !typo.isOpenBox ? null : typo.lists.length ? (
    <div className='spelling-box'>
      <div className='spelling-title'>Spelling</div>
      <div className='spelling-warn'>
        Unknown word: <span>{typo.lists[0].text}</span>
      </div>
      <div className='spelling-message'>
        Our dictionary does not include the word{' '}
        <i>
          <strong>{typo.lists[0].text}</strong>
        </i>
        . You can add it to your personal dictionary to prevent future alerts.
      </div>
      <div className='spelling-suggestions'>
        {typo.lists[0].suggestions.map((text, index) => {
          return (
            <span key={index} onClick={handlerReplaceSpell.bind(this, text)}>
              {text}
            </span>
          );
        })}
      </div>
      <div className='spelling-action'>
        <div onClick={handlerAddWhitelist.bind(this, typo.lists[0].text)}>
          <VscBook size={21} />
          <span>Add to dictionary</span>
        </div>
        <div title='Dismiss' onClick={handleDismissTypo}>
          <HiOutlineTrash size={21} />
        </div>
      </div>
    </div>
  ) : (
    <div className='spelling-box'>
      <div className='spelling-title'>Spelling</div>
      <div className='spelling-message'>Great. No spelling issue found!</div>
    </div>
  );
}

/**
 * Spell Check.
 */
function SpellCheck(props) {
  // Reference
  let typoRef = useRef();

  // Context
  let [draftState, setDraftState] = useContext(EditorContext);

  // State
  let [initialized, setInitialized] = useState(false);
  let [typo, setTypo] = useState({
    isOpenBox: false,
    lists: [],
    synced: true,
    whitelist: [],
  });

  // Handler
  let handlerSpellCheck = () => {
    let { blocks } = convertToRaw(draftState.getCurrentContent());

    if (typo.isOpenBox) {
      return;
    }

    axios
      .post('/api/spell', { blocks: blocks, whitelist: typo.whitelist })
      .then(({ data: response }) => {
        if (response.success) {
          setTypo(docs => ({
            ...docs,
            ...response.data,
          }));
        }
      })
      .catch(err => console.log('OPS ERROR!'));
  };

  let handlerAddSpellStyle = useCallback(
    ({ key, position }) => {
      let updateSelection = new SelectionState({
        anchorKey: key,
        anchorOffset: position.start,
        focusKey: key,
        focusOffset: position.end,
      });
      let newEditor = EditorState.acceptSelection(draftState, updateSelection);
      let newState = Modifier.applyInlineStyle(
        newEditor.getCurrentContent(),
        newEditor.getSelection(),
        'SPELL',
      );

      setDraftState(EditorState.push(draftState, newState));
    },
    [draftState, setDraftState],
  );

  let handlerRemoveSpellStyle = useCallback(
    ({ key, position }) => {
      let updateSelection = new SelectionState({
        anchorKey: key,
        anchorOffset: position.start,
        focusKey: key,
        focusOffset: position.end,
      });
      let newEditor = EditorState.acceptSelection(draftState, updateSelection);
      let newState = Modifier.removeInlineStyle(
        newEditor.getCurrentContent(),
        newEditor.getSelection(),
        'SPELL',
      );

      setDraftState(EditorState.push(draftState, newState));
    },
    [draftState, setDraftState],
  );

  let handlerReplaceSpell = text => {
    let nextTypo = typo.lists[1];
    let typoLists = [...typo.lists].slice(1, [...typo.lists].length);
    let isSynced = typoLists.length ? false : true;
    let isStillOpen = typoLists.length ? true : false;

    setDraftState(
      EditorState.push(
        draftState,
        Modifier.replaceText(
          draftState.getCurrentContent(),
          draftState.getSelection(),
          text,
        ),
      ),
    );

    if (!nextTypo) {
      setTimeout(() => {
        setTypo(docs => ({
          ...docs,
          synced: isSynced,
          isOpenBox: true,
          lists: [],
        }));
      }, 50);
    } else {
      setTypo(docs => ({
        ...docs,
        synced: isSynced,
        isOpenBox: isStillOpen,
        lists: typoLists,
      }));
    }
  };

  let handlerAddWhitelist = word => {
    let lastTypoLists = [...typo.lists];
    handlerRemoveSpellStyle(lastTypoLists[0]);

    let newTypoLists = lastTypoLists.slice(1, lastTypoLists.length);
    let newWhitelist = [...typo.whitelist, word.toLowerCase()];
    let isStillOpen = newTypoLists.length ? true : false;

    setTypo(docs => ({
      ...docs,
      synced: false,
      lists: newTypoLists,
      whitelist: newWhitelist,
      isOpenBox: isStillOpen,
    }));
  };

  let handleDismissTypo = () => {
    let typoLists = [...typo.lists].slice(1, [...typo.lists].length);
    let isSynced = typoLists.length ? false : true;
    let isStillOpen = typoLists.length ? true : false;

    handlerRemoveSpellStyle(typo.lists[0]);
    setTypo(docs => ({
      ...docs,
      lists: typoLists,
      synced: isSynced,
      isOpenBox: isStillOpen,
    }));
  };

  // Effect
  useEffect(() => {
    // Cookies
    if (!initialized) {
      let cookies = GetLocalStorage('spell');
      if (cookies) {
        setTypo({ ...cookies });
      }

      setInitialized(true);
    } else {
      SetLocalStorage('spell', typo);
    }

    // Spell check box
    function detectClickOutside(e) {
      let clickInside = $(e.target).closest(typoRef.current).length;
      if (!clickInside && typo.isOpenBox) {
        let isStillOpen = typo.lists[0] && clickInside ? true : false;
        if (typo.lists[0]) {
          handlerRemoveSpellStyle(typo.lists[0]);
        }

        setTypo(docs => ({ ...docs, isOpenBox: isStillOpen, lists: [] }));
      }
    }

    function repositionTypoWord(box) {
      let boxPosition = $(
        `[data-contents="true"] > [data-offset-key="${box.key}-0-0"]`,
      ).position();
      let typoPosition = $(
        '[style="background-color: rgb(255, 219, 227); border-bottom: 3px solid rgb(234, 21, 55);"]',
      ).position();
      let addons = boxPosition ? 20 : 0;
      let totalPosition = boxPosition.top + addons + typoPosition.top - 180;

      if (totalPosition) {
        window.scrollTo({ top: totalPosition, behavior: 'smooth' });
      }
    }

    if (!typo.synced && typo.isOpenBox && typo.lists.length) {
      setTypo(docs => ({ ...docs, synced: true }));
      handlerAddSpellStyle(typo.lists[0]);

      setTimeout(() => {
        repositionTypoWord(typo.lists[0]);
      }, 100);
    }

    $('body').on('click', detectClickOutside);
    return () => $('body').off();
  }, [
    handlerAddSpellStyle,
    handlerRemoveSpellStyle,
    initialized,
    setTypo,
    typo,
  ]);

  // Render
  return (
    <li>
      <div
        title='Spell Check'
        className='spell-check'
        onClick={() => {
          props.setOpen();
          handlerSpellCheck();
        }}
      >
        <span>Spell Check</span>
      </div>
      <div ref={typoRef}>
        <TypoBox
          typo={typo}
          handlerAddWhitelist={handlerAddWhitelist}
          handleDismissTypo={handleDismissTypo}
          handlerReplaceSpell={handlerReplaceSpell}
        />
      </div>
    </li>
  );
}

export default SpellCheck;
