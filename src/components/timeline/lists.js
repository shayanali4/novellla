import React, { useContext } from 'react';
import $ from 'jquery';

/**
 * Context.
 */
import TypeContext from '../context';

/**
 * Lists.
 * @param {*} props parents property
 */
function Lists(props) {
  // Destructure property
  let { timelineOpen } = props;

  // Context
  let [state] = useContext(TypeContext);

  // Handler
  let handleClick = key => {
    let distance = $(
      `.public-DraftEditor-content > div > [data-offset-key="${key}"]`,
    ).offset();

    window.scroll({
      top: distance.top - 100,
      left: 0,
      behavior: 'smooth',
    });

    $(`.timeline-list > div`).removeClass('active');
    $(`.timeline-list [data-offset-key="${key}"]`).addClass('active');

    $('.timeline-list').data('clicking', true);
    setTimeout(() => {
      $('.timeline-list').data('clicking', false);
    }, 1500);
  };

  // Render lists
  return (
    <div
      className='timeline-list'
      style={{
        left: timelineOpen ? '0' : '-300px',
      }}
    >
      {state.timeline.map(doc => {
        return (
          <div
            key={doc.key}
            data-offset-key={`${doc.key}`}
            className={doc.type}
            onClick={handleClick.bind(this, doc.key)}
          >
            <span>{doc.text}</span>
          </div>
        );
      })}
    </div>
  );
}

export default Lists;
