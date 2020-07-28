export default function outerDecorator(duration) {
  return function innerDecorator(target, key, descriptor) {
    // return {
    //   configurable: true,
    //   enumerable: descriptor.enumerable,
    //   get: function getter() {
    //     // Attach this function to the instance (not the class)
    //     Object.defineProperty(this, key, {
    //       configurable: true,
    //       enumerable: descriptor.enumerable,
    //       value: debounce(descriptor.value, duration)
    //     });
    //
    //     return this[key];
    //   }
    // };

    descriptor.value = debounce(descriptor.value, duration);
    return descriptor;
  };
}

/** debounces the specified function and returns a wrapper function */
export function debounce(method, duration) {
  let timeoutId;

  function debounceWrapper(...args) {
    debounceWrapper.clear();

    timeoutId = setTimeout(() => {
      timeoutId = null;
      method.apply(this, args);
    }, duration);
  }

  debounceWrapper.clear = function() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounceWrapper;
}
