import { Monophonic } from "tone/build/esm/instrument/Monophonic";
import { assertRange } from "tone/build/esm/core/util/Debug";
import { deepMerge } from "tone/build/esm/core/util/Defaults";
import {
  PolySynth,
  defaultArg,
  Filter,
  AmplitudeEnvelope,
  Envelope,
  FrequencyEnvelope,
  Noise,
  Scale,
  ToneAudioNode,
  Gain,
  MidiClass,
  optionsFromArguments
} from "tone";
import { OscModule, Oscillators, VCO } from "./Oscillators";
import { Tone } from "tone/build/esm/core/Tone";

class MyFilter extends Filter {
  dispose() {
    // console.info("dispose", this.frequency);
    // super.dispose();
    this._filters.forEach(filter => {
      filter.dispose();
    });
    this.frequency.dispose();
    this.Q.dispose();
    this.detune.dispose();
    this.gain.dispose();
    return this;
  }
}

export class FilterModule extends ToneAudioNode {
  constructor() {
    const options = optionsFromArguments(FilterModule.getDefaults(), arguments);
    super(options);
    this._minFreq = 0;
    this._maxFreq = 22000;
    // this.input = this.context.createGain() //todo
    this.input = new Gain({ context: this.context });
    this.output = new Gain({ context: this.context });

    this.filter = new MyFilter(Object.assign(options.filter, { context: this.context }));
    this.envelope = new Envelope(Object.assign(options.envelope, { context: this.context }));

    this.scaleEnvelope = new Scale(this._minFreq, this._maxFreq);
    this.envelope.connect(this.scaleEnvelope);
    this.scaleEnvelope.connect(this.filter.frequency);

    this._envelopeAmount = options.envelopeAmount; // 0-1
    this._cutoff = options.filter.frequency;
    this._resonance = options.filter.Q;
    this._type = options.filter.type;
    this._rolloff = options.filter.rolloff;
    this._updateEnvelopeRange();

    this.input.connect(this.filter);
    this.filter.connect(this.output);
  }

  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), FilterModule.defaults);
  }

  get envelopeAmount() {
    return this._envelopeAmount;
  }

  set envelopeAmount(value) {
    assertRange(value, 0, 1);
    this._envelopeAmount = value;
    this._updateEnvelopeRange();
  }

  get cutoff() {
    return this._cutoff;
  }

  set cutoff(val) {
    assertRange(val, 0, 22000);
    this._cutoff = val;
    this._updateEnvelopeRange();
  }

  get resonance() {
    return this._resonance;
  }

  set resonance(val) {
    assertRange(val, 0, 1);
    this._resonance = val;
  }
  get type() {
    return this._type;
  }

  set type(val) {
    this._type = val;
  }
  get rolloff() {
    return this._rolloff;
  }

  set rolloff(val) {
    this._rolloff = val;
  }

  /**
   * Update envelope frequency range
   * @method _updateEnvelopeRange
   *
   */
  _updateEnvelopeRange() {
    const maxFreq = (this._maxFreq - this.cutoff) * this.envelopeAmount;
    this.scaleEnvelope.min = this.cutoff;
    this.scaleEnvelope.max = maxFreq;
  }

  triggerAttack(time) {
    this.envelope.triggerAttack(time);
  }

  triggerRelease(time) {
    this.envelope.triggerRelease(time);
  }

  setFilter(options) {
    this.cutoff = options.frequency;
    this.filter.set(options);
  }

  setEnvelope(options) {
    this.envelope.set(options);
  }

  dispose() {
    super.dispose();
    this.filter.disconnect();
    this.filter.dispose();
    this.envelope.dispose();
    this.scaleEnvelope.dispose();
    return this;
  }
}

FilterModule.defaults = {
  filter: {
    frequency: 100,
    type: "lowpass",
    rolloff: -12,
    Q: 0
  },
  envelope: {
    attack: 0.001,
    decay: 0.5,
    sustain: 0.5,
    release: 0.5,
    exponent: 2
  },
  envelopeAmount: 1
};

export class Voice extends Monophonic {
  constructor() {
    super(optionsFromArguments(Voice.getDefaults(), arguments));
    const options = optionsFromArguments(Voice.getDefaults(), arguments);

    this.oscillators = new Oscillators(
      Object.assign(
        { context: this.context, onstop: () => this.onsilence(this) },
        options.oscillators
      )
    );
    this.filter = new FilterModule(Object.assign(options.filter, { context: this.context }));

    this.envelope = new AmplitudeEnvelope(
      Object.assign(options.envelope, { context: this.context })
    );
    this.oscillators.chain(this.filter, this.envelope, this.output);

    // detect active voice
    this._isActive = false;
  }

  static getDefaults() {
    return Object.assign(Monophonic.getDefaults(), Voice.defaults);
  }

  get isActive() {
    return this._isActive;
  }

  set isActive(value) {
    this._isActive = Boolean(value);
  }

  setNote(note, time) {
    const computedTime = this.toSeconds(time);
    this.oscillators.setNote(note, computedTime, this.portamento);
    return this;
  }

  _triggerEnvelopeAttack(time, velocity = 1) {
    this.filter.triggerAttack(time, velocity);
    this.envelope.triggerAttack(time, velocity);
    this.oscillators.start(time);
    this.isActive = true;

    if (this.envelope.sustain === 0) {
      const computedAttack = this.toSeconds(this.envelope.attack);
      const computedDecay = this.toSeconds(this.envelope.decay);
      this.oscillators.stop(time + computedAttack + computedDecay);
    }
  }

  _triggerEnvelopeRelease(time) {
    this.filter.triggerRelease(time);
    this.envelope.triggerRelease(time);
    this.oscillators.stop(time + this.toSeconds(this.envelope.release));
  }

  dispose() {
    super.dispose();
    this.filter.disconnect();
    this.filter.dispose();
    this.oscillators.dispose();
    this.envelope.dispose();
    return this;
  }
}

Voice.defaults = {
  oscillators: {
    oscillator1: {
      oscillator: {
        type: "sawtooth",
        count: 1,
        phase: 0,
        spread: 10,
        finetune: 0,
        seminote: 0,
        octave: 0,
        retrigger: true
      },
      voice: VCO,
      on: true,
      pan: 0,
      gain: 1
    },
    oscillator2: {
      oscillator: {
        type: "square",
        count: 4,
        phase: 0,
        spread: 5,
        finetune: 0,
        seminote: 0,
        octave: -1,
        retrigger: true
      },
      voice: VCO,
      on: false,
      pan: 0,
      gain: 1
    },
    noise: {
      oscillator: { type: "white" },
      voice: Noise,
      on: false,
      pan: 0,
      gain: 0.5
    }
  },
  filter: {
    filter: {
      frequency: 22000,
      type: "lowpass",
      rolloff: -12
    },
    envelopeAmount: 1,
    envelope: {
      attack: 0.001,
      decay: 0.5,
      sustain: 0.5,
      release: 0.2,
      exponent: 2
    }
  },
  envelope: {
    attack: 0.1,
    attackCurve: "linear",
    decay: 0.5,
    decayCurve: "exponential",
    sustain: 0.4,
    release: 0.5,
    releaseCurve: "exponential"
  }
};

export class Synth extends PolySynth {
  // constructor() {
  //   super(optionsFromArguments(PolySynth.getDefaults(), arguments, ["voice", "options"]));
  //   const options = optionsFromArguments(PolySynth.getDefaults(), arguments, ["voice", "options"]);

  //   const defaults = options.voice.getDefaults();
  //   // this.options = Object.assign(defaults, options.options);
  //   this.options = deepMerge(defaults, options.options);
  //   this.voice = options.voice;
  //   this.maxPolyphony = options.maxPolyphony;

  //   // create the first voice
  //   this._dummyVoice = this._getNextAvailableVoice();
  //   // remove it from the voices list
  //   const index = this._voices.indexOf(this._dummyVoice);
  //   this._voices.splice(index, 1);
  //   // kick off the GC interval
  //   this._gcTimeout = this.context.setInterval(this._collectGarbage.bind(this), 1);
  // }
  // _collectGarbage() {
  //   // super._collectGarbage();
  //   this._averageActiveVoices = Math.max(this._averageActiveVoices * 0.95, this.activeVoices);
  //   // console.log(
  //   //   "garbage",
  //   //   this._availableVoices.length,
  //   //   this._voices.length,
  //   //   this._averageActiveVoices
  //   // );
  //   if (
  //     this._availableVoices.length &&
  //     this._voices.length > Math.ceil(this._averageActiveVoices + 1)
  //   ) {
  //     // take off an available note
  //     const firstAvail = this._availableVoices.shift();
  //     const index = this._voices.indexOf(firstAvail);
  //     // console.log("_collectGarbage", index);
  //     this._voices.splice(index, 1);
  //     if (!this.context.isOffline) {
  //       firstAvail.dispose();
  //     }
  //   }
  // }

  _makeVoiceAvailable(voice) {
    // multiple voice oscillators are binded to this event, make sure this method is called only once per voice
    // console.log("_makeVoiceAvailable", voice.isActive);
    if (voice.isActive === false) return;
    voice.isActive = false;
    super._makeVoiceAvailable(voice);
  }
}
