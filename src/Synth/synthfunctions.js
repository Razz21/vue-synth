"use-strict";

import { clamp, createEnum } from "@/utils";

/**
 * calculates the bipolar (-1 -> +1) value from a normalized unipolar (0 -> 1) value
 * @param {Number} value value to convert
 */
export function unipolarToBipolar(value) {
  return 2 * value - 1;
}

/**
 * calculates the normalized unipolar (0 -> 1) value from a bipolar (-1 -> +1) value
 * @param {Number} value value to convert
 */
export function bipolarToUnipolar(value) {
  return 0.5 * value + 0.5;
}

/**
 * calculates dB gain from normalized 0->1 scale
 * @param {Number} gain - Gain multiplier 0 -> 1;
 * @param {Number} [dBMin=-96] - Min dB value;
 * @param {Number} [dBMax=0] - Offset dB scale;
 * dB = 20 · log10(g)
 */
export function normalizedInToDB(gain, dbMin = -96, dBMax = 0) {
  if (gain <= 0) return dbMin; // log10 require value > 0
  return 20 * Math.log10(gain) + dBMax;
}

/**
 * Calculates linear normalized 0-1 value from dB value \
 * formula -> g = 10^(dB / 20)
 * @param {Number} dValue -       dB value;
 * @param {Number} [dBMin=-96] -  Min dB value;
 * @param {Number} [dBMax=0] -    Max dB value;
 */
export function dBToNormalized(dValue, dBMin = -96, dBMax = 0) {
  if (dValue <= dBMin) return 0;
  if (dValue >= dBMax) return 1;
  return Math.pow(10, (dValue - dBMax) / 20);
}

const sourcesArr = [
  "SOURCE_NONE",
  "LFO_1_OUT",
  "LFO_2_OUT",
  "AMP_EG_OUT",
  "EG_1_OUT",
  "MAX_SOURCES"
];

const destArr = [
  "DEST_NONE",

  "OSC_12_PITCH",
  "AMP_VOL",

  "OSC_1_PITCH", // ----- per voice
  "OSC_1_PHASE",
  "OSC_1_VOL",
  "OSC_1_PAN",

  "OSC_2_PITCH",
  "OSC_2_PHASE",
  "OSC_2_VOL",
  "OSC_2_PAN",

  "OSC_3_VOL",
  "OSC_3_PAN",

  "FILTER_CUT",
  "OSC_123_VOL",
  "OSC_12_PITCH",

  "MAX_DESTINATIONS"
];
const transformsArr = [
  "NONE",
  "UNIPOLAR_TO_BIPOLAR",
  "BIPOLAR_TO_UNIPOLAR",
  "NOTE_NUMBER_TO_FREQUENCY"
];

const controllersArr = [
  "MASTER_GAIN", // 0
  "OSC_1_TP",
  "OSC_1_OCT", //
  "OSC_1_SEMI",
  "OSC_1_FINE",
  "OSC_1_PHASE",
  "OSC_1_VOICE",
  "OSC_1_SPRD",
  "OSC_1_RETR",

  "OSC_1_VOL", // 9
  "OSC_1_PAN",
  // -----------
  "OSC_2_TP", // 11
  "OSC_2_OCT",
  "OSC_2_SEMI",
  "OSC_2_FINE",
  "OSC_2_PHASE",
  "OSC_2_VOICE",
  "OSC_2_SPRD",
  "OSC_2_RETR",

  "OSC_2_VOL", // 19
  "OSC_2_PAN",
  // -----------
  "OSC_3_VOL", // 21
  "OSC_3_PAN",
  // -----------
  "FILTER_CUT", // 23
  "FILTER_Q",
  "FILTER_EG",
  "FILTER_TP",
  // -----------
  "AMP_EG_ATT", // 27
  "AMP_EG_DEC",
  "AMP_EG_SUS",
  "AMP_EG_REL",
  // -----------
  "EG_1_ATT", // 31
  "EG_1_DEC",
  "EG_1_SUS",
  "EG_1_REL",
  // -----------
  "LFO_1_FC", // 35
  "LFO_1_TP",
  "LFO_1_GAIN",
  "LFO_1_PHASE",
  "LFO_1_RETR",
  // -----------
  "LFO_2_FC", // 40
  "LFO_2_TP",
  "LFO_2_GAIN",
  "LFO_2_PHASE",
  "LFO_2_RETR",
  // -----------
  "FX1_ON", //45 //bypass effect
  "FX1_WET", // dry/wet
  "FX1_1",
  "FX1_2",
  "FX2_ON", //bypass effect
  "FX2_WET", // dry/wet
  "FX2_1",
  "FX2_2",
  "FX2_3",
  "FX2_4",
  "FX2_5",
  "FX3_ON", //bypass effect
  "FX3_WET", // dry/wet
  "FX3_1",
  "FX3_2",
  "FX4_ON", //bypass effect
  "FX4_WET", // dry/wet
  "FX4_1",
  "FX4_2",
  "FX5_ON", //bypass effect limiter
  "FX5_1",
  "M_ROW_1", //66
  "M_ROW_3",
  "M_ROW_2",
  "M_ROW_4",
  "M_ROW_5"
  // -----------
];

/*
==========================
distortion algorithms
==========================
*/
/**
 * A favourite of mine is using a sin() function instead.
 * This will have the "unfortunate" side effect of removing
 * odd harmonics if you take it to the extreme: a triangle
 * wave gets mapped to a pure sine wave.
 * https://www.musicdsp.org/en/latest/Effects/43-waveshaper.html
 * @param {Number} k amount [0, 1]
 * @param {Number} x input [-1, 1]
 * @author Jon Watte
 */
const sine = function(k) {
  k = k * 0.4 + 0.1; // soft sine-shaping effect [0.1, 0.5]
  var z = Math.PI * k,
    sin = Math.sin,
    s = clamp(1 / sin(z), -3.236068, 3.236068); /* otherwise blowup */
  return function(x) {
    return sin(z * x) * s;
  };
};
/**
 * https://www.musicdsp.org/en/latest/Effects/86-waveshaper-gloubi-boulga.html
 * @param {Number} k amount [0, 1]
 * @param {Number} x input [-1, 1]
 * @author Laurent de Soras
 */
const gloubiboulga = function(k) {
  var abs = Math.abs,
    exp = Math.exp,
    sqrt = Math.sqrt;
  k = k * 20 + 1; // k range [1, Inf]
  return function(x) {
    // x*=0.686306;
    x = x * k * 0.686306;
    var a = 1 + exp(sqrt(abs(x)) * -0.75);
    return (exp(x) - exp(-x * a)) / (exp(x) + exp(-x));
  };
};
/**
 * https://www.musicdsp.org/en/latest/Effects/203-fold-back-distortion.html
 * @param {Number} x input [-1, 1]
 * @param {Number} k threshold [0, 1]
 */
const foldback = function(k) {
  k = clamp(k, 0, 0.999);
  k = 1 - k; // inverse threshold to apply relation -> more = stronger effect
  var abs = Math.abs;
  return function(x) {
    if (x > k || x < -k) {
      x = abs(abs((x - k) % (k * 4)) - k * 2) - k;
    }
    return x;
  };
};

/**
 * soft clipping algorithm
 * @param {Number} x input [-1, 1]
 * @param {Number} k clipping factor [0, 1] (0 = none, infinity = hard)
 */
const softClip = function(k) {
  return function(x) {
    var x1 = x * k,
      x2 = x1 * x1 + 0.25;
    return x1 / x2;
  };
};

/**
 * https://www.musicdsp.org/en/latest/Effects/42-soft-saturation.html
 * @param {Number} x input [-1, 1]
 * @param {Number} k amount [0, 1]
 */
const saturator = function(k) {
  k = 1 - k;
  var abs = Math.abs,
    sign = Math.sign,
    absx;
  return function(x) {
    absx = abs(x);
    // adjust to negative waveform values
    if (x > k || x < -k) {
      return sign(x) * (k + (absx - k) / (1 + ((absx - k) / (1 - k)) ** 2));
    } else if (x > 1) {
      return (sign(x) * (k + 1)) / 2;
    }
    return x;
  };
};

/**
 * Bit crusher algorithm simplified to one parameter
 * @param {Number} x input [-1, 1]
 * @param {Number} k amount [0, 1]
 * @description reduce sample rate in range 16 bit -> 1 bit
 */
const crusher = function(k) {
  k = 1 - k;
  k *= 16;
  const m = 2 ** k,
    round = Math.round;
  return function(x) {
    return round(x * m) / m;
  };
};

/**
 * Waveshaper \
 * https://www.musicdsp.org/en/latest/Effects/46-waveshaper.html
 * @param {Number} x input [-1, 1]
 * @param {Number} k amount [0, 1]
 * @author Partice Tarrabia and Bram de Jong
 */
const tarrabia = function(k) {
  k = clamp(k, 0, 0.997);
  const m = (2 * k) / (1 - k),
    abs = Math.abs;
  return function(x) {
    return ((1 + m) * x) / (1 + m * abs(x));
  };
};

/**
 * https://www.musicdsp.org/en/latest/Effects/41-waveshaper.html
 * @param {Number} x input [-1, 1]
 * @param {Number} k clipping factor [0, 1] (0 = none, infinity = hard)
 * @author Bram de Jong
 */
function fuzz(k) {
  k = k * 20 + 1;
  const abs = Math.abs,
    pow = Math.pow;
  let absx;
  return function(x) {
    absx = abs(x);
    return (x * (absx + k)) / (pow(x, 2) + (k - 1) * absx + 1);
  };
}

export const SOURCES = createEnum(sourcesArr);
export const DESTINATIONS = createEnum(destArr);
export const TRANSFORMS = createEnum(transformsArr);
export const CONTROLLERS = createEnum(controllersArr, true);
export const CONTROL_TYPES = createEnum([
  "KNOB",
  "DISPLAYPICKER",
  "FADER",
  "WAVEPICKER",
  "TOGGLE",
  "SELECT"
]);

export const DISTORTION_ALGORITHMS = Object.freeze([
  sine,
  gloubiboulga,
  foldback,
  softClip,
  saturator,
  crusher,
  tarrabia,
  fuzz
]);
