import { Command } from "@/Synth/commands";

export class Control {
  constructor(options = {}) {
    Object.defineProperties(this, {
      _id: { writable: true, enumerable: false }, // enumerable:false = do not return in destructured object
      id: {
        get: function() {
          return this._id;
        },
        set: function(val) {
          if (this._id !== undefined) {
            throw new Error("Can not change id!");
          }
          // check undefined/null || empty string, allow 0 as id
          if (val == undefined || val === "") {
            throw new Error("Invalid id value!");
          }
          this._id = val;
        },
        enumerable: true
      },
      _command: { writable: true, enumerable: false, configurable: false } // configurable:false = non-reactive
    });
    this.type = undefined;
    this._value = options.value || 0; // must be here to remain reactive getter/setter
    Object.assign(this, options, this.constructor.getDefaults());
    if (this.id === undefined) throw new Error("Missing `id` parameter for", this.label);
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    this._value = newValue;
    this._command && this._command.execute(newValue);
  }

  setCommand(command) {
    if (command instanceof Command) {
      this._command = command;
    }
  }

  static getDefaults() {
    return {};
  }
}

export class ControlManager {
  constructor() {
    this._controls = new Map();
  }

  addControl(control) {
    this._controls.set(control.id, control);
  }

  async createControls(context) {
    const controls = context.getControls();
    if (!controls) return;
    let c, cmd, ctrl;

    for await (c of controls) {
      ctrl = new Control(c.options);
      cmd = new c.command.type(context, ...c.command.args);
      ctrl.setCommand(cmd);
      this.addControl(ctrl);
    }
    return true;
  }

  _hasControls() {
    return Object.values(this._controls).length === this._controls.length;
  }

  getPreset() {
    const res = {};
    this._controls.forEach((v, k) => {
      res[k] = v.value;
    });
    return res;
  }

  usePreset(preset) {
    const values = preset.values;
    this._controls.forEach((v, k) => {
      if (values[k] == undefined) return;
      v.value = values[k];
    });
  }

  getControl(key) {
    return this._controls.get(key);
  }

  dispose() {
    this._controls.clear();
    return this;
  }
}
