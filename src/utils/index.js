/**
 * Clamp value between an upper and lower bound.
 * @param {number} x input value
 * @param {number} min mininum value
 * @param {number} max maximum allowed value
 */
export function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max);
}

/**
 * Map a value (x) from one range onto another
 * @param {number} x input value
 * @param {number} inMin input range min
 * @param {number} inMax input range max
 * @param {number} outMin output range min
 * @param {number} outMax output range max
 * @returns {number} value scaled linearly onto new range
 */
export function scale(x, inMin, inMax, outMin, outMax) {
  return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Convert polar coordinates to Cartesian
 * // https://en.wikipedia.org/wiki/Polar_coordinate_system#Converting_between_polar_and_Cartesian_coordinates
 * @param {number} centerX x center coordinate
 * @param {number} centerY y center coordinate
 * @param {number} radius radius value
 * @param {number} angleInDegrees arc angle in degrees
 * @returns {object} Cartesian coordinates
 */
export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

export function describeArc(x, y, radius, startAngle, endAngle) {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  var d = ["M", end.x, end.y, "A", radius, radius, 0, largeArcFlag, 1, start.x, start.y].join(" ");

  return d;
}

export function debounce(func, wait = 100) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}
/**
 * Underscore.js like implementation of throttle function \
 * source: https://stackoverflow.com/a/27078401
 * @param {function} func - callback function
 * @param {number} wait - interval time between function execution calls
 * @param {Object|undefined} options - additional options (optional)
 * @param {boolean} [options.leading=true] - disable [=false] execution on the leading edge
 * @param {boolean} [options.trailing=true] - disable [=false] execution on the trailing edge
 * @description Returns a function, that, when invoked, will only be triggered at most once
 * during a given window of time. Normally, the throttled function will run
 * as much as it can, without ever going more than once per `wait` duration;
 * but if you'd like to disable the execution on the leading edge, pass
 * `{leading: false}`. To disable execution on the trailing edge, ditto.
 */
export function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

/**
 * Round input to closest step multiple value
 * @param {number} num input value
 * @param {number} step step value
 */
export function roundToNearest(num, step) {
  return Math.round(num / step) * step;
}

/**
 * Generate random number (float) in given range
 * @param {number} min min range value (inc)
 * @param {number} max max range value (inc)
 */
export function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Create enum-like object with auto-increment values
 *
 * @param {Array} values array of keys of enum object
 * @param {Boolean} asValue use array item as enum value
 * @returns {Object} freezed object
 */
export function createEnum(values, asValue) {
  let res = {};
  for (let i = 0; i < values.length; i++) {
    const value = asValue ? values[i] : i; // use array item or idx as value
    res[values[i]] = value; // add property
  }
  Object.freeze(res); // make immutable
  return res;
}
