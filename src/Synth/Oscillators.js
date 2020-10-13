import { Source } from "tone/build/esm/source/Source";
import { assertRange } from "tone/build/esm/core/util/Debug";
import {
  FatOscillator,
  Oscillator,
  defaultArg,
  StereoWidener,
  Panner,
  Gain,
  Noise,
  FrequencyClass,
  optionsFromArguments
} from "tone";
import { noOp } from "tone/build/esm/core/util/Interface";

//====================
import { clamp, random } from "@/utils";
import * as Tone from "tone";

export class VCO extends FatOscillator {
  constructor() {
    const options = optionsFromArguments(VCO.getDefaults(), arguments);
    super(options);

    this._finetune = options.finetune;
    this._seminote = options.seminote;
    this._octave = options.octave;

    this._retrigger = options.retrigger;
    this.detuneOsc();
  }
  static getDefaults() {
    return Object.assign(FatOscillator.getDefaults(), VCO.defaults);
  }

  get finetune() {
    return this._finetune;
  }

  set finetune(value) {
    // ±100 cents range
    value = clamp(parseInt(value), -100, 100);
    this._finetune = value;
    this.detuneOsc();
  }
  get seminote() {
    return this._seminote;
  }
  set seminote(value) {
    // ±12 seminotes range (±1200 cents)
    value = clamp(parseInt(value), -12, 12);
    this._seminote = value;
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
  // get count() {
  //   return this._oscillators.length;
  // }
  // set count(count) {
  //   assertRange(count, 1);
  //   if (this._oscillators.length !== count) {
  //     // dispose the previous oscillators
  //     this._forEach(osc => osc.dispose());
  //     this._oscillators = [];
  //     for (let i = 0; i < count; i++) {
  //       const osc = new Oscillator({
  //         context: this.context,
  //         volume: -6 - count * 1.1,
  //         type: this._type,
  //         phase: this._phase,
  //         partialCount: this._partialCount,
  //         onstop: i === 0 ? () => this.onstop(this) : noOp
  //       });
  //       if (this.type === "custom") {
  //         osc.partials = this._partials;
  //       }
  //       this.frequency.connect(osc.frequency);
  //       this.detune.connect(osc.detune);
  //       osc.detune.overridden = false;
  //       osc.connect(this.output);
  //       this._oscillators[i] = osc;
  //     }
  //     // set the spread
  //     this.spread = this._spread;
  //     if (this.state === "started") {
  //       this._forEach(osc => osc.start());
  //     }
  //   }
  // }

  /*
  detune the oscillator freq using three independent parameters:
  - finetune: ±100 cents range,
  - seminote: ±12 notes range,
  - octave: ±3 octaves range.
  */
  detuneOsc() {
    const fine = this._finetune,
      semi = this._seminote * 100,
      octave = this._octave * 1200,
      value = fine + semi + octave;
    this.detune.setValueAtTime(value);
  }

  _start(time) {
    // randomize voices phase on start
    if (!this.retrigger) {
      this._forEach(osc => (osc.phase = random(0, 360)));
    }
    super._start(time);
  }
  setNote(note, time) {
    this.frequency.setValueAtTime(note, time);
  }
}

VCO.defaults = {
  frequency: "C4",
  type: "sine",
  count: 1, // num of osc's
  phase: 0,
  spread: 0, // detune between osc's
  // -----
  finetune: 0,
  seminote: 0,
  octave: 0,
  // stereo: 0, // stereo spread
  retrigger: false
};

/*
=======================================================
=======================================================
*/

export class OscModule extends Source {
  constructor() {
    const options = optionsFromArguments(OscModule.getDefaults(), arguments);
    // options = defaultArg(options, OscModule.defaults);
    super(options);

    this.oscillator = new options.voice(
      Object.assign({ onstop: () => this.onstop(this), context: this.context }, options.oscillator)
    );
    this.pannerNode = new Panner(options.pan);
    this.gainNode = new Gain(options.gain);
    this._on = options.on;
    this._gain = options.gain;
    this._pan = options.pan;

    this.oscillator.chain(this.pannerNode, this.gainNode, this.output);
  }

  setNote(note, time) {
    this.oscillator.setNote(note, time);
  }

  static getDefaults() {
    return Object.assign(Source.getDefaults(), OscModule.defaults);
  }

  get on() {
    return this._on;
  }

  set on(value) {
    // TODO oscillators voices = 0 instead ??
    this._on = Boolean(value);
  }

  get gain() {
    return this._gain;
  }

  set gain(value) {
    this._gain = value;
    this.gainNode.gain.value = value;
  }

  get pan() {
    return this._pan;
  }

  set pan(value) {
    this._pan = value;
    this.pannerNode.pan.setValueAtTime(value);
  }

  _stop(time, offset, duration) {
    this.oscillator.stop(time, offset, duration);
  }
  _start(time, offset, duration) {
    this.oscillator.start(time, offset, duration);
  }

  _restart(time, offset, duration) {
    this.oscillator.restart(time, offset, duration);
    return this;
  }

  setSource(value) {
    this.oscillator.set(value);
  }

  dispose() {
    super.dispose();
    this.oscillator.dispose();
    this.gainNode.dispose();
    this.pannerNode.dispose();
  }
}

OscModule.defaults = {
  oscillator: { ...VCO.defaults },
  // ----- module -----
  voice: VCO,
  on: true, //TODO - remove, if no voices
  pan: 0,
  gain: 0.5
};

/*
=======================================================
=======================================================
*/

export class Oscillators extends Source {
  constructor() {
    super(optionsFromArguments(Oscillators.getDefaults(), arguments));
    const options = optionsFromArguments(Oscillators.getDefaults(), arguments);
    // options = defaultArg(options, Oscillator.defaults);

    this.oscillator1 = new OscModule(
      Object.assign({ context: this.context, onstop: () => this.onstop(this) }, options.oscillator1)
    );
    this.oscillator2 = new OscModule(Object.assign({ context: this.context }, options.oscillator2));
    this.noise = new OscModule(Object.assign({ context: this.context }, options.noise));

    this.freq1 = this.oscillator1.oscillator.frequency;
    this.freq2 = this.oscillator2.oscillator.frequency;

    this.connectComponent(this.oscillator1, options.oscillator1.on);
    // this.connectComponent(this.oscillator2, options.oscillator2.on);
    // this.connectComponent(this.noise, options.noise.on);
  }

  static getDefaults() {
    return Object.assign(Source.getDefaults(), Oscillators.defaults);
  }

  handleOnStop() {
    if (this._state) {
    }
  }

  connectComponent(component, connect) {
    component.disconnect();
    if (connect) {
      component.on = true;
      component.connect(this.output);
    } else {
      component.on = false;
    }
    return this;
  }

  setNote(note, time, portamento) {
    const computedFrequency = note instanceof FrequencyClass ? note.toFrequency() : note;
    if (portamento > 0) {
      const portTime = this.toSeconds(portamento);
      this.freq1.exponentialRampTo(computedFrequency, portTime, time);
      this.freq2.exponentialRampTo(computedFrequency, portTime, time);
    } else {
      this.freq1.setValueAtTime(note, time);
      this.freq2.setValueAtTime(note, time);
    }
    return this;
  }

  _start(time, offset, duration) {
    this.oscillator1.start(time, offset, duration);
    this.oscillator2.start(time, offset, duration);
    this.noise.start(time, offset, duration);
    return this;
  }

  _stop(time, offset, duration) {
    this.oscillator1.stop(time, offset, duration);
    this.oscillator2.stop(time, offset, duration);
    this.noise.stop(time, offset, duration);
    return this;
  }

  dispose() {
    super.dispose();
    this.oscillator1.dispose();
    this.oscillator2.dispose();
    this.noise.dispose();
    return this;
  }

  _restart(time, offset, duration) {
    this.oscillator1.restart(time, offset, duration);
    this.oscillator2.restart(time, offset, duration);
    this.noise.restart(time, offset, duration);
    return this;
  }
}

Oscillators.defaults = {
  oscillator1: {
    oscillator: {
      type: "sine",
      count: 2,
      phase: 0,
      spread: 0,
      finetune: 0,
      seminote: 0,
      octave: 0,
      retrigger: true
    },
    voice: VCO,
    on: true,
    pan: 0,
    gain: 0.5
  },
  oscillator2: {
    oscillator: {
      type: "sawtooth",
      count: 2,
      phase: 0,
      spread: 0,
      finetune: 0,
      seminote: 0,
      octave: 0,
      retrigger: true
    },
    voice: VCO,
    on: true,
    pan: 0,
    gain: 0.5
  },
  noise: {
    oscillator: { type: "white" },
    voice: Noise,
    on: true,
    pan: 0,
    gain: 0.5
  }
};
/*
=======================================================
=======================================================
*/

export class OscillatorsModule extends Source {
  constructor() {
    super(optionsFromArguments(OscillatorsModule.getDefaults(), arguments));
    const options = optionsFromArguments(OscillatorsModule.getDefaults(), arguments);

    this.oscillator1 = new VCO(
      Object.assign({ context: this.context, onstop: () => this.onstop(this) }, options.oscillator1)
    );
    this.oscillator2 = new VCO(Object.assign({ context: this.context }, options.oscillator2));
    this.noise = new Noise(Object.assign({ context: this.context }, options.noise));

    this.freq1 = this.oscillator1.frequency;
    this.freq2 = this.oscillator2.frequency;
    this.panVol1 = new Tone.PanVol(options.panVol1);
    this.panVol2 = new Tone.PanVol(options.panVol2);
    this.panVol3 = new Tone.PanVol(options.panVol3);
    this.oscillator1.chain(this.panVol1, this.output);
    this.oscillator2.chain(this.panVol2, this.output);
    this.noise.chain(this.panVol3, this.output);
  }

  static getDefaults() {
    return Object.assign(Source.getDefaults(), OscillatorsModule.defaults);
  }

  setNote(note, time, portamento) {
    const computedFrequency = note instanceof FrequencyClass ? note.toFrequency() : note;
    if (portamento > 0) {
      const portTime = this.toSeconds(portamento);
      this.freq1.exponentialRampTo(computedFrequency, portTime, time);
      this.freq2.exponentialRampTo(computedFrequency, portTime, time);
    } else {
      this.freq1.setValueAtTime(note, time);
      this.freq2.setValueAtTime(note, time);
    }
    return this;
  }

  _start(time, offset, duration) {
    this.oscillator1.start(time, offset, duration);
    this.oscillator2.start(time, offset, duration);
    this.noise.start(time, offset, duration);
    return this;
  }

  _stop(time, offset, duration) {
    this.oscillator1.stop(time, offset, duration);
    this.oscillator2.stop(time, offset, duration);
    this.noise.stop(time, offset, duration);
    return this;
  }

  dispose() {
    super.dispose();
    this.oscillator1.dispose();
    this.oscillator2.dispose();
    this.noise.dispose();
    this.panVol1.dispose();
    this.panVol2.dispose();
    this.panVol3.dispose();
    return this;
  }

  _restart(time, offset, duration) {
    this.oscillator1.restart(time, offset, duration);
    this.oscillator2.restart(time, offset, duration);
    this.noise.restart(time, offset, duration);
    return this;
  }
}

OscillatorsModule.defaults = {
  oscillator1: {
    type: "sine",
    count: 1,
    phase: 0,
    spread: 0,
    finetune: 0,
    seminote: 0,
    octave: 0,
    retrigger: true
  },
  oscillator2: {
    type: "sawtooth",
    count: 1,
    phase: 0,
    spread: 0,
    finetune: 0,
    seminote: 0,
    octave: 0,
    retrigger: true
  },
  noise: {
    type: "white"
  },
  panVol1: { pan: 0, volume: 0 },
  panVol2: { pan: 0, volume: -100 },
  panVol3: { pan: 0, volume: -100 }
};
