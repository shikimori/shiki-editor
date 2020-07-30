export default function chain(target, key, descriptor) {
  var func = descriptor.value;

  descriptor.value = function() {
    func.apply(this, arguments);
    return this;
  };
  return descriptor;
}
