import { convertToRaw } from 'draft-js';

/**
 * Word count.
 * @param {*} draftState draftjs state.
 * @param {*} setState main state handler.
 */
const WordCounter = (draftState, setState) => {
  let { blocks } = convertToRaw(draftState.getCurrentContent());
  let totalWord = 0;

  for (let block of blocks) {
    let sentences = block.text.split(' ').filter(text => text.length);
    totalWord += sentences.length;
  }

  setState(docs => ({
    ...docs,
    editor: { ...docs.editor, totalWord: totalWord },
  }));
};

export default WordCounter;
