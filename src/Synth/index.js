import { Gain, Frequency, optionsFromArguments, Meter } from "tone";
import { VoiceManager } from "./Voice";
import { EffectModule } from "./Effects";
import { Instrument } from "tone/build/esm/instrument/Instrument";
import { ControlManager } from "@/Synth/control";
import { BaseCommand } from "@/Synth/commands";
import { CONTROLLERS, CONTROL_TYPES } from "@/Synth/synthfunctions";
import { PresetManager } from "./PresetManager";
let presets;
try {
  presets = require("./presets").default;
} catch (e) {
  console.warn("presets file not found.");
}

function midiToNote(midi) {
  return Frequency(midi, "midi").toFrequency();
}

export default class Synthesizer extends Instrument {
  constructor() {
    super(optionsFromArguments(Synthesizer.getDefaults(), arguments));
    // const options = optionsFromArguments(Synthesizer.getDefaults(), arguments);
    this.ready = false;
    this.voiceManager = new VoiceManager();
    this.effects = new EffectModule();
    this._masterGain = new Gain();
    this.controlManager = new ControlManager();
    this.meter = new Meter({ channels: 2, normalRange: true, smoothing: 0.99 });

    this.voiceManager.chain(this.effects, this._masterGain, this.meter, this.output);
    this.presetManager = new PresetManager(this, presets);
  }

  init() {
    var p = this.controlManager.createControls(this.voiceManager),
      p1 = this.controlManager.createControls(this.effects),
      p2 = this.controlManager.createControls(this);
    Promise.all([p, p1, p2]).then(() => {
      this.ready = true;
      this.setPreset(this.presetManager.currentPreset);
      return true;
    });
  }

  triggerAttack(note, time, velocity) {
    this.voiceManager.triggerAttack(midiToNote(note), time, velocity);
  }

  triggerRelease(note, time) {
    this.voiceManager.triggerRelease(midiToNote(note), time);
  }

  dumpPreset() {
    this.voiceManager.releaseAll();
    const preset = this.controlManager.getPreset();
    console.log("preset", preset);
  }

  setPreset(preset) {
    this.voiceManager.releaseAll();
    this.controlManager.usePreset(preset);
  }

  getControl(id) {
    return this.controlManager.getControl(id);
  }

  get getControlMatrix() {
    const arr = [];
    for (let i = 1; i <= 5; i++) {
      arr.push(this.getControl(CONTROLLERS[`M_ROW_${i}`]));
    }
    return arr;
  }

  panic() {
    this.voiceManager.releaseAll();
    this.dispose();
  }

  get masterGain() {
    return this._masterGain.gain.value;
  }

  set masterGain(value) {
    this._masterGain.gain.value = value;
  }

  dispose() {
    super.dispose();
    this.controlManager.dispose();
    this.voiceManager.dispose();
    this.effects.dispose();
    this._masterGain.dispose();
    this.meter.dispose();
    return this;
  }

  async *getControls() {
    const controls = MasterControls();
    var i;
    for (i = controls.length; i--; ) {
      yield controls[i];
    }
  }
}

function MasterControls() {
  const controls = [];
  let control;
  // MASTER ------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.MASTER_GAIN,
      min: 0,
      max: 1,
      default: 0.5,
      label: "gain",
      width: "4em",
      color: "#ff0000"
    },
    command: {
      type: BaseCommand,
      args: ["masterGain"]
    }
  };
  controls.push(control);
  return controls;
}
