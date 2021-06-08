import { isPriorParagraphEndedWithHardBreak } from '../helpers';

export default function processBulletList(state, tagSequence) {
  if (state.isExceededNesting()) { return false; }

  let isFirstLine = true;
  const priorSequence = state.nestedSequence;

  state.push(state.tagOpen('bullet_list'));
  state.nestedSequence += tagSequence;
  // console.log(`processBulletList '${state.nestedSequence}'`);

  do {
    state.next(isFirstLine ? tagSequence.length : state.nestedSequence.length);
    state.push(state.tagOpen('list_item', { bbcode: tagSequence }));
    processBulletListLines(state, priorSequence, '  ');
    state.push(state.tagClose('list_item'));
    isFirstLine = false;
  } while (state.isSequenceContinued());

  state.push(state.tagClose('bullet_list'));
  state.nestedSequence = state.nestedSequence
    .slice(0, state.nestedSequence.length - tagSequence.length);
  // console.log(`processBulletList '${state.nestedSequence}'`);
}

function processBulletListLines(state, priorSequence, tagSequence) {
  const nestedSequenceBackup = state.nestedSequence;

  state.nestedSequence = priorSequence + tagSequence;
  // console.log(`processBulletListLines '${state.nestedSequence}'`);

  let line = 0;

  do {
    if (line > 0 && !isPriorParagraphEndedWithHardBreak(state.tokens)) {
      state.next(state.nestedSequence.length);
    }

    state.parseLine();
    line += 1;
  } while (state.isSequenceContinued());

  state.nestedSequence = nestedSequenceBackup;
  // console.log(`processBulletListLines '${state.nestedSequence}'`);
}
