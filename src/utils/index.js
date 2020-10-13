export function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max);
}
export function clamp1(x, min, max) {
  if (x <= min) return min;
  if (x >= max) return max;
  return x;
}

export function scale(x, inMin, inMax, outMin, outMax) {
  // map a value (x) from one range (in minValue/maxValue) onto another (out minValue/maxValue)
  return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

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
export function throttle(func, timeFrame) {
  var lastTime = 0;
  return function(...args) {
    var now = Date.now();
    if (now - lastTime >= timeFrame) {
      func(...args);
      lastTime = now;
    }
  };
}

export function roundToNearest(num, val) {
  return Math.round(num / val) * val;
}

export function random(min, max) {
  return Math.random() * (max - min) + min;
}

export function getPropertyFromItem(item, property, fallback) {
  if (property == null) return item === undefined ? fallback : item;

  if (item !== Object(item)) return fallback === undefined ? item : fallback;

  if (typeof property === "string") return item[property];

  const value = property(item, fallback);

  return typeof value === "undefined" ? fallback : value;
}

export class ScaleRange {
  /**
   * Convert linear scale input to logarythmic output
   @method linearToLog
   @param value {Number}
   @param minVal {Number}
   @param maxVal {Number}
   @param minPos {Number}
   @param maxPos {Number}
   */

  static linearToLog(value, minVal, maxVal, minPos = 0, maxPos = 100) {
    minVal = Math.log(minVal || 0.001); // > 0
    maxVal = Math.log(maxVal);
    const scale = (maxVal - minVal) / maxPos - minPos;
    return Math.exp((value - minPos) * scale + minVal);
  }

  /**
   * Convert logarythmic scale input to linear output
   @method logToLinear
   @param value {Number}
   @param minVal {Number}
   @param maxVal {Number}
   @param minPos {Number}
   @param maxPos {Number}
   */
  static logToLinear(value, minVal, maxVal, minPos = 0, maxPos = 100) {
    if (value === 0) return 0;
    const scale = (maxVal - minVal) / maxPos - minPos;
    return minPos + (Math.log(value) - minVal) / scale;
  }
  /**
  * Scale linear input to linear output in different range
  *
   @param value {Number}
   @param minIn {Number}
   @param maxIn {Number}
   @param minOut {Number}
   @param maxOut {Number}
   */
  scaleLinear(value, minIn, maxIn, minOut, maxOut) {
    return scale(value, minIn, maxIn, minOut, maxOut);
  }
}

/**
 * Create enum-like object with auto-increment values
 *
 * @param {Array} values array of keys of enum object
 * @param {Number} min minimum index value
 */
export function createEnum(values) {
  let res = {};
  for (let i = 0; i < values.length; i++) {
    res[values[i]] = i; //add the property
  }
  Object.freeze(res); //optional to make immutable
  return res;
}
