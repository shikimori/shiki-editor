export default {
  editor: { type: Object, required: true },
  node: { type: Object, required: true },
  getPos: { type: Function, required: true },
  isSelected: { type: Boolean, required: true },
  updateAttributes: { type: Function, required: true }
};
