import React from 'react';

// Icons
import { AiFillFacebook } from 'react-icons/ai';
import { FaMix, FaFlipboard } from 'react-icons/fa';
import { FiShare2 } from 'react-icons/fi';
import { GrReddit, GrTwitter } from 'react-icons/gr';

/**
 * Share.
 */
function Share(props) {
  return (
    <li>
      <div
        className='panel-icon'
        onClick={() => props.setOpen(props.panel.share ? '' : 'share')}
      >
        <FiShare2 size={23} />
      </div>
      <div
        className='panel-popup'
        style={{ display: props.panel.share ? 'block' : 'none' }}
      >
        <div className='share-now'>
          <a
            className='panel-icon'
            href='http://www.reddit.com/submit?url=https://www.novellla.com/'
            title='Reddit'
            target='_BLANK'
            rel='noreferrer'
          >
            <GrReddit size={23} />
          </a>
          <a
            href='http://www.twitter.com/share?url=https://www.novellla.com/'
            className='panel-icon'
            title='Twitter'
            target='_BLANK'
            rel='noreferrer'
          >
            <GrTwitter size={23} />
          </a>
          <a
            href='https://www.facebook.com/sharer/sharer.php?u=https://www.novellla.com/'
            className='panel-icon'
            title='Facebook'
            target='_BLANK'
            rel='noreferrer'
          >
            <AiFillFacebook size={23} />
          </a>
          <a
            href='https://mix.com/add?url=https://www.novellla.com/'
            className='panel-icon'
            title='Mix'
            target='_BLANK'
            rel='noreferrer'
          >
            <FaMix size={23} />
          </a>
          <a
            href='https://share.flipboard.com/bookmarklet/popout?url=https://www.novellla.com/'
            className='panel-icon'
            title='Flipboard'
            target='_BLANK'
            rel='noreferrer'
          >
            <FaFlipboard size={23} />
          </a>
        </div>
      </div>
    </li>
  );
}

export default Share;
