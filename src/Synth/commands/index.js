import * as globals from "@/Synth/globals";
import { throttle } from "@/utils";

function getOscillator(osc) {
  let result;
  switch (osc) {
    case 1:
      result = "oscillator1";
      break;
    case 2:
      result = "oscillator2";
      break;
    default:
      break;
  }
  return result;
}

export class Command {
  constructor(context) {
    this.context = context;
    this.execute = throttle(this.executeCommand.bind(this), 100);
  }
  executeCommand(value) {}
}

export class OscillatorCommand extends Command {
  constructor(context, osc, param) {
    super(context);
    this.osc = osc;
    this.param = param;
  }
  executeCommand(value) {
    const osc = getOscillator(this.osc);
    if (!osc || !this.param) return;
    this.context.setVoiceValue({ [osc]: { [this.param]: value } });
  }
}

export class OscTypeCommand extends Command {
  constructor(context, osc) {
    super(context);
    this.osc = osc;
  }
  executeCommand(value) {
    const osc = getOscillator(this.osc);
    if (!osc) return;
    const type = globals.OSCWaves[value] || globals.OSCWaves[0];
    this.context.setVoiceValue({ [osc]: { type } });
  }
}

export class PanCommand extends Command {
  constructor(context, idx, param) {
    super(context);
    this.idx = idx;
    this.param = param;
  }
  executeCommand(value) {
    const panParam = "pan" + this.idx;
    this.context.setVoiceValue({ [panParam]: { pan: value } });
  }
}
export class VolumeCommand extends Command {
  constructor(context, idx) {
    super(context);
    this.idx = idx;
  }
  executeCommand(value) {
    const gainParam = "gain" + this.idx;
    this.context.setVoiceValue({ [gainParam]: { gain: value } });
  }
}

export class VoiceCommand extends Command {
  constructor(context, destination) {
    super(context);
    this.destination = destination; // string
  }
  executeCommand(value) {
    this.context.setVoiceValue({ [this.destination]: value });
  }
}

/* ---------- Filter ---------- */
export class FilterFcCommand extends Command {
  constructor(context) {
    super(context);
  }
  executeCommand(value) {
    this.context.setVoiceValue({ filter: { cutoff: value } });
  }
}

export class FilterTypeCommand extends Command {
  constructor(context) {
    super(context);
  }
  executeCommand(value) {
    const type = globals.FILTERTypes[value] || globals.FILTERTypes[0];
    this.context.setVoiceValue({ filter: { ...type } });
  }
}

export class FilterCommand extends Command {
  constructor(context, param) {
    super(context);
    this.param = param;
  }
  executeCommand(value) {
    this.context.setVoiceValue({ filter: { [this.param]: value } });
  }
}

export class AMPEnvCommand extends Command {
  constructor(context, param) {
    super(context);
    this.param = param;
  }
  executeCommand(value) {
    this.context.setVoiceValue({ AMP_EG: { [this.param]: value } });
  }
}

export class FilterEnvCommand extends Command {
  constructor(context, param) {
    super(context);
    this.param = param;
  }
  executeCommand(value) {
    this.context.setVoiceValue({ EG_1: { [this.param]: value } });
  }
}

export class LFOTypeCommand extends Command {
  constructor(context, idx) {
    super(context);
    this.idx = idx;
  }
  executeCommand(value) {
    const lfo = this.idx === 1 ? "LFO_2" : "LFO_1";
    const type = globals.LFOWaves[value] || globals.LFOWaves[0];
    this.context.setVoiceValue({ [lfo]: { type } });
  }
}
export class LFOCommand extends Command {
  constructor(context, idx, param) {
    super(context);
    this.idx = idx;
    this.param = param;
  }
  executeCommand(value) {
    const lfo = this.idx === 1 ? "LFO_2" : "LFO_1";
    this.context.setVoiceValue({ [lfo]: { [this.param]: value } });
  }
}

export class MatrixCommand extends Command {
  constructor(context) {
    super(context);
  }

  executeCommand(value) {
    this.context.setVoiceModMatrix(value);
  }
}

export class ModMatrixCommand extends Command {
  constructor(context, row) {
    super(context);
    this.row = row;
  }

  executeCommand(value) {
    this.context.setVoiceModMatrix({ id: this.row, value });
  }
}

export class FXCommand extends Command {
  constructor(context, effect, param) {
    super(context);
    this.effect = effect;
    this.param = param;
  }
  // effect options
  executeCommand(value) {
    this.context.setFX(this.effect, { effect: { [this.param]: value } });
  }
}
export class FXBypassCommand extends Command {
  constructor(context, effect, param) {
    super(context);
    this.effect = effect;
    this.param = param;
  }
  // bypass is effect wrapper class property
  executeCommand(value) {
    this.context.setFX(this.effect, { on: value });
  }
}

export class BaseCommand extends Command {
  constructor(context, param) {
    super(context);
    this.param = param; // string
  }
  executeCommand(value) {
    this.context.set({ [this.param]: value });
  }
}
