import { splitBlockWithParagraphFix } from '../commands';
import {
  chainCommands,
  createParagraphNear,
  liftEmptyBlock,
  newlineInCode
} from 'prosemirror-commands';

export default chainCommands(
  newlineInCode,
  createParagraphNear,
  liftEmptyBlock,
  splitBlockWithParagraphFix
);
