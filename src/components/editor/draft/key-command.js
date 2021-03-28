import Immutable from 'immutable';
import {
  ContentBlock,
  CharacterMetadata,
  EditorState,
  convertToRaw,
  genKey,
  Modifier,
  RichUtils,
} from 'draft-js';
import $ from 'jquery';

/**
 * Key Commands.
 */
function KeyCommand(command, editorState, draftState, setDraftState) {
  // Do invert command, for example, "This" to "tHIS"
  if (command === 'iNVERT') {
    let selected = window.getSelection().toString();
    let invertedText = selected
      .split('')
      .map(a => {
        return a.match(/[a-z]/) ? a.toUpperCase() : a.toLowerCase();
      })
      .join('');

    setDraftState(
      EditorState.push(
        draftState,
        Modifier.replaceText(
          draftState.getCurrentContent(),
          draftState.getSelection(),
          invertedText,
        ),
      ),
    );
    $('.text-popup').fadeOut(0);
  }

  // Bold, italic and underline
  if (['bold', 'italic', 'underline'].includes(command)) {
    setDraftState(RichUtils.handleKeyCommand(editorState, command));
  }

  // Reset block type to default
  if (command === 'clear') {
    let selection = editorState.getSelection();
    let contentState = editorState.getCurrentContent();
    let blockMap = contentState.getBlockMap();
    let currentBlock = contentState.getBlockForKey(selection.getEndKey());
    let blocksBefore = blockMap.toSeq().takeUntil(function (v) {
      return v === currentBlock;
    });

    let blocksAfter = blockMap
      .toSeq()
      .skipUntil(function (v) {
        return v === currentBlock;
      })
      .rest();

    let newBlockKey = genKey();
    let newBlocks = [
      [currentBlock.getKey(), currentBlock],
      [
        newBlockKey,
        new ContentBlock({
          key: newBlockKey,
          type: 'unstyled',
          text: '',
          characterList: Immutable.List(),
        }),
      ],
    ];

    let newBlockMap = blocksBefore
      .concat(newBlocks, blocksAfter)
      .toOrderedMap();

    let newContentState = contentState
      .merge({
        blockMap: newBlockMap,
        selectionBefore: selection,
        selectionAfter: selection,
      })
      .set(
        'selectionAfter',
        contentState.getSelectionAfter().merge({
          anchorKey: newBlockKey,
          anchorOffset: 0,
          focusKey: newBlockKey,
          focusOffset: 0,
          isBackward: false,
        }),
      );

    setDraftState(EditorState.push(editorState, newContentState, 'normal'));
  }

  // Create a dialogue block
  if (command === 'dialogue') {
    let selection = editorState.getSelection();
    let contentState = editorState.getCurrentContent();
    let blockMap = contentState.getBlockMap();
    let currentBlock = contentState.getBlockForKey(selection.getEndKey());
    let anchorKey = selection.getAnchorKey();
    let blocks = convertToRaw(contentState).blocks;
    let isCurrentBlockEmpty = false;

    for (let block of blocks) {
      if (block.key === anchorKey) {
        isCurrentBlockEmpty = block.text.length === 0;
      }
    }

    // add dialogue box in current line if empty
    if (isCurrentBlockEmpty) {
      let modifiedContent = Modifier.replaceText(
        contentState,
        selection,
        `" ," `,
      );

      let changedBlockContent = Modifier.setBlockType(
        modifiedContent,
        selection,
        'dialogue',
      );

      let newContent = EditorState.push(editorState, changedBlockContent);
      let newSelection = selection.merge({
        focusOffset: 1,
        anchorOffset: 1,
      });

      return setDraftState(
        EditorState.forceSelection(newContent, newSelection),
      );
    }

    // add dialogue box in new line break
    let blocksBefore = blockMap.toSeq().takeUntil(function (v) {
      return v === currentBlock;
    });

    let blocksAfter = blockMap
      .toSeq()
      .skipUntil(function (v) {
        return v === currentBlock;
      })
      .rest();

    let newBlockKey = genKey();
    let { List, Repeat } = Immutable;
    let text = `" ," `;
    let charData = CharacterMetadata.create();
    let newBlocks = [
      [currentBlock.getKey(), currentBlock],
      [
        newBlockKey,
        new ContentBlock({
          key: newBlockKey,
          type: 'dialogue',
          text: text,
          characterList: List(Repeat(charData, text.length)),
        }),
      ],
    ];

    let newBlockMap = blocksBefore
      .concat(newBlocks, blocksAfter)
      .toOrderedMap();

    let newContentState = contentState
      .merge({
        blockMap: newBlockMap,
        selectionBefore: selection,
        selectionAfter: selection,
      })
      .set(
        'selectionAfter',
        contentState.getSelectionAfter().merge({
          anchorKey: newBlockKey,
          anchorOffset: 1,
          focusKey: newBlockKey,
          focusOffset: 1,
          isBackward: false,
        }),
      );

    setDraftState(EditorState.push(editorState, newContentState, 'dialogue'));
  }

  // Tabs
  if (command === 'tabs') {
    let contents = draftState.getCurrentContent();
    let blocks = convertToRaw(contents).blocks;
    let selection = draftState.getSelection();
    let anchorKey = selection.getAnchorKey();
    let cursorIndex = selection.getAnchorOffset();
    let isOnDialogue = false;
    let cursorPosition = 0;
    let isOnEndText = false;

    for (let block of blocks) {
      if (block.key === anchorKey) {
        isOnDialogue = block.type === 'dialogue' ? true : false;
        cursorPosition = block.text.length;
        isOnEndText =
          block.text.length === cursorIndex && !block.text.includes('" said ')
            ? true
            : false;
      }
    }

    // Return if not on dialogue block.
    if (!isOnDialogue) return;

    // Move the cursor to end or add "said "at the end of the text.
    if (!isOnEndText) {
      let newSelection = draftState.getSelection().merge({
        focusOffset: cursorPosition,
        anchorOffset: cursorPosition,
      });

      setDraftState(EditorState.forceSelection(draftState, newSelection));
    } else {
      let newContent = Modifier.insertText(contents, selection, 'said ');
      let newEditorState = EditorState.push(draftState, newContent, 'add-said');

      setDraftState(
        EditorState.forceSelection(
          newEditorState,
          newContent.getSelectionAfter(),
        ),
      );
    }
  }

  // Additional
  let additioanlCommands = ['—', '©', '®', '℗', '✓', '✗', '℠', '™'];
  if (additioanlCommands.includes(command)) {
    let contents = draftState.getCurrentContent();
    let selection = draftState.getSelection();
    let newContent = Modifier.insertText(contents, selection, command);

    setDraftState(EditorState.push(draftState, newContent, command));
  }
}

export default KeyCommand;
