import { optionsFromArguments, LFO as ToneLFO, Add, now } from "tone";

//====================
export default class LFO extends ToneLFO {
  constructor() {
    const options = optionsFromArguments(LFO.getDefaults(), arguments);
    super(options);
    this._retrigger = options.retrigger;
  }

  static getDefaults() {
    return Object.assign(ToneLFO.getDefaults(), {
      retrigger: false,
      offset: 0, // TODO LFO offset
      max: 1,
      min: -1,
      phase: 0
    });
  }

  get retrigger() {
    return this._retrigger;
  }

  set retrigger(value) {
    this._retrigger = Boolean(value);
    if (value) {
      // this._oscillator.stop();
      this.state === "started" && this._oscillator.stop();
    } else {
      // this._oscillator.start(now());
      this.state === "stopped" && this._oscillator.start(now());
    }
  }

  /**
   * restart LFO phase
   */
  restart() {
    if (this.retrigger) {
      this._oscillator.phase = this.phase;
      this._oscillator.start(now());
    }
  }

  restop(time) {
    if (this.retrigger) {
      this.stop(time);
    }
  }
  dispose() {
    super.dispose();
    return this;
  }
}
