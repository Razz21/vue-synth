"use-strict";

import { createEnum } from "@/utils";

/**
 * calculates the bipolar (-1 -> +1) value from a unipolar (0 -> 1) value
 * @method unipolarToBipolar
 * @param {Number} value value to convert
 */
export function unipolarToBipolar(value) {
  return 2 * value - 1;
}

/**
 * calculates the unipolar (0 -> 1) value from a bipolar (-1 -> +1) value
 * @method bipolarToUnipolar
 * @param {Number} value value to convert
 */
export function bipolarToUnipolar(value) {
  return 0.5 * value + 0.5;
}

const sourcesArr = [
  "SOURCE_NONE",
  "LFO_1_OUT", // ---- global
  // "LFO_2_OUT",

  "AMP_EG_OUT", // ---- per voice
  "EG_1_OUT",

  "MAX_SOURCES"
];

const destArr = [
  "DEST_NONE",
  "LFO_1_FC", // ---- global
  // "LFO_2_FC",
  "ALL_OSC_FC",
  "AMP_VOL",

  "OSC_1_FC", // ----- per voice
  "OSC_1_PHASE",
  "OSC_1_VOL",
  "OSC_1_PAN",

  "OSC_2_FC",
  "OSC_2_PHASE",
  "OSC_2_VOL",
  "OSC_2_PAN",
  "OSC_2_PHASE",

  // "OSC_3_MIX",
  "OSC_3_VOL",
  "OSC_3_PAN",

  "FILTER_FC",

  "MAX_DESTINATIONS"
];
const transformsArr = [
  "NONE",
  "UNIPOLAR_TO_BIPOLAR",
  "BIPOLAR_TO_UNIPOLAR",
  "NOTE_NUMBER_TO_FREQUENCY"
];

export const SOURCES = createEnum(sourcesArr, -1);
export const DESTINATIONS = createEnum(destArr, -1);
export const TRANSFORMS = createEnum(transformsArr, -1);
