import { Distortion, optionsFromArguments } from "tone";
import { DISTORTION_ALGORITHMS } from "@/Synth/synthfunctions";

export default class DistortionModule extends Distortion {
  constructor() {
    super(optionsFromArguments(DistortionModule.getDefaults(), arguments));
    const options = optionsFromArguments(DistortionModule.getDefaults(), arguments);
    this._algorithmFn = null;
    this._type = null;
    this.type = options.type;
  }

  static getDefaults() {
    return Object.assign(Distortion.getDefaults(), {
      type: 0
    });
  }

  static getAlgorithm(idx) {
    return DISTORTION_ALGORITHMS[idx];
  }

  set type(value) {
    if (value === this._type) return;
    const fn = DistortionModule.getAlgorithm(value);
    if (!fn) return;
    this._type = value;
    this._algorithmFn = fn;
    this._setDistortionAlgorithm();
  }

  get type() {
    return this._type;
  }

  _setDistortionAlgorithm() {
    const fn = this._algorithmFn(this._distortion);
    this._shaper.setMap(fn);
  }

  /**
   * The amount of distortion. Nominal range is between 0 and 1.
   */
  get distortion() {
    return this._distortion;
  }

  set distortion(amount) {
    if (this.type == undefined) return;
    this._distortion = amount;
    this._setDistortionAlgorithm();
  }
}
