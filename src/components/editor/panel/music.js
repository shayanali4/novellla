import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';

// Icons
import { IoMdHeadset } from 'react-icons/io';
import { AiFillThunderbolt } from 'react-icons/ai';
import { CgEditNoise } from 'react-icons/cg';
import {
  FaCloudShowersHeavy,
  FaCity,
  FaHashtag,
  FaTree,
  FaSnowflake,
  FaRainbow,
} from 'react-icons/fa';
import { GiWaterfall, GiBedLamp } from 'react-icons/gi';
import { IoMdCafe } from 'react-icons/io';
import { IoVolumeMediumSharp } from 'react-icons/io5';

/**
 * Play the music.
 * @param {*} props music id.
 */
const MusicPlayer = props => {
  // Reference
  let soundRef = useRef();

  // Effects
  useEffect(() => {
    soundRef.current.volume = props.volume;
  });

  // Render
  return (
    <audio
      autoPlay
      src={`https://backendlessappcontent.com/33170295-1C47-434B-BF7D-D23C7D98F29F/38D93EF3-E73E-4FA6-82E0-26145CBF23F6/files/media/a${props.playMusic}.mp3`}
      type='audio/mpeg'
      ref={soundRef}
    ></audio>
  );
};

/**
 * Youtube.
 */
const YoutubePlayer = () => {
  return (
    <iframe
      width='420'
      height='315'
      src='https://www.youtube.com/embed/qYnA9wWFHLI?autoplay=1'
      allow='autoplay'
      title='Marconi Union - Weightless'
    ></iframe>
  );
};

function Music(props) {
  // Reference
  let btnRef = useRef();
  let boxRef = useRef();

  // States
  let [openPopup, setOpenPopup] = useState(false);
  let [playMusic, setPlayMusic] = useState(null);
  let [playYoutube, setPlayYoutube] = useState(null);
  let [musicVolume, setMusicVolume] = useState(1);
  let [openVolumeControl, setOpenVolumeControl] = useState(false);

  // Effects
  useEffect(() => {
    $('.volume-bar').draggable({
      axis: 'y',
      containment: 'parent',
      stop: function (event, ui) {
        let volume = (1 - ui.position.top / 212).toFixed(1);
        setMusicVolume(parseFloat(volume));
      },
    });

    $('body').on('click', function (e) {
      let clickInside = $(e.target).closest(boxRef.current).length;
      let clickButton = $(e.target).closest(btnRef.current).length;

      if (!clickInside && !clickButton && openPopup) {
        setOpenPopup(false);
      }
    });

    return () => $('body').off('click');
  }, [openPopup, setOpenPopup]);

  // Properties
  let size = 22;
  let icons = [
    <GiWaterfall size={size} />,
    <AiFillThunderbolt size={size} />,
    <IoMdCafe size={size} />,
    <CgEditNoise size={size} />,
    <FaCloudShowersHeavy size={size} />,
    <GiBedLamp size={size} />,
    <FaRainbow size={size} />,
    <FaCity size={size} />,
    <FaSnowflake size={size} />,
    <FaTree size={size} />,
  ];

  let titles = [
    'Waterfall in a forest',
    'Thunderstorm & Rain',
    'Cafe Music',
    'Brown Noise',
    'Rainy Day',
    'Medieval Town',
    'Celestial Noise',
    'Metropolis Soundscape',
    'Snowy Blizzard',
    'Forest Ambience',
  ];

  // Handler
  let playMusicHandler = index => {
    setPlayYoutube(false);

    $(`.music-list div`).removeClass('play-now');
    if (playMusic === index) {
      setPlayMusic(null);
      return;
    }

    $(`.music-list div:nth-child(${index + 2})`).addClass('play-now');
    setPlayMusic(index);
  };

  let playYoutubeHandler = () => {
    setPlayMusic(null);

    $(`.music-list div`).removeClass('play-now');
    if (playYoutube) {
      setPlayYoutube(false);
      return;
    }

    $(`.music-list > div:first-child`).addClass('play-now');
    setPlayYoutube(true);
  };

  // Render
  return (
    <li>
      <div
        className='panel-icon'
        onClick={() => props.setOpen(props.panel.music ? '' : 'music')}
        ref={btnRef}
      >
        <IoMdHeadset size={23} />
      </div>
      <div
        className='panel-popup'
        style={{ display: props.panel.music ? 'block' : 'none' }}
        ref={boxRef}
      >
        <div
          className='volume-control'
          style={{ display: openVolumeControl && playMusic ? 'flex' : 'none' }}
        >
          <div className='volume-settings'>
            <div className='volume-bar'></div>
            <div className='volume-track'></div>
          </div>
        </div>
        <div className='music-list'>
          <div onClick={() => setOpenVolumeControl(!openVolumeControl)}>
            <IoVolumeMediumSharp size={23} />
          </div>
          <div
            title='Marconi Union - Weightless'
            onClick={playYoutubeHandler.bind(this)}
          >
            <FaHashtag size={18} />
          </div>
          {titles.map((title, index) => {
            return (
              <div
                key={index}
                title={title}
                onClick={playMusicHandler.bind(null, index + 1)}
              >
                {icons[index]}
              </div>
            );
          })}
          {playMusic ? (
            <MusicPlayer playMusic={playMusic} volume={musicVolume} />
          ) : null}
          {playYoutube ? <YoutubePlayer /> : null}
        </div>
      </div>
    </li>
  );
}

export default Music;
