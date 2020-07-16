import { uploadPlaceholder } from '../plugins';

export default function findPlaceholder(state, id) {
  const decos = uploadPlaceholder.getState(state);
  const found = decos.find(null, null, spec => spec.id == id);

  return found.length ? found[0].from : null;
}

