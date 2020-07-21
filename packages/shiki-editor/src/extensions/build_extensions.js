import ShikiLoader from './shiki_loader';
import TrailingNode from './trailing_node';

export default function(_editor) {
  return [
    new TrailingNode(),
    new ShikiLoader()
  ];
}
