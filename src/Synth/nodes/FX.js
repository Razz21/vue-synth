import { optionsFromArguments, Gain, ToneAudioNode } from "tone";

export default class FX extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(FX.getDefaults(), arguments));
    const options = optionsFromArguments(FX.getDefaults(), arguments);
    this.effect = new options.effect({ ...options.options, context: this.context });
    this._on = options.on;
    this._lastOn = options.on;
    this.input = new Gain();
    this.output = new Gain();

    this.effect.connect(this.output);
    this.activate(options.on); // turn on/off effect
  }

  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      on: 0
    });
  }

  get on() {
    return this._on;
  }

  set on(val) {
    if (this._lastOn === val) return;
    this._on = this._lastOn = Boolean(val);
    this.activate(this._on);
  }

  activate(doActivate) {
    this.input.disconnect();
    if (doActivate) {
      this.input.connect(this.effect);
      // some effects (ie chorus) need to start some properties (e.g. LFO) manually
      if (typeof this.effect.start === "function") {
        this.effect.start();
      }
    } else {
      if (typeof this.effect.stop === "function") {
        this.effect.stop();
      }
      this.input.connect(this.output);
    }
  }

  toggleOn() {
    this.on = !this._on;
  }

  dispose() {
    super.dispose();
    this.effect.disconnect();
    this.effect.dispose();
    return this;
  }
}
