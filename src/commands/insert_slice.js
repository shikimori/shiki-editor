export default function insertSlice(slice) {
  return (state, dispatch) => {
    dispatch(
      state.tr
        .replaceSelection(slice)
        .scrollIntoView()
    );
  };
}
