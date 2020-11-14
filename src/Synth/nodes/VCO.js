import { FatOscillator, optionsFromArguments, Oscillator } from "tone";
import { noOp } from "tone/build/esm/core/util/Interface";
//====================
import { MODULATION } from "@/Synth/nodes";
import { clamp, random } from "@/utils";

export default class VCO extends FatOscillator {
  constructor() {
    const options = optionsFromArguments(VCO.getDefaults(), arguments);
    super(options);

    this._fine = options.fine;
    this._semi = options.semi;
    this._octave = 0;

    this._retrigger = options.retrigger;

    // configure modulatable parameters
    this.detuneNode = new MODULATION({
      exp: 3,
      units: "cents",
      value: 0,
      modRange: options.modPitchRange
    });
    this.detuneNode.output.connect(this.detune);

    /* ====================== */
    this.octave = options.octave; // trigger initial detuning (only once)
  }

  static getDefaults() {
    return Object.assign(FatOscillator.getDefaults(), {
      frequency: "C4",
      type: "sine",
      count: 0, // num of osc's
      phase: 0,
      modPitchRange: 4800, //cents
      spread: 0, // detune between osc's
      // -----
      fine: 0,
      semi: 0,
      octave: 0,
      // stereo: 0, // stereo spread
      retrigger: false
    });
  }

  get fine() {
    return this._fine;
  }

  set fine(value) {
    // ±100 cents range
    value = clamp(parseInt(value), -100, 100);
    this._fine = value;
    this.detuneOsc();
  }
  get semi() {
    return this._semi;
  }
  set semi(value) {
    // ±12 semis range (±1200 cents)
    value = clamp(parseInt(value), -12, 12);
    this._semi = value;
    this.detuneOsc();
  }
  get octave() {
    return this._octave;
  }
  set octave(value) {
    // ±3 octaves range (±3600 cents)
    value = clamp(parseInt(value), -3, 3);
    this._octave = value;
    this.detuneOsc();
  }
  get retrigger() {
    return this._retrigger;
  }
  set retrigger(value) {
    this._retrigger = Boolean(value);
  }
  get phase() {
    return this._phase;
  }

  set phase(phase) {
    this._phase = phase;
    // retrigger sync voices phase
    if (this.retrigger) {
      this._forEach(osc => (osc.phase = phase));
    }
  }

  get count() {
    return this._oscillators.length;
  }

  /*
  custom count setter that allows to set oscillators to 0
  */
  set count(count) {
    // assertRange(count, 1);
    if (this._oscillators.length !== count) {
      // dispose the previous oscillators
      this._forEach(osc => osc.dispose());
      this._oscillators = [];
      for (let i = 0; i < count; i++) {
        const osc = new Oscillator({
          context: this.context,
          volume: -6 - count * 1.1,
          type: this._type,
          phase: this._phase + (i / count) * 360,
          partialCount: this._partialCount,
          onstop: i === 0 ? () => this.onstop(this) : noOp
        });
        if (this.type === "custom") {
          osc.partials = this._partials;
        }
        this.frequency.connect(osc.frequency);
        this.detune.connect(osc.detune);
        osc.detune.overridden = false;
        osc.connect(this.output);
        this._oscillators[i] = osc;
      }
      // set the spread
      this.spread = this._spread;
      if (this.state === "started") {
        this._forEach(osc => osc.start());
      }
    }
  }

  /*
  detune the oscillator freq using three independent parameters:
  - fine: ±100 cents range,
  - semi: ±12 notes range,
  - octave: ±3 octaves range.
  */
  detuneOsc() {
    const fine = this._fine,
      semi = this._semi * 100,
      octave = this._octave * 1200,
      value = fine + semi + octave;
    this.detuneNode._signal.setValueAtTime(value);
  }

  _start(time) {
    //   // randomize voices phase on start
    if (this.retrigger) {
      this._forEach(osc => (osc.phase = this.phase));
    } else {
      this._forEach(osc => (osc.phase = random(0, 360)));
    }
    super._start(time);
  }

  setNote(note, time) {
    this.frequency.setValueAtTime(note, time);
  }

  dispose() {
    super.dispose();
    this.detuneNode.disconnect();
    this.detuneNode.dispose();
    return this;
  }
}
