import { ShikiLoader } from './shiki_loader';
import TrailingNode from './trailing_node';

export default function(editor) {
  return [
    new TrailingNode(),
    new ShikiLoader({ shikiRequest: editor.options.shikiRequest })
  ];
}
