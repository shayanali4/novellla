import React, { useContext, useEffect, useRef, useState } from 'react';
import $ from 'jquery';

// Context
import TypeContext from '../context';

// Components
import Fullscreen from './panel/fullscreen';
import SentenceLength from './panel/sentence-length';
import SpellCheck from './panel/spell-check';
import Focus from './panel/focus';
import Settings from './panel/settings';
import Color from './panel/color';
import DarkMode from './panel/dark-mode';
import Download from './panel/download';
import Music from './panel/music';
import Share from './panel/share';
import StoryStructure from './panel/story-structure';
import FindAndReplace from './panel/find-and-replace';

/**
 * Panels.
 */
function EditorPanel() {
  // Reference
  let boxRef = useRef();

  // Context
  let [state] = useContext(TypeContext);
  let [panelOpen, setPanelOpen] = useState({
    settings: false,
    focus: false,
    music: false,
    color: false,
    download: false,
    share: false,
    replace: false,
  });

  // Handler
  let handlerSwitchPanel = name => {
    let option = {
      settings: false,
      sentence: false,
      focus: false,
      story: false,
      music: false,
      color: false,
      download: false,
      share: false,
      replace: false,
    };

    if (name) {
      option[name] = true;
    }

    setPanelOpen(option);
  };

  // Effects
  useEffect(() => {
    $('body').on('click', function (e) {
      let clickInside = $(e.target).closest(boxRef.current).length;
      if (!clickInside) {
        setPanelOpen({
          settings: false,
          sentence: false,
          focus: false,
          story: false,
          music: false,
          color: false,
          download: false,
          share: false,
          replace: false,
        });
      }
    });
  });

  // Render
  return (
    <div
      className='type-panel'
      style={{
        visibility: state.settings.onFocus ? 'hidden' : 'visible',
        opacity: state.settings.onFocus ? 0 : 1,
        pointerEvents: state.settings.onFocus ? 'none' : 'auto',
      }}
    >
      <div className='panel-box' ref={boxRef}>
        <div>
          <ul>
            <Fullscreen panel={panelOpen} setOpen={handlerSwitchPanel} />
            <Settings panel={panelOpen} setOpen={handlerSwitchPanel} />
            <SentenceLength panel={panelOpen} setOpen={handlerSwitchPanel} />
            {/* <SpellCheck setOpen={handlerSwitchPanel} /> */}
          </ul>
          <ul>
            <Focus setOpen={handlerSwitchPanel} />
            <StoryStructure panel={panelOpen} setOpen={handlerSwitchPanel} />
          </ul>
          <ul>
            <Music panel={panelOpen} setOpen={handlerSwitchPanel} />
            <DarkMode panel={panelOpen} setOpen={handlerSwitchPanel} />
            <Color panel={panelOpen} setOpen={handlerSwitchPanel} />
            <Download panel={panelOpen} setOpen={handlerSwitchPanel} />
            <Share panel={panelOpen} setOpen={handlerSwitchPanel} />
            <FindAndReplace panel={panelOpen} setOpen={handlerSwitchPanel} />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EditorPanel;
