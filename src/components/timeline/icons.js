import React from 'react';

/**
 * Icons.
 */
import { BsListTask } from 'react-icons/bs';
import { IoCloseSharp } from 'react-icons/io5';

/**
 * Icons.
 * @param {*} props parents property
 */
function Icons(props) {
  // Destructure property
  let { timelineOpen, setTimelineOpen } = props;

  // Render icons
  return timelineOpen ? (
    <div onClick={() => setTimelineOpen(false)}>
      <IoCloseSharp size={15} />
      <span>Close</span>
    </div>
  ) : (
    <div onClick={() => setTimelineOpen(true)}>
      <BsListTask size={22} />
    </div>
  );
}

export default Icons;
