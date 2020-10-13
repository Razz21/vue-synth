import { ScaleRange } from "@/utils";
import { Monophonic } from "tone/build/esm/instrument/Monophonic";
import { assertRange } from "tone/build/esm/core/util/Debug";
import { deepMerge } from "tone/build/esm/core/util/Defaults";
import {
  PolySynth,
  AmplitudeEnvelope,
  Envelope,
  MidiClass,
  optionsFromArguments,
  OmniOscillator,
  LFO,
  PanVol,
  Oscillator,
  FrequencyClass,
  Noise,
  Gain,
  Filter,
  FrequencyEnvelope,
  Pow,
  Scale
} from "tone";

// import { OscModule, Oscillators, VCO } from "./Oscillators";
import { FilterModule } from "./index";
import { ModMatrix } from "./ModMatrix";
import { DESTINATIONS, SOURCES } from "./synthfunctions";

// todo phase retrigger switch for each osc

export class Voice extends Monophonic {
  constructor() {
    super(optionsFromArguments(Voice.getDefaults(), arguments));
    const options = optionsFromArguments(Voice.getDefaults(), arguments);

    // oscillators
    this.oscillator1 = new Oscillator(
      Object.assign(
        { context: this.context, onstop: () => this.onsilence(this) },
        options.oscillator1
      )
    );
    this.oscillator2 = new Oscillator(options.oscillator2);
    this.noise = new Oscillator(options.noise);
    this.panVol1 = new PanVol(options.panVol1);
    this.panVol2 = new PanVol(options.panVol2);
    this.panVol3 = new PanVol(options.panVol3);

    this.panVol2.volume.value = -96;
    this.panVol3.volume.value = -96;

    // AMP EG
    // this.ampEnvelope = new AmplitudeEnvelope(
    //   Object.assign(options.ampEnvelope, { context: this.context })
    // );

    this._oscOUT = new Gain(1);
    this.AMP_EG = new Envelope(Object.assign(options.ampEnvelope, { context: this.context }));

    // Filter
    // this.filter = new FilterModule(Object.assign(options.filter, { context: this.context }));
    this.filter = new Filter(Object.assign(options.filter, { context: this.context }));

    this._isActive = false;
    this._noteNumber = -1;
    this._filterAmount = options.filterAmount;

    // modulators //---per voice
    this.LFO_1 = new LFO(options.LFO);
    this.EG_1 = new Envelope(options.EG);

    // filter //---add scaling for envelope to allow envelope connect with other destinations
    const _freq = this.toFrequency(200);
    // taken from "Tone.FrequencyEnvelope"
    this._filterScale = new Scale({
      context: this.context,
      min: _freq,
      max: _freq * Math.pow(2, 4)
    });
    this._filterExp = new Pow({ context: this.context, value: 1 });
    this._filterScale.connect(this.filter.frequency);

    // connect nodes
    this.EG_1.chain(this._filterExp, this._filterScale);
    this.AMP_EG.connect(this._oscOUT.gain);

    this.oscillator1.chain(this.panVol1, this.filter, this._oscOUT, this.output);
    this.oscillator2.chain(this.panVol2, this.filter, this._oscOUT, this.output);
    this.noise.chain(this.panVol3, this.filter, this._oscOUT, this.output);

    // this.EG_1.connect(this.filter.frequency);

    // mod matrix
    this.modMatrix = new ModMatrix();
    this._prepareForPlay();
    this.LFO_1.start();
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

  _prepareForPlay() {
    // destinations
    this.modMatrix.destinations[DESTINATIONS.OSC_1_FC] = this.oscillator1.frequency;
    this.modMatrix.destinations[DESTINATIONS.OSC_1_PHASE] = this.oscillator1.phase;
    this.modMatrix.destinations[DESTINATIONS.OSC_1_VOL] = this.panVol1.volume;
    this.modMatrix.destinations[DESTINATIONS.OSC_1_PAN] = this.panVol1.pan;

    this.modMatrix.destinations[DESTINATIONS.OSC_2_FC] = this.oscillator2.frequency;
    this.modMatrix.destinations[DESTINATIONS.OSC_2_PHASE] = this.oscillator2.phase;
    this.modMatrix.destinations[DESTINATIONS.OSC_2_VOL] = this.panVol2.volume;
    this.modMatrix.destinations[DESTINATIONS.OSC_2_PAN] = this.panVol2.pan;

    this.modMatrix.destinations[DESTINATIONS.OSC_3_VOL] = this.panVol3.volume;
    this.modMatrix.destinations[DESTINATIONS.OSC_3_PAN] = this.panVol3.pan;

    this.modMatrix.destinations[DESTINATIONS.FILTER_FC] = this.filter.frequency;

    // sources
    this.modMatrix.sources[SOURCES.LFO_1_OUT] = this.LFO_1;
    this.modMatrix.sources[SOURCES.EG_1_OUT] = this.EG_1;
    this.modMatrix.sources[SOURCES.AMP_EG_OUT] = this.AMP_EG;
  }

  setNote(note, time) {
    const computedFrequency = note instanceof FrequencyClass ? note.toFrequency() : note;
    if (this.portamento > 0 && this.getLevelAtTime(computedTime) > 0.05) {
      const portTime = this.toSeconds(this.portamento);
      this.oscillator1.frequency.exponentialRampTo(computedFrequency, portTime, time);
      this.oscillator2.frequency.exponentialRampTo(computedFrequency, portTime, time);
    } else {
      this.oscillator1.frequency.setValueAtTime(note, time);
      this.oscillator2.frequency.setValueAtTime(note, time);
    }
    return this;
  }

  _triggerEnvelopeAttack(time, velocity = 1) {
    // this.filter.triggerAttack(time, velocity);
    this.AMP_EG.triggerAttack(time, velocity);
    this.EG_1.triggerAttack(time, velocity);
    this.oscillator1.start(time);
    this.oscillator2.start(time);
    this.noise.start(time);
    this.isActive = true;

    if (this.AMP_EG.sustain === 0) {
      const computedAttack = this.toSeconds(this.AMP_EG.attack);
      const computedDecay = this.toSeconds(this.AMP_EG.decay);
      this.oscillator1.stop(time + computedAttack + computedDecay);
      this.oscillator2.stop(time + computedAttack + computedDecay);
      this.noise.stop(time + computedAttack + computedDecay);
    }
  }

  _triggerEnvelopeRelease(time) {
    // this.filter.triggerRelease(time);
    this.AMP_EG.triggerRelease(time);
    this.EG_1.triggerRelease(time);
    this.oscillator1.stop(time + this.toSeconds(this.AMP_EG.release));
    this.oscillator2.stop(time + this.toSeconds(this.AMP_EG.release));
    this.noise.stop(time + this.toSeconds(this.AMP_EG.release));
  }

  _setFree() {
    this.isActive = false;
    return this;
  }

  reset() {
    this._noteNumber = -1;
    return this;
  }

  dispose() {
    super.dispose();
    this.EG_1.disconnect();
    this.EG_1.dispose();
    this.filter.dispose();
    this.oscillator1.dispose();
    this.oscillator2.dispose();
    this.noise.dispose();
    this.AMP_EG.dispose();
    this.panVol1.dispose();
    this.panVol2.dispose();
    this.panVol3.dispose();
    return this;
  }

  updateModMatrix(row, type, value) {
    this.modMatrix.updateModMatrix(row, type, value);
  }
}

Voice.defaults = {
  ampEnvelope: {
    attack: 0.001,
    decay: 0.5,
    sustain: 0.5,
    release: 0.5,
    exponent: 2
  },
  filter: {
    frequency: 1000
  },
  EG: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.5, exponent: 2 },
  filterAmount: 0,
  oscillator1: {
    type: "triangle"
  }
};

export class VoiceManager extends PolySynth {
  constructor() {
    super(optionsFromArguments(VoiceManager.getDefaults(), arguments));
    const options = optionsFromArguments(VoiceManager.getDefaults(), arguments);
    this.options = options;
    this.voice = Voice;
    const defaults = options.voice.getDefaults();
    this.options = Object.assign(defaults, options.options);
    // LFO 1
    // this.LFO1 = new LFO(options.LFO1);

    this._controls = [
      // AMP Envelope
      { id: 0, label: "Amplitude Attack", type: "knob", value: 0, log: true },
      { id: 1, label: "Amplitude Decay", type: "knob", value: 0, log: true },
      { id: 2, label: "Amplitude Sustain", type: "knob", value: 0, log: true },
      { id: 3, label: "Amplitude Release", type: "knob", value: 0, log: true },
      // Filter Envelope
      { id: 4, label: "Filter Attack", type: "knob", value: 0, log: true },
      { id: 5, label: "Filter Decay", type: "knob", value: 0, log: true },
      { id: 6, label: "Filter Sustain", type: "knob", value: 0, log: true },
      { id: 7, label: "Filter Release", type: "knob", value: 0, log: true },
      // Filter
      { id: 8, label: "Filter Cutoff", type: "knob", value: 0, log: true },
      { id: 9, label: "Filter Resonance", type: "knob", value: 0 },
      { id: 10, label: "Filter Type LP", type: "radio", value: 0 }, //fixme radio
      { id: 11, label: "Filter Slope", type: "knob", value: 0 },
      { id: 12, label: "Filter Envelope Amount", type: "knob", value: 0 },
      // Oscillators
      { id: 13, label: "Oscillator 1 Type", type: "knob", value: 0 },
      { id: 14, label: "Oscillator 1 FineTune", type: "knob", value: 0 },
      { id: 15, label: "Oscillator 1 SemiNote", type: "knob", value: 0 },
      { id: 16, label: "Oscillator 1 Octave", type: "knob", value: 0 },
      { id: 17, label: "Oscillator 1 Phase", type: "knob", value: 0 },
      { id: 18, label: "Oscillator 1 Retrig", type: "button", value: 0 },

      { id: 19, label: "Oscillator 1 Type", type: "knob", value: 0 },
      { id: 20, label: "Oscillator 2 FineTune", type: "knob", value: 0 },
      { id: 21, label: "Oscillator 2 SemiNote", type: "knob", value: 0 },
      { id: 22, label: "Oscillator 2 Octave", type: "knob", value: 0 },
      { id: 23, label: "Oscillator 2 Phase", type: "knob", value: 0 },
      { id: 24, label: "Oscillator 2 Retrig", type: "button", value: 0 },

      { id: 25, label: "Oscillator 3 Mix", type: "knob", value: 0 }, // todo morph white/pink
      // Mixer
      { id: 26, label: "Oscillator 1 Volume", type: "fader", value: 0 },
      { id: 27, label: "Oscillator 2 Volume", type: "fader", value: 0 },
      { id: 28, label: "Oscillator 3 Volume", type: "fader", value: 0 },

      { id: 29, label: "Oscillator 1 Pan", type: "knob", value: 0 },
      { id: 30, label: "Oscillator 2 Pan", type: "knob", value: 0 },
      { id: 31, label: "Oscillator 3 Pan", type: "knob", value: 0 },
      // Lfo
      { id: 29, label: "LFO 1 Frequency", type: "knob", value: 0 },
      { id: 30, label: "LFO 1 WaveType", type: "radio", value: 0 }, //Fixme radio
      { id: 29, label: "LFO 1 Target", type: "radio", value: 0 }, //Fixme radio
      { id: 29, label: "LFO 1 Amount", type: "knob", value: 0 } //Fixme radio
    ];
    this.globalModMatrix = new ModMatrix();
    this._ready = false;
    // this.initGlobalMatrix();
    this.initVoices();
    // this.createMatrixSources();
    // this.createMatrixDestinations();
  }

  initGlobalMatrix() {
    // this.globalModMatrix.sources[SOURCES.LFO_1_OUT] = this.LFO1;
    // this.globalModMatrix.destinations[DESTINATIONS.LFO_1_OUT] = this.LFO1.frequency;
  }

  initVoices() {
    // create poly voices
    for (let i = 0; i < this.maxPolyphony; i++) {
      const voice = new this.voice(
        Object.assign(this.options, {
          context: this.context,
          onsilence: this._makeVoiceAvailable.bind(this)
        })
      );
      // set modulation matrix per voice

      if (i === 0) {
        // global params (MUST BE DONE before setting up mod matrix!)
        voice.modMatrix.initializeModMatrix(this.globalModMatrix);
      }
      // all matrices share a common core array of matrix rows
      voice.modMatrix.setMatrixCore(this.globalModMatrix.getMatrixCore());
      // global parameters

      // voice.modMatrix.sources[SOURCES.LFO_1_OUT] = this.LFO1;
      // voice.modMatrix.connectSlots();

      voice.connect(this.output);
      this._voices.push(voice);
    }
    // this.LFO1.start();
    this._ready = true;
  }

  setControlValue(id, value) {
    // todo command pattern / object literal?
    const valuePercent = value;

    switch (id) {
      // AMP Envelope
      case 0: {
        const min = 0.001;
        const max = 4;
        const newVal = (max / 100) * valuePercent;
        this.set({ AMP_EG: { attack: newVal } });
        break;
      }
      case 1: {
        const min = 0.001;
        const max = 4;
        const newVal = (max / 100) * valuePercent;
        this.set({ AMP_EG: { decay: newVal } });
        break;
      }
      case 2: {
        this.set({ AMP_EG: { sustain: valuePercent } });
        break;
      }
      case 3: {
        const min = 0;
        const max = 4;
        const newVal = (max / 100) * valuePercent;
        this.set({ AMP_EG: { release: newVal } });
        break;
      }
      // Filter Envelope
      case 4: {
        const min = 0.001;
        const max = 4;
        const newVal = (max / 100) * valuePercent;
        this.set({ filter: { envelope: { attack: newVal } } });
        break;
      }
      case 5: {
        const min = 0.001;
        const max = 4;
        const newVal = (max / 100) * valuePercent;
        this.set({ filter: { envelope: { decay: newVal } } });
        break;
      }
      case 6: {
        this.set({ filter: { envelope: { sustain: valuePercent } } });
        break;
      }
      case 7: {
        const min = 0;
        const max = 4;
        const newVal = (max / 100) * valuePercent;
        this.set({ filter: { envelope: { release: newVal } } });
        break;
      }
      // Filter
      case 8: {
        // cutoff
        const min = 20;
        const max = 22000;
        // const newVal = (max / 100) * valuePercent;
        const newVal = ScaleRange.linearToLog(value, min, max);
        this.set({ filter: { cutoff: newVal } });
        break;
      }
      case 9: {
        // resonance
        const min = 0;
        const max = 1;
        const newVal = (max / 100) * valuePercent;
        this.set({ filter: { resonance: newVal } });
        break;
      }
      case 10: {
        // type
        const types = [
          "lowpass",
          "highpass",
          "bandpass",
          "lowshelf",
          "highshelf",
          "notch",
          "allpass",
          "peaking"
        ];
        const newVal = types[value];
        this.set({ filter: { type: newVal } });
        break;
      }
      case 11: {
        // slope / rolloff
        const types = [-12, -24, -48];
        const newVal = types[value];
        this.set({ filter: { rolloff: newVal } });
        break;
      }
      case 12: {
        // envelope amount
        this.set({ filter: { envelopeAmount: valuePercent } });
        break;
      }
      // TODO more commands
    }
  }

  dispose() {
    super.dispose();
    this.LFO1.dispose();
    return this;
  }

  _findFreeVoice() {
    let freeVoice = null;
    for (let i = 0; i < this.maxPolyphony; i++) {
      if (!this._voices[i].isActive) {
        freeVoice = this._voices[i];
        break;
      }
    }
    return freeVoice;
  }

  _triggerAttack(notes, time, velocity) {
    notes.forEach(note => {
      const voice = this._findFreeVoice();
      if (!voice) return;

      const midiNote = new MidiClass(this.context, note).toMidi();
      if (voice) {
        voice.triggerAttack(note, time, velocity);
        voice._noteNumber = midiNote;

        this.log("triggerAttack", note, time);
      }
    });
  }

  _triggerRelease(notes, time) {
    notes.forEach(note => {
      const midiNote = new MidiClass(this.context, note).toMidi();
      for (let i = 0; i < this.maxPolyphony; i++) {
        let voice = this._voices[i];
        if (voice.isActive && voice._noteNumber === midiNote) {
          // trigger release on that note
          voice.triggerRelease(time);
          // mark it as released
          this.log("triggerRelease", note, time);
        }
      }
    });
  }

  _makeVoiceAvailable(voice) {
    voice.isActive = false;
  }

  updateModulation(row, type, value) {
    const rowMatrix = this.globalModMatrix.matrixCore[row];
    if (!rowMatrix) return;

    switch (type) {
      case "source":
      case "destination":
        for (let i = 0; i < this._voices.length; i++) {
          const voice = this._voices[i];
          voice.updateModMatrix(row, type, value);
        }
        break;

      case "intensity":
        // TODO value validation / transformation
        rowMatrix.modIntensity = value;
        return; // no updates per voice
      default:
        break;
    }
    // TODO update modulation values / connections / disconnections per voice
  }
}

VoiceManager.defaults = {
  LFO1: {
    min: -1,
    max: 1,
    frequency: 1,
    amplitude: 1, // 0-1
    type: "sine"
  },
  options: {},
  maxPolyphony: 4,
  voice: {}
};
