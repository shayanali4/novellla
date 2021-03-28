import React, { useEffect, useState, useContext } from 'react';
import $ from 'jquery';

// Context
import TypeContext from '../context';

// Components
import Icons from './icons';
import Lists from './lists';

/**
 * Timeline Box
 */
function TimelineBox() {
  // Context
  let [state] = useContext(TypeContext);

  // State
  let [timelineOpen, setTimelineOpen] = useState(false);

  // Effects
  useEffect(() => {
    let GetTimelineContent = () => {
      let timelines = [];

      $('.public-DraftEditor-content > * > *').each(function (index, el) {
        let tagName = $(el).prop('tagName');
        let isHeading = ['H1', 'H2', 'H3'].includes(tagName);
        let position = $(el).position().top;

        if (isHeading) {
          timelines.push({
            key: $(el).data('offset-key'),
            position: position,
          });
        }
      });

      return timelines;
    };

    let GetTimelineBox = () => {
      let lists = [];
      $('.timeline-list > div').each(function (index, el) {
        let key = $(el).data('offset-key');
        lists.push(key);
      });

      return lists;
    };

    $(window).on('scroll', function () {
      let onClicking = $('.timeline-list').data('clicking');
      if (onClicking) {
        return;
      }

      let offset = window.pageYOffset || document.documentElement.scrollTop;
      let timelinesContent = GetTimelineContent();
      let timelinesBox = GetTimelineBox();

      let matched = [];
      let matchedIndex = 0;

      if (timelinesContent.length) {
        matched = timelinesContent.filter(doc => {
          return offset > doc.position - 20 && offset < doc.position + 20;
        });
      }

      if (matched.length) {
        let key = matched[0].key;
        $(`.timeline-list [data-offset-key]`).removeClass('active');
        $(`.timeline-list [data-offset-key="${key}"]`).addClass('active');

        for (let [index, offsetKey] of timelinesBox.entries()) {
          if (offsetKey === key) {
            matchedIndex = index;
          }
        }

        if ($('.timeline-box').length) {
          let scrolled = matchedIndex > 3 ? 26 * (matchedIndex - 3) : 0;
          document.querySelector('.timeline-box').scroll({
            top: scrolled,
            left: 0,
            behavior: 'smooth',
          });
        }
      }
    });
  }, []);

  // Render
  return (
    <div
      className={`timeline-box ${timelineOpen ? '' : 'timeline-icon'}`}
      style={{
        visibility: state.settings.onFocus ? '' : 'visible',
        opacity: state.settings.onFocus ? 0 : 1,
        pointerEvents: state.settings.onFocus ? 'none' : 'auto',
      }}
    >
      <div className='timeline-handler'>
        <Icons timelineOpen={timelineOpen} setTimelineOpen={setTimelineOpen} />
      </div>
      <Lists timelineOpen={timelineOpen} setTimelineOpen={setTimelineOpen} />
    </div>
  );
}

export default TimelineBox;
