import React, { useEffect, useState, useContext, useRef } from 'react';
import $ from 'jquery';

/**
 * Icons.
 */
import { BsBrightnessHighFill, BsCircleFill } from 'react-icons/bs';
import { IoColorPaletteOutline } from 'react-icons/io5';

/**
 * Context.
 */
import TypeContext from '../../context';

/**
 * Color options.
 */
function Color(props) {
  // Reference
  let btnRef = useRef();
  let boxRef = useRef();

  // Context
  let [state, setState] = useContext(TypeContext);

  // State
  let [openPopup, setOpenPopup] = useState(false);
  let [colorLightness, setColorLightness] = useState(0);
  let [colorBrightness, setColorBrightness] = useState(0);
  let [openColorLightness, setOpenColorLightness] = useState(false);

  // Handler
  let handleUpdateBackgroundColor = (colorCode, lightness) => {
    let brightness = Math.floor(((92 - lightness) * colorBrightness) / 100);
    let newLightness = lightness + brightness;

    setColorLightness(lightness);
    setState(docs => ({
      ...docs,
      ...{
        settings: {
          ...docs.settings,
          colorLightness: newLightness,
          colorCode: colorCode,
          colorMode: 'color',
        },
      },
    }));
  };

  // Effects
  useEffect(() => {
    $('.lightness-bar').draggable({
      axis: 'y',
      containment: 'parent',
      stop: function (event, ui) {
        let position = ui.position;
        let ratio = 92 - colorLightness;
        let percent = Math.floor((position.top / 212) * ratio);
        let lightness = colorLightness + percent;
        let brightness = Math.floor((position.top / 212) * 100);

        setState(docs => ({
          ...docs,
          settings: {
            ...docs.settings,
            colorLightness: lightness,
          },
        }));
        setColorBrightness(brightness);
      },
    });

    let target = document.querySelector('.color-lightness').parentNode;
    document.addEventListener('click', event => {
      let isInsideColorLightness = event.composedPath().includes(target);
      if (!isInsideColorLightness) {
        setOpenColorLightness(false);
      }
    });

    $('body').on('click', function (e) {
      let clickInside = $(e.target).closest(boxRef.current).length;
      let clickButton = $(e.target).closest(btnRef.current).length;

      if (!clickInside && !clickButton && openPopup) {
        setOpenPopup(false);
      }
    });

    return () => $('body').off('click');
  }, [colorLightness, setState, openPopup, setOpenPopup]);

  // Render
  return (
    <li>
      <div
        className='panel-icon'
        onClick={() => props.setOpen(props.panel.color ? '' : 'color')}
        ref={btnRef}
      >
        <IoColorPaletteOutline size={23} />
      </div>
      <div
        className='panel-popup'
        style={{ display: props.panel.color ? 'block' : 'none' }}
        ref={boxRef}
      >
        <div
          className='color-lightness'
          style={{ display: openColorLightness ? 'flex' : 'none' }}
        >
          <div className='lightness-settings'>
            <div className='lightness-bar'></div>
            <div className='lightness-track'></div>
          </div>
        </div>
        <div className='color-opt'>
          <BsBrightnessHighFill
            size={29}
            onClick={() => {
              if (state.settings.colorMode !== 'color') {
                return;
              }

              setOpenColorLightness(openColorLightness ? false : true);
            }}
          />
          <BsCircleFill
            size={25}
            style={{
              color: '#FFF',
              boxShadow: '0 0 0 2px rgba(0, 0, 0, .05)',
              borderRadius: '100%',
            }}
            onClick={() => {
              setState(docs => ({
                ...docs,
                settings: { ...docs.settings, colorMode: 'bright' },
              }));
            }}
            title='White'
          />
          <BsCircleFill
            size={25}
            style={{ color: '#D0D7DC' }}
            onClick={() => {
              handleUpdateBackgroundColor('205, 15%', 84);
            }}
            title='Grey'
          />
          <BsCircleFill
            size={25}
            style={{ color: '#9AC1EA' }}
            onClick={() => {
              handleUpdateBackgroundColor('211, 66%', 76);
            }}
            title='Blue'
          />
          <BsCircleFill
            size={25}
            style={{ color: '#A2E9A0' }}
            onClick={() => {
              handleUpdateBackgroundColor('118, 62%', 77);
            }}
            title='Green'
          />
          <BsCircleFill
            size={25}
            style={{ color: '#F6DF79' }}
            onClick={() => {
              handleUpdateBackgroundColor('49, 87%', 72);
            }}
            title='Yellow'
          />
          <BsCircleFill
            size={25}
            style={{ color: '#D8B5FD' }}
            onClick={() => {
              handleUpdateBackgroundColor('269, 95%', 85);
            }}
            title='Purple'
          />
          <BsCircleFill
            size={25}
            style={{ color: '#CEB292' }}
            onClick={() => {
              handleUpdateBackgroundColor('32, 38%', 69);
            }}
            title='Brown'
          />
        </div>
      </div>
    </li>
  );
}

export default Color;
