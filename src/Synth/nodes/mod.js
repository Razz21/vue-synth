import {
  optionsFromArguments,
  Multiply,
  ToneAudioNode,
  Signal,
  WaveShaper
} from "tone";

export class ModNode extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(ModNode.getDefaults(), arguments));
    const options = optionsFromArguments(ModNode.getDefaults(), arguments);

    this._signal = this.input = new Signal({ units: options.units, value: options.value });

    this.modNode = new Multiply({ value: options.modRange });
    this.output = new Signal({ units: options.units });
    this.input.connect(this.output);
    this.modNode.connect(this.output);
  }
  get raw() {
    return this.meter.getValue();
  }

  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      modRange: 1,
      units: "number",
      value: 0
    });
  }
  dispose() {
    super.dispose();
    this._signal.disconnect();
    this.output.disconnect();
    this.modNode.disconnect();
    this.modNode.dispose();
    return this;
  }
}
class ModNodeExp extends ModNode {
  constructor() {
    super(optionsFromArguments(ModNodeExp.getDefaults(), arguments));
    const options = optionsFromArguments(ModNodeExp.getDefaults(), arguments);

    this._modMultNode = new Multiply({ value: options.modRange }).connect(this.output);
    this.modNode = new WaveShaper(val => Math.pow(val, options.exp)).connect(this._modMultNode);
  }
  static getDefaults() {
    return Object.assign(ModNode.getDefaults(), {
      exp: 1
    });
  }
  dispose() {
    super.dispose();
    this._modMultNode.disconnect();
    this._modMultNode.dispose();
    return this;
  }
}

export default class ModNodeFactory {
  constructor(options) {
    if (options.exp) {
      return new ModNodeExp(options);
    } else {
      return new ModNode(options);
    }
  }
}
