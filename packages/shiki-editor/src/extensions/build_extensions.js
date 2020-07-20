import LinksParser from './links_parser';
import TrailingNode from './trailing_node';

export default function(_editor) {
  return [
    new TrailingNode(),
    new LinksParser()
  ];
}
