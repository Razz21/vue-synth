export function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max);
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

export function roundToNearest(num, val) {
  return Math.round(num / val) * val;
}
