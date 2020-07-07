import Toastify from 'toastify-js';

const defaults = {
  duration: 3000000,
  newWindow: true,
  close: true,
  gravity: 'top',
  position: 'right',
  stopOnFocus: true
};

export function flash(options) {
  if ('alert' in options || 'error' in options) {
    error(options.alert || options.error);
  } else if ('info' in options) {
    info(options.info);
  } else {
    notice(options.notice);
  }
}

export function error(text, options = {}) {
  if (text) {
    Toastify({
      ...defaults,
      ...options,
      className: 'error',
      text
    }).showToast();
  }
}

export function info(text, options = {}) {
  if (text) {
    Toastify({
      ...defaults,
      ...options,
      className: 'info',
      text
    }).showToast();
  }
}

export function notice(text, options = {}) {
  if (text) {
    Toastify({
      ...defaults,
      ...options,
      className: 'notice',
      text
    }).showToast();
  }
}
