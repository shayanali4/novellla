import React, { useContext, useEffect, useRef, useState } from 'react';
import $ from 'jquery';

// Context
import TypeContext from '../../context';

// Icons
import { BsArrowsFullscreen } from 'react-icons/bs';

/**
 * Fullscreen.
 */
function Fullscreen(props) {
  // Reference
  let confirmRef = useRef();

  // Context
  let [state] = useContext(TypeContext);
  let { settings } = state;

  // State
  let [fullscreen, setFullscreen] = useState({
    active: false,
    confirm: false,
  });

  // Handler
  let handlerToggleFullscreen = () => {
    if (
      document.webkitIsFullScreen ||
      document.mozFullScreen ||
      document.msFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // Safari
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen(); // IE11
      }
    } else {
      let elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(); // Safari
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen(); // IE11
      }
    }

    setFullscreen(docs => ({ ...docs, active: !docs.active, confirm: false }));
  };

  let handlerConfirmNow = e => {
    if (e.key === 'Enter') {
      if (e.target.value.toLowerCase() === 'novellla.com') {
        handlerToggleFullscreen();
        setFullscreen(docs => ({ ...docs, confirm: false }));
        e.target.value = '';
      }
    }
  };

  let handlerFullScreenBtn = () => {
    let isOnFullScreen =
      document.webkitIsFullScreen ||
      document.mozFullScreen ||
      document.msFullscreenElement;

    if (settings.lockFullscreen && fullscreen.active && isOnFullScreen) {
      setFullscreen(docs => ({ ...docs, confirm: !docs.confirm }));
    } else {
      handlerToggleFullscreen();
    }
  };

  useEffect(() => {
    $(document).on('click', function (e) {
      let clickInside = $(e.target).closest(confirmRef.current).length;
      if (!clickInside && !fullscreen.active) {
        setFullscreen(docs => ({ ...docs, confirm: false }));
      }
    });

    return () => $(document).off('click');
  }, [fullscreen, settings]);

  // Render
  return (
    <li ref={confirmRef}>
      {!settings.lockFullscreen || !fullscreen.confirm ? null : (
        <div
          className='confirm-exit-fs'
          onKeyDown={handlerConfirmNow.bind(this)}
          style={{ display: fullscreen.confirm ? 'block' : 'none' }}
        >
          <input type='text' placeholder='Type “Novellla.com”' autoFocus />
        </div>
      )}
      <div
        className='panel-icon'
        onClick={() => {
          props.setOpen();
          handlerFullScreenBtn();
        }}
        title='Toggle Full Screen'
      >
        <BsArrowsFullscreen size={23} />
      </div>
    </li>
  );
}

export default Fullscreen;
