import { convertToRaw, getDefaultKeyBinding, KeyBindingUtil } from 'draft-js';

/**
 * Key Binding.
 */
function KeyBinding(e, draftState) {
  // Do invert command, for example, "This" to "tHIS"
  if (KeyBindingUtil.hasCommandModifier(e) && e.keyCode === 20) {
    return 'iNVERT';
  }

  // Reset block type to default
  if (e.keyCode === 13 && !e.altKey) {
    let blocks = convertToRaw(draftState.getCurrentContent()).blocks;
    let selection = draftState.getSelection();
    let anchorKey = selection.getAnchorKey();
    let cursorIndex = selection.getAnchorOffset();
    let headingList = ['section', 'chapter', 'scene'];

    let isHeadingBefore = false;
    let isOnEndText = false;
    let isOnDialogue = false;

    for (let doc of blocks) {
      if (doc.key === anchorKey) {
        isHeadingBefore = headingList.includes(doc.type) || isHeadingBefore;
        isOnEndText = cursorIndex === doc.text.length ? true : false;
        isOnDialogue = doc.type === 'dialogue' ? true : false;
      }
    }

    if ((isHeadingBefore && isOnEndText) || isOnDialogue) {
      return 'clear';
    }
  }

  // Create a dialogue block
  if ((e.keyCode === 13 && e.altKey) || (e.keyCode === 13 && e.ctrlKey)) {
    let blocks = convertToRaw(draftState.getCurrentContent()).blocks;
    let selection = draftState.getSelection();
    let anchorKey = selection.getAnchorKey();
    let cursorPosition = selection.getAnchorOffset();

    let isOnDialogue = false;
    let isDialogueEmpty = false;
    let isOnEndText = false;

    for (let doc of blocks) {
      if (doc.key === anchorKey) {
        isOnDialogue = doc.type === 'dialogue' ? true : false;
        isDialogueEmpty = doc.text.length === 0;
        isOnEndText = cursorPosition === doc.text.length ? true : false;
      }
    }

    if ((!isDialogueEmpty && isOnEndText) || !isOnDialogue || isDialogueEmpty) {
      return 'dialogue';
    } else {
      return 'clear';
    }
  }

  // Press tab
  if (e.keyCode === 9) {
    return 'tabs';
  }

  // Additional
  if (e.altKey && e.key === '-') {
    return '—';
  }

  if (e.altKey && e.key === 'c') {
    return '©';
  }

  if (e.altKey && e.key === 'r') {
    return '®';
  }

  if (e.altKey && e.key === 'p') {
    return '℗';
  }

  if (e.altKey && e.key === 'v') {
    return '✓';
  }

  if (e.altKey && e.key === 'x') {
    return '✗';
  }

  if (e.altKey && e.key === 's') {
    return '℠';
  }

  if (e.altKey && e.key === 't') {
    return '™';
  }

  return getDefaultKeyBinding(e);
}

export default KeyBinding;
