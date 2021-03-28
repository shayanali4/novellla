import { useCallback, useEffect, useState } from 'react';
import TypeContext from './components/context';
import React from 'react'

// Addons
import {
  GetLocalStorage,
  SetLocalStorage,
} from './components/lib/local-storage';

// Components
import TimelineBox from './components/timeline/timeline';
import EditorBox from './components/editor/editor';
import NotesBox from './components/notes/notes';
import { ExitFocusMode } from './components/addons/focus';

/**
 * App.
 */
function App() {
  // Initial state
  let [initialized, setInitialized] = useState(false);
  let [state, setState] = useState({
    timeline: [],
    editor: {
      fontFamily: 'serif',
      textWidth: 'medium',
      totalWord: 0,
    },
    notes: {
      lists: [],
      minimise: [],
      structures: [],
      isOnEdit: false,
      isOnDelete: false,
    },
    settings: {
      onFocus: false,
      colorCode: null,
      colorLightness: 50,
      colorMode: 'bright',
      lockFullscreen: false,
      wordCount: true,
    },
  });
  let isInColorMode =
    state.colorMode !== 'bright' && state.colorMode !== 'dark';

  // Handler
  let handleSwitchColorMode = useCallback(
    e => {
      if (e.ctrlKey && e.key === ' ') {
        let colorMode =
          state.settings.colorMode === 'bright' ? 'dark' : 'bright';

        setState(docs => ({
          ...docs,
          settings: {
            ...docs.settings,
            colorMode: colorMode,
          },
        }));
      }
    },
    [state],
  );

  // Effects
  useEffect(() => {
    // Cookies
    if (!initialized) {
      let cookies = GetLocalStorage('novellla');
      if (cookies) {
        setState({ ...cookies });
      }

      setInitialized(true);
    } else {
      SetLocalStorage('novellla', state);
    }

    // Color Mode
    let hasColorMode = document.querySelector('[data-type="color-mode"]');
    if (hasColorMode) {
      document.querySelector('[data-type="color-mode"]').outerHTML = '';
    }

    if (isInColorMode) {
      let style = document.createElement('style');
      style.type = 'text/css';
      style.dataset.type = 'color-mode';
      style.innerHTML = `:root { --base-color: hsl(${state.settings.colorCode}, ${state.settings.colorLightness}%); }`;
      document.getElementsByTagName('head')[0].prepend(style);
    }

    window.addEventListener('keydown', handleSwitchColorMode);
    return () => {
      window.removeEventListener('keydown', handleSwitchColorMode);
    };
  }, [initialized, isInColorMode, handleSwitchColorMode, state]);

  // Render
  return (
    <TypeContext.Provider value={[state, setState]}>
      <div className={state.settings.colorMode + '-mode sweet-type'}>
        <TimelineBox />
        <EditorBox />
        <NotesBox />
        <ExitFocusMode />
      </div>
    </TypeContext.Provider>
  );
}

export default App;
