import {
  optionsFromArguments,
  Gain,
  ToneAudioNode,
  Chorus,
  Reverb,
  FeedbackDelay,
  Limiter
} from "tone";

import { FX, DISTORTION } from "@/Synth/nodes";
import { CONTROLLERS, CONTROL_TYPES, DISTORTION_ALGORITHMS } from "@/Synth/synthfunctions";
import { FXCommand, FXBypassCommand } from "@/Synth/commands";

export class EffectModule extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(EffectModule.getDefaults(), arguments));
    const options = optionsFromArguments(EffectModule.getDefaults(), arguments);
    this.effects = new Array();
    let i, e;
    for (i = 0; i < options.effects.length; i++) {
      e = options.effects[i];

      this.effects.push(new FX({ effect: e.effect, options: e.options }));
      // if (e.effect instanceof ToneAudioNode) {} // TODO check valid effect constructor
    }
    this.input = new Gain(1);
    this.output = new Gain(1);
    this.input.chain(...this.effects, this.output);
  }

  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      effects: [
        { effect: DISTORTION, options: {} },
        { effect: Chorus, options: {} },
        { effect: FeedbackDelay, options: {} },
        { effect: Reverb, options: {} },
        { effect: Limiter, options: {} }
      ]
    });
  }

  setFX(id, options) {
    const fx = this.effects[id];
    if (!fx) return;
    fx.set(options);
  }

  dispose() {
    super.dispose();
    this.effects.forEach(i => {
      i.disconnect();
      i.dispose();
    });
    return this;
  }

  async *getControls() {
    const controls = EffectControls();
    var i;
    for (i = controls.length; i--; ) {
      yield controls[i];
    }
  }
}

const names = [
  "sine",
  "gloubiboulga",
  "foldback",
  "softClip",
  "saturator",
  "crusher",
  "tarrabia",
  "fuzz"
];

function EffectControls() {
  const controls = [];
  let control;
  // ------------- distortion --------------
  // type ------------------
  control = {
    options: {
      type: CONTROL_TYPES.SELECT,
      id: CONTROLLERS.FX1_1,
      step: 1,
      snap: true,
      max: names.length - 1,
      items: names,
      label: "type",
      digits: 0
    },
    command: {
      type: FXCommand,
      args: [0, "type"]
    }
  };
  controls.push(control);
  // amt ------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FX1_2,
      min: 0,
      max: 1,
      label: "amt"
    },
    command: {
      type: FXCommand,
      args: [0, "distortion"]
    }
  };
  controls.push(control);

  // ------------- /distortion --------------
  // ------------- chorus --------------
  // delayTime  ------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FX2_1,
      min: 2,
      max: 20,
      default: 10,
      label: "delay",
      units: "ms"
    },
    command: {
      type: FXCommand,
      args: [1, "delayTime"]
    }
  };
  controls.push(control);
  // depth   ------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FX2_2,
      min: 0,
      max: 1,
      label: "depth"
    },
    command: {
      type: FXCommand,
      args: [1, "depth"]
    }
  };
  controls.push(control);
  // feedback ------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FX2_3,
      min: 0,
      max: 1,
      label: "feedback"
    },
    command: {
      type: FXCommand,
      args: [1, "feedback"]
    }
  };
  controls.push(control);
  // frequency ------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FX2_4,
      min: 0.1,
      max: 10,
      default: 1,
      label: "freq",
      units: "Hz"
    },
    command: {
      type: FXCommand,
      args: [1, "frequency"]
    }
  };
  controls.push(control);
  // frequency ------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FX2_5,
      min: 0,
      max: 180,
      default: 0,
      label: "spread"
    },
    command: {
      type: FXCommand,
      args: [1, "spread"]
    }
  };
  controls.push(control);
  // ------------- /chorus --------------
  // -------------- delay ---------------
  // delayTime  ------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FX3_1,
      min: 0.05,
      max: 1,
      default: 0.5,
      label: "delay",
      units: "sec"
    },
    command: {
      type: FXCommand,
      args: [2, "delayTime"]
    }
  };
  controls.push(control);
  // feedback ------------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FX3_2,
      min: 0,
      max: 1,
      default: 0.5,
      label: "feedback"
    },
    command: {
      type: FXCommand,
      args: [2, "feedback"]
    }
  };
  controls.push(control);
  // -------------- /delay --------------
  // ------------- reverb ---------------
  // decay/size ---------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FX4_1,
      min: 0.1,
      max: 5,
      default: 0.5,
      label: "size",
      units: "sec"
    },
    command: {
      type: FXCommand,
      args: [2, "decay"]
    }
  };
  controls.push(control);
  // preDelay ---------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FX4_2,
      min: 0.001,
      max: 0.3,
      default: 0.015,
      label: "predelay",
      units: "sec",
      exp: 3,
      digits: 3
    },
    command: {
      type: FXCommand,
      args: [2, "preDelay"]
    }
  };
  controls.push(control);
  // ------------- /reverb --------------
  // ------------- limiter --------------
  // threshold -------------
  control = {
    options: {
      type: CONTROL_TYPES.KNOB,
      id: CONTROLLERS.FX5_1,
      min: -96,
      max: 0,
      default: 0,
      label: "threshold",
      units: "dB",
      exp: 0.1
    },
    command: {
      type: FXCommand,
      args: [4, "threshold"]
    }
  };
  controls.push(control);
  // on/off -------------
  control = {
    options: {
      type: CONTROL_TYPES.TOGGLE,
      id: CONTROLLERS.FX5_ON,
      label: "ON/OFF",
      digits: 0
    },
    command: {
      type: FXBypassCommand,
      args: [4]
    }
  };
  controls.push(control);
  // ------------- /limiter --------------

  // for each -------------
  for (let i = 0; i < 4; i++) {
    // on/off -------------
    control = {
      options: {
        type: CONTROL_TYPES.TOGGLE,
        id: CONTROLLERS[`FX${i + 1}_ON`],
        label: "ON/OFF"
      },
      command: {
        type: FXBypassCommand,
        args: [i]
      }
    };
    controls.push(control);
    // wet ------------------
    control = {
      options: {
        type: CONTROL_TYPES.KNOB,
        id: CONTROLLERS[`FX${i + 1}_WET`],
        min: 0,
        max: 1,
        label: "wet",
        default: 1
      },
      command: {
        type: FXCommand,
        args: [i, "wet"]
      }
    };
    controls.push(control);
  }
  return controls;
}
