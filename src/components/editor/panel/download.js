import React, { useState } from 'react';
import axios from 'axios';
import $ from 'jquery';

/**
 * Icons.
 */

import { BsDownload } from 'react-icons/bs';
import { serverHost } from '../../../SeverConstants';

/**
 * Get contents.
 */
function GetContent() {
  let html = $('.public-DraftEditor-content > div').find('> *');
  let contents = [];

  $(html).each(function (index, el) {
    let name = $(el).prop('nodeName');
    let children = $(el).find('> div > *');
    let textAlign = $(el)
      .find('.public-DraftStyleDefault-ltr')
      .css('text-align');

    let docs = {
      type: name.toLowerCase(),
      textAlign: textAlign,
      children: [],
    };

    // Collect children informations
    $(children).each(function (num, node) {
      let childName = $(node).prop('nodeName').toLowerCase();
      let text = $(node).text();
      let bold = $(this).css('font-weight') === '700' ? true : false;
      let italics = $(this).css('font-style') === 'italic' ? true : false;
      let decoration = $(this).css('text-decoration').split(' ')[0];
      let content = {
        type: childName,
        text: text,
        bold: bold,
        italics: italics,
        decoration: decoration,
      };

      if (childName === 'a') {
        content.link = $(node).attr('href');
      }

      docs.children.push(content);
    });

    contents.push(docs);
  });

  return contents;
}

/**
 * Downloads.
 */
function Download(props) {
  // State
  let [onProcess, setOnProccess] = useState(false);

  // Handler
  let getFile = type => {
    if (onProcess) return;
    setOnProccess(true);

    let blocks = GetContent();
    let data = { type: type, data: blocks };

    axios
      .post(`${serverHost}/api/files`, data)
      .then(res => {
        let data = res.data;
        if (!data.success) throw data;

        window.open(data.url, '_SELF');
        setOnProccess(false);
      })
      .catch(err => {
        setOnProccess(false);
      });
  };

  // Render
  let type = ['docx', 'rtf', 'pdf', 'txt', 'epub', 'md', 'html'];
  let titles = [
    'Microsoft Word (.docx)',
    'Rich Text Format (.rtf)',
    'Document PDF (.pdf)',
    'Basic Text (.txt)',
    'EPUB Publish (.epub)',
    'Markdown (.md)',
    'HTML (.html)',
  ];

  return (
    <li>
      <div
        className='panel-icon'
        onClick={() => props.setOpen(props.panel.download ? '' : 'download')}
      >
        <BsDownload size={23} />
      </div>
      <div
        className='panel-popup download-file'
        style={{ display: props.panel.download ? 'block' : 'none' }}
      >
        {titles.map((title, index) => {
          return (
            <div key={index} onClick={getFile.bind(this, type[index])}>
              {title}
            </div>
          );
        })}
      </div>
    </li>
  );
}

export default Download;
