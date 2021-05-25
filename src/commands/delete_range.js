export default function deleteRange(from, to) {
  return (state, dispatch) => {
    const { tr } = state;
    tr.delete(from, to);
    return dispatch(tr);
  };
}

// export const deleteRange = range => ({ tr, dispatch }) => {
//   const { from, to } = range;
//
//   if (dispatch) {
//     tr.delete(from, to);
//   }
//
//   return true;
// };
