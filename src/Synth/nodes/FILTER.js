import { optionsFromArguments, Filter, Signal, Multiply, WaveShaper, DCMeter } from "tone";
import { MODULATION } from "@/Synth/nodes";
export default class MyFilter extends Filter {
  constructor() {
    super(optionsFromArguments(MyFilter.getDefaults(), arguments));
    const options = optionsFromArguments(MyFilter.getDefaults(), arguments);
    this._minFreq = options.minFreq;
    this._maxFreq = options.maxFreq;

    this.cutoffNode = new MODULATION({
      exp: 3,
      units: "frequency",
      value: options.frequency,
      modRange: options.modFreqRange
    });
    this.cutoffNode.output.connect(this.frequency); // works only this way
  }

  get cutoff() {
    return this.cutoffNode._signal.value;
  }

  set cutoff(value) {
    this.cutoffNode._signal.value = value;
  }

  static getDefaults() {
    return Object.assign(Filter.getDefaults(), {
      modFreqRange: 15000,
      minFreq: 20,
      maxFreq: 20000,
      frequency: 50
    });
  }

  dispose() {
    this.frequency.dispose();
    this.Q.dispose();
    this.detune.dispose();
    this.gain.dispose();
    this.cutoffNode.disconnect();
    this.cutoffNode.dispose();
    // FIXME: writable() method in super.dispose() removes own properties, causing error
    try {
      super.dispose();
    } catch (err) {
      console.debug(err.message);
    } finally {
      return this;
    }
  }
}
