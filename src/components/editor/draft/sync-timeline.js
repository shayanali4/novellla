import $ from 'jquery';

/**
 * Sync timelines.
 * @param {*} setState main state handler.
 */
const SyncTimelines = setState => {
  let timelines = [];

  $('.public-DraftEditor-content > * > *').each(function (index, el) {
    let tagName = $(el).prop('tagName');
    let isHeading = ['H1', 'H2', 'H3'].includes(tagName);
    let tagType = {
      H1: 'section',
      H2: 'chapter',
      H3: 'scene',
    };
    let key = $(el).data('offset-key');
    let text = $(el).text();
    let isHasContent = text.replace(/\s/g, '');

    if (isHeading && isHasContent) {
      timelines.push({
        key: key,
        type: tagType[tagName],
        text: text,
      });
    }
  });

  setState(docs => ({ ...docs, timeline: timelines }));
};

export default SyncTimelines;
