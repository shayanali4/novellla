import React, { useContext, useEffect, useState } from 'react';

// Icons
import { AiOutlineSetting } from 'react-icons/ai';
import { FaQuestionCircle } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';

// Context
import TypeContext from '../../context';

/**
 * Settings.
 */
function Settings(props) {
  // Context
  let [state, setState] = useContext(TypeContext);
  let [openShortcutsList, setOpenShortcutsList] = useState(false);

  // Handler
  let handlerTextWidth = type => {
    setState(docs => ({
      ...docs,
      editor: { ...docs.editor, textWidth: type },
    }));
  };

  let handlerFontFamily = name => {
    setState(docs => ({
      ...docs,
      editor: { ...docs.editor, fontFamily: name },
    }));
  };

  let handlerToggleWordCount = () => {
    setState(docs => ({
      ...docs,
      settings: { ...docs.settings, wordCount: !docs.settings.wordCount },
    }));
  };

  let handlerToggleLockFullscreen = () => {
    setState(docs => ({
      ...docs,
      settings: {
        ...docs.settings,
        lockFullscreen: !docs.settings.lockFullscreen,
      },
    }));
  };

  // Effetcs
  useEffect(() => {
    if (!props.panel.settings) {
      setOpenShortcutsList(false);
    }
  }, [setOpenShortcutsList, props]);

  // Render
  let textWidthTitles = ['Narrow', 'Medium', 'Wide'];
  let fontFamilyTitles = ['Comic', 'Serif', 'typewriter'];
  let shortcuts = [
    {
      key: 'Ctrl + Caps Lock',
      description: 'tHIS → This',
    },
   
    {
      key: 'Ctrl + Alt + M',
      description: 'Add Note',
    },
    {
      key: 'Ctrl + Spacebar',
      description: 'Dark Mode',
    },
    {
      key: 'Ctrl + Enter, then Tab',
      description: 'Dialogue Layout',
    },
    {
      key: 'Ctrl + G',
      description: 'Find & Replace',
    },
    {
      key: 'Alt + Minus',
      description: 'Em Dash',
    },
    {
      key: 'Alt + R',
      description: '®',
    },
    {
      key: 'Alt + C',
      description: '©',
    },
    {
      key: 'Alt + P',
      description: '℗',
    },
    {
      key: 'Alt + T',
      description: '™',
    },
    {
      key: 'Alt + S',
      description: '℠',
    },

    {
      key: 'Alt + V',
      description: '✓',
    },

    {
      key: 'Alt + X',
      description: '✗',
    },
  ];

  return (
    <li>
      <div
        className='panel-icon'
        onClick={() => props.setOpen(props.panel.settings ? '' : 'settings')}
      >
        <AiOutlineSetting size={23} />
      </div>
      <div
        className='panel-popup'
        style={{ display: props.panel.settings ? 'block' : 'none' }}
      >
        <div className='panel-title'>Text Width</div>
        <div className='panel-option'>
          {textWidthTitles.map((title, index) => {
            let isSelected =
              state.editor.textWidth === title.toLowerCase() ? 'selected' : '';

            return (
              <div
                key={index}
                className={isSelected}
                onClick={handlerTextWidth.bind(this, title.toLowerCase())}
              >
                <span>{title}</span>
              </div>
            );
          })}
        </div>
        <div className='panel-title'>Font Family</div>
        <div className='panel-option'>
          {fontFamilyTitles.map((title, index) => {
            let isSelected =
              state.editor.fontFamily === title.toLowerCase() ? 'selected' : '';

            return (
              <div
                key={index}
                className={isSelected}
                onClick={handlerFontFamily.bind(this, title.toLowerCase())}
              >
                <span>{title}</span>
              </div>
            );
          })}
        </div>
        <div className='settings-toggle'>
          <div className='panel-title'>Utility</div>
          <div className='setting-toggles'>
            <span>Lock Fullscreen</span>
            <input
              type='checkbox'
              checked={state.settings.lockFullscreen || false}
              onChange={handlerToggleLockFullscreen.bind(this)}
            />
          </div>

          <div className='setting-toggles'>
            <span>Word Count</span>
            <input
              type='checkbox'
              checked={state.settings.wordCount || false}
              onChange={handlerToggleWordCount.bind(this)}
            />
          </div>

          <div className='setting-toggles'>
          <span>Shortcuts</span>
            <input
              type='checkbox'
              onClick={() => setOpenShortcutsList(!openShortcutsList)}


            />
          </div>


        </div>
        
        <a
          href='http://www.tinycreate.com/'
          target='_BLANK'
          rel='noreferrer'
          className='popup-more'
          title='Tiny Create – Free Software and Applications'
        >
          <span>More Apps</span>
          <FiExternalLink />
        </a>
      </div>
      <div
        className='panel-popup panel-shortcuts'
        style={{
          display: props.panel.settings
            ? openShortcutsList
              ? 'block'
              : 'none'
            : 'none',
        }}
      >
        <p>List of shortcut</p>
        <div className='shortcuts-list'>
          {shortcuts.map((doc, index) => {
            return (
              <div key={index}>
                <div>
                  <span>{doc.key}</span>
                </div>
                <div>
                  <span>{doc.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </li>
  );
}

export default Settings;
