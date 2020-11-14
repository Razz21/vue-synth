import { Monophonic } from "tone/build/esm/instrument/Monophonic";

import {
  PolySynth,
  MidiClass,
  optionsFromArguments,
  Panner,
  FrequencyClass,
  Noise,
  Gain
} from "tone";

import { ModMatrix } from "./ModMatrix";
import { DESTINATIONS, SOURCES } from "./synthfunctions";
import { VCO, LFO, FILTER, MODULATION, ENVELOPE } from "./nodes";
import { Modulator } from "@/Synth/ModMatrix";
import * as CMD from "@/Synth/commands";
import { CONTROLLERS, CONTROL_TYPES } from "@/Synth/synthfunctions";
import { FILTERTypes, OSCWaves, LFOWaves } from "@/Synth/globals";
export class Voice extends Monophonic {
  constructor() {
    super(optionsFromArguments(Voice.getDefaults(), arguments));
    const options = optionsFromArguments(Voice.getDefaults(), arguments);
    this._isActive = false;
    this._noteNumber = -1;

    // oscillators
    this.oscillator1 = new VCO(
      Object.assign(
        { context: this.context, onstop: () => this.onsilence(this) },
        options.oscillator
      )
    );
    this.oscillator2 = new VCO(options.oscillator);
    this.noise = new Noise(options.noise);

    this.oscillator1.volume.value = this.oscillator2.volume.value = this.noise.volume.value = 6;

    // volume oscillator nodes
    this.gain1 = new Gain();
    this.gain2 = new Gain();
    this.gain3 = new Gain();

    this.gain123Node = new MODULATION({ units: "number", value: 0, modRange: 1 });
    this.gain123Node.output.fan(this.gain1.gain, this.gain2.gain, this.gain3.gain);

    this.pitch12Node = new MODULATION({ exp: 3, units: "cents", value: 0, modRange: 4800 });
    this.pitch12Node.output.fan(this.oscillator1.detune, this.oscillator2.detune);

    // oscillators mixer nodes -> pan/vol
    this.pan1 = new Panner(options.panner);
    this.pan2 = new Panner(options.panner);
    this.pan3 = new Panner(options.panner);

    this.AMP = new Gain(1);
    this.AMP_EG = new ENVELOPE(Object.assign(options.EG, { context: this.context }));
    this.EG_1 = new ENVELOPE(options.EG, { context: this.context });

    // Filter
    this.filter = new FILTER(Object.assign(options.filter));

    // modulators //---per voice
    this.LFO_1 = new LFO(options.LFO, { context: this.context });
    this.LFO_2 = new LFO(options.LFO, { context: this.context });

    // direct FilterEG -> filter cutoff modulation
    this.filterEGNode = new Modulator({ type: "normalrange", value: options.filterEG });

    // connect nodes
    this.AMP_EG.connect(this.AMP.gain);
    this.EG_1.chain(this.filterEGNode, this.filter.cutoffNode.modNode);

    this.oscillator1.chain(this.gain1, this.pan1, this.filter);
    this.oscillator2.chain(this.gain2, this.pan2, this.filter);
    this.noise.chain(this.gain3, this.pan3, this.filter);
    this.filter.chain(this.AMP, this.output);

    // mod matrix
    this.modMatrix = new ModMatrix();
    this._prepareForPlay();

    // start LFO immediately
  }

  static getDefaults() {
    return Object.assign(Monophonic.getDefaults(), {
      filter: {
        frequency: 2000
      },
      EG: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.5 },
      filterEG: 0,
      oscillator: {
        type: "sine"
      },
      noise: {
        type: "white"
      },
      LFO: {}
    });
  }

  set filterEG(value) {
    this.filterEGNode.amount = value;
  }

  get filterEG() {
    return this.filterEGNode.amount;
  }

  get isActive() {
    return this._isActive;
  }

  set isActive(value) {
    this._isActive = Boolean(value);
  }

  _prepareForPlay() {
    // destinations
    this.modMatrix.destinations[DESTINATIONS.OSC_1_PITCH] = this.oscillator1.detuneNode.modNode;
    this.modMatrix.destinations[DESTINATIONS.OSC_1_VOL] = this.gain1.gain;
    this.modMatrix.destinations[DESTINATIONS.OSC_1_PAN] = this.pan1.pan;

    this.modMatrix.destinations[DESTINATIONS.OSC_2_PITCH] = this.oscillator2.detuneNode.modNode;
    this.modMatrix.destinations[DESTINATIONS.OSC_2_VOL] = this.gain2.gain;
    this.modMatrix.destinations[DESTINATIONS.OSC_2_PAN] = this.pan2.pan;

    this.modMatrix.destinations[DESTINATIONS.OSC_3_VOL] = this.gain3.gain;
    this.modMatrix.destinations[DESTINATIONS.OSC_3_PAN] = this.pan3.pan;
    this.modMatrix.destinations[DESTINATIONS.OSC_123_VOL] = this.gain123Node.modNode;
    this.modMatrix.destinations[DESTINATIONS.OSC_12_PITCH] = this.pitch12Node.modNode;

    this.modMatrix.destinations[DESTINATIONS.FILTER_CUT] = this.filter.cutoffNode.modNode;

    // sources
    this.modMatrix.sources[SOURCES.LFO_1_OUT] = this.LFO_1;
    this.modMatrix.sources[SOURCES.LFO_2_OUT] = this.LFO_2;
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
    this.AMP_EG.triggerAttack(time, velocity);
    this.EG_1.triggerAttack(time, velocity);
    this.oscillator1.start(time);
    this.oscillator2.start(time);
    this.noise.start(time);
    this.LFO_1.restart();
    this.LFO_2.restart();
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
    this.AMP_EG.triggerRelease(time);
    this.EG_1.triggerRelease(time);
    this.oscillator1.stop(time + this.toSeconds(this.AMP_EG.release));
    this.oscillator2.stop(time + this.toSeconds(this.AMP_EG.release));
    this.noise.stop(time + this.toSeconds(this.AMP_EG.release));
    this.LFO_1.restop(time + this.toSeconds(this.AMP_EG.release));
    this.LFO_2.restop(time + this.toSeconds(this.AMP_EG.release));
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
    this.modMatrix.dispose();
    this.filterEGNode.dispose();
    this.oscillator1.dispose();
    this.oscillator2.dispose();
    this.noise.dispose();
    this.AMP_EG.dispose();
    this.EG_1.dispose();
    this.pan1.dispose();
    this.pan2.dispose();
    this.pan3.dispose();
    this.gain1.dispose();
    this.gain2.dispose();
    this.gain3.dispose();
    this.gain123Node.disconnect();
    this.gain123Node.dispose();
    this.pitch12Node.disconnect();
    this.pitch12Node.dispose();
    this.AMP.dispose();
    this.filter.dispose();
    this.LFO_1.dispose();
    this.LFO_2.dispose();
    return this;
  }

  setModMatrix(options) {
    this.modMatrix.set(options);
  }
}

export class VoiceManager extends PolySynth {
  constructor() {
    super(optionsFromArguments(VoiceManager.getDefaults(), arguments));
    this.globalModMatrix = new ModMatrix();
    /* --------------------------- */
    // this.initGlobalMatrix();
    this.initVoices();
  }

  static getDefaults() {
    return Object.assign(PolySynth.getDefaults(), {
      options: {},
      maxPolyphony: 8,
      voice: Voice
    });
  }

  // initGlobalMatrix() {
    // this.globalModMatrix.sources[SOURCES.LFO_1_OUT] = this.LFO1;
    // this.globalModMatrix.destinations[DESTINATIONS.LFO_1_OUT] = this.LFO1.frequency;
  // }

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
        voice.modMatrix.initializeModMatrix(this.globalModMatrix, this);
      }
      // all matrices share a common core array of matrix rows
      voice.modMatrix.setMatrixCore(this.globalModMatrix.getMatrixCore());
      voice.modMatrix.initializeModulators();
      // global parameters

      voice.connect(this.output);
      this._voices.push(voice);
    }
  }

  _getNextAvailableVoice() {
    // skip expensive initialization of PolySynth `dummyVoice` property
    return new Gain(0);
  }

  /**
   * simplified version of PolySynth.set() \
   * options are not sanitized, but just injected to every voice
   * @param {Object} options
   */
  setVoiceValue(options) {
    this._voices.forEach(voice => voice.set(options));
  }

  dispose() {
    super.dispose();

    this.globalModMatrix.dispose();
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
        }
      }
    });
  }

  _makeVoiceAvailable(voice) {
    voice.isActive = false;
  }

  /**
   * simplified version of PolySynth.set() \
   * options are not sanitized, but just injected to every voice
   * @param {Object} options
   */
  setVoiceModMatrix(options) {
    this._voices.forEach(voice => voice.setModMatrix(options));
  }

  async *getControls() {
    const controls = VoiceControls();
    var i;
    for (i = controls.length; i--; ) {
      yield controls[i];
    }
  }
}

function VoiceControls() {
  const controls = [];
  let control;
  // ------------- osc --------------
  for (let i = 1; i <= 2; i++) {
    control = {
      options: {
        type: CONTROL_TYPES.DISPLAYPICKER,
        id: CONTROLLERS[`OSC_${i}_VOICE`],
        min: 0,
        max: 4,
        step: 1,
        snap: true,
        label: "voices",
        value: 1,
        default: 1,
        digits: 0
      },
      command: {
        type: CMD.OscillatorCommand,
        args: [i, "count"]
      }
    };
    controls.push(control);
    control = {
      options: {
        type: CONTROL_TYPES.KNOB,
        id: CONTROLLERS[`OSC_${i}_SPRD`],
        min: 0,
        max: 100,
        step: 1,
        label: "detune",
        value: 0,
        digits: 0
      },
      command: {
        type: CMD.OscillatorCommand,
        args: [i, "spread"]
      }
    };
    controls.push(control);
    control = {
      options: {
        type: CONTROL_TYPES.DISPLAYPICKER,
        id: CONTROLLERS[`OSC_${i}_OCT`],
        min: -3,
        max: 3,
        step: 1,
        bipolar: true,
        snap: true,
        label: "octave",
        value: 0,
        digits: 0
      },
      command: {
        type: CMD.OscillatorCommand,
        args: [i, "octave"]
      }
    };
    controls.push(control);
    control = {
      options: {
        type: CONTROL_TYPES.DISPLAYPICKER,
        id: CONTROLLERS[`OSC_${i}_SEMI`],
        min: -12,
        max: 12,
        bipolar: true,
        step: 1,
        snap: true,
        label: "semi",
        digits: 0
      },
      command: {
        type: CMD.OscillatorCommand,
        args: [i, "semi"]
      }
    };
    controls.push(control);
    control = {
      options: {
        type: CONTROL_TYPES.KNOB,
        id: CONTROLLERS[`OSC_${i}_FINE`],
        min: -100,
        max: 100,
        bipolar: true,
        step: 1,
        snap: true,
        label: "fine",
        digits: 0
      },
      command: {
        type: CMD.OscillatorCommand,
        args: [i, "fine"]
      }
    };
    controls.push(control);
    //-------------------
    control = {
      options: {
        type: CONTROL_TYPES.KNOB,
        id: CONTROLLERS[`OSC_${i}_PHASE`],
        min: 0,
        max: 360,
        step: 1,
        label: "phase",
        digits: 0
      },
      command: {
        type: CMD.OscillatorCommand,
        args: [i, "phase"]
      }
    };
    controls.push(control);
    //-------------------
    control = {
      options: {
        type: CONTROL_TYPES.WAVEPICKER,
        id: CONTROLLERS[`OSC_${i}_TP`],
        step: 1,
        min: 0,
        snap: true,
        max: OSCWaves.length - 1,
        label: "wave",
        digits: 0
      },
      command: {
        type: CMD.OscTypeCommand,
        args: [i]
      }
    };
    controls.push(control);
    //-------------------
    control = {
      options: {
        type: CONTROL_TYPES.TOGGLE,
        id: CONTROLLERS[`OSC_${i}_RETR`],
        label: "retrig",
        digits: 0
      },
      command: {
        type: CMD.OscillatorCommand,
        args: [i, "retrigger"]
      }
    };
    controls.push(control);
  }
  // ------------ /osc --------------
  // ------------ mixer -------------
  for (let i = 1; i <= 3; i++) {
    //-------------------
    control = {
      options: {
        type: CONTROL_TYPES.FADER,
        id: CONTROLLERS[`OSC_${i}_VOL`],
        label: i == 3 ? "noise" : "osc" + i,
        min: 0,
        max: 1
      },
      command: {
        type: CMD.VolumeCommand,
        args: [i]
      }
    };
    controls.push(control);
    //-------------------
    control = {
      options: {
        type: CONTROL_TYPES.KNOB,
        id: CONTROLLERS[`OSC_${i}_PAN`],
        bipolar: true,
        min: -1,
        max: 1,
        width: "2.3em"
      },
      command: {
        type: CMD.PanCommand,
        args: [i]
      }
    };
    controls.push(control);
  }
  // ------------ /mixer ------------
  // ------------ filter ------------
  //----------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FILTER_CUT,
      min: 20,
      max: 20000,
      label: "cutoff",
      default: 10000,
      exp: 3,
      units: "Hz"
    },
    command: {
      type: CMD.FilterCommand,
      args: ["cutoff"]
    }
  };
  controls.push(control);
  //----------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FILTER_Q,
      min: 0,
      max: 10,
      label: "reso"
    },
    command: {
      type: CMD.FilterCommand,
      args: ["Q"]
    }
  };
  controls.push(control);
  //----------------------
  control = {
    options: {
      type: CONTROL_TYPES.DISPLAYPICKER,
      id: CONTROLLERS.FILTER_TP,
      step: 1,
      snap: true,
      size: 4,
      max: FILTERTypes.length - 1,
      items: ["LP12", "LP24", "BP12", "BP24", "HP12", "HP24", "NONE"],
      label: "type",
      digits: 0
    },
    command: {
      type: CMD.FilterTypeCommand,
      args: []
    }
  };
  controls.push(control);
  //----------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FILTER_EG,
      min: 0,
      max: 1,
      label: "env"
    },
    command: {
      type: CMD.VoiceCommand,
      args: ["filterEG"]
    }
  };
  controls.push(control);
  // ------------ /filter ------------
  // ------------ AMP EG -------------
  //----------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.AMP_EG_ATT,
      min: 0.001,
      max: 10,
      default: 0.005,
      label: "attack",
      exp: 3,
      units: "sec",
      digits: 3
    },
    command: {
      type: CMD.AMPEnvCommand,
      args: ["attack"]
    }
  };
  controls.push(control);
  //----------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.AMP_EG_DEC,
      min: 0.001,
      max: 10,
      default: 0.1,
      label: "decay",
      exp: 3,
      units: "sec",
      digits: 3
    },
    command: {
      type: CMD.AMPEnvCommand,
      args: ["decay"]
    }
  };
  controls.push(control);
  //----------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.AMP_EG_SUS,
      min: 0,
      max: 1,
      default: 1,
      label: "sustain"
    },
    command: {
      type: CMD.AMPEnvCommand,
      args: ["sustain"]
    }
  };
  controls.push(control);
  //----------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.AMP_EG_REL,
      min: 0.001,
      max: 10,
      default: 0.05,
      label: "release",
      exp: 3,
      units: "sec",
      digits: 3
    },
    command: {
      type: CMD.AMPEnvCommand,
      args: ["release"]
    }
  };
  controls.push(control);
  // ------------ /AMP EG ------------
  // ------------ FILTER EG ----------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.EG_1_ATT,
      min: 0.001,
      max: 10,
      default: 0.005,
      label: "attack",
      exp: 3,
      units: "sec",
      digits: 3
    },
    command: {
      type: CMD.FilterEnvCommand,
      args: ["attack"]
    }
  };
  controls.push(control);
  //----------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.EG_1_DEC,
      min: 0.001,
      max: 10,
      default: 0.1,
      label: "decay",
      exp: 3,
      units: "sec",
      digits: 3
    },
    command: {
      type: CMD.FilterEnvCommand,
      args: ["decay"]
    }
  };
  controls.push(control);
  //----------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.EG_1_SUS,
      min: 0,
      max: 1,
      default: 1,
      label: "sustain"
    },
    command: {
      type: CMD.FilterEnvCommand,
      args: ["sustain"]
    }
  };
  controls.push(control);
  //----------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.EG_1_REL,
      min: 0.001,
      max: 10,
      default: 0.05,
      label: "release",
      exp: 3,
      units: "sec",
      digits: 3
    },
    command: {
      type: CMD.FilterEnvCommand,
      args: ["release"]
    }
  };
  controls.push(control);
  // ----------- /FILTER EG ----------
  // ------------ LFOs --------------
  for (let i = 0; i < 2; i++) {
    control = {
      options: {
        type: CONTROL_TYPES.WAVEPICKER,
        id: CONTROLLERS[`LFO_${i + 1}_TP`],
        step: 1,
        min: 0,
        snap: true,
        max: LFOWaves.length - 1,
        label: "wave",
        digits: 0
      },
      command: {
        type: CMD.LFOTypeCommand,
        args: [i]
      }
    };
    controls.push(control);
    //----------------------
    control = {
      options: {
        type: CONTROL_TYPES.KNOB,
        id: CONTROLLERS[`LFO_${i + 1}_FC`],
        min: 0.2,
        max: 10,
        default: 5.1,
        label: "freq",
        units: "Hz"
      },
      command: {
        type: CMD.LFOCommand,
        args: [i, "frequency"]
      }
    };
    controls.push(control);
    //----------------------
    control = {
      options: {
        type: CONTROL_TYPES.KNOB,
        id: CONTROLLERS[`LFO_${i + 1}_GAIN`],
        min: 0,
        max: 1,
        default: 1,
        label: "gain"
      },
      command: {
        type: CMD.LFOCommand,
        args: [i, "amplitude"]
      }
    };
    controls.push(control);
    //----------------------
    control = {
      options: {
        type: CONTROL_TYPES.KNOB,
        id: CONTROLLERS[`LFO_${i + 1}_PHASE`],
        min: 0,
        max: 360,
        step: 1,
        label: "phase",
        digits: 0
      },
      command: {
        type: CMD.LFOCommand,
        args: [i, "phase"]
      }
    };
    controls.push(control);
    //----------------------
    control = {
      options: {
        type: CONTROL_TYPES.TOGGLE,
        id: CONTROLLERS[`LFO_${i + 1}_RETR`],
        label: "retrig",
        digits: 0
      },
      command: {
        type: CMD.LFOCommand,
        args: [i, "retrigger"]
      }
    };
    controls.push(control);
  }
  // ------------ /LFOs -------------
  // ------------ Matrix -------------
  for (let i = 0; i < 5; i++) {
    control = {
      options: {
        id: CONTROLLERS[`M_ROW_${i + 1}`],
        value: [0, 0, 0]
      },
      command: {
        type: CMD.ModMatrixCommand,
        args: [i]
      }
    };
    controls.push(control);
  }
  // ------------ /Matrix -------------
  return controls;
}
