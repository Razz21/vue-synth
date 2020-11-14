export class PresetManager {
  constructor(context, presets = []) {
    this._presets = [];
    this._current = 0;
    this.context = context;
    this._addPresets(presets);
  }

  get currentPreset() {
    return this._presets[this.current];
  }

  changePreset(id) {
    if (id === this.current) return;
    const preset = this._presets[id];
    if (!preset) return;
    this.current = id;
  }

  get length() {
    return this._presets.length;
  }

  get current() {
    return this._current;
  }

  set current(value) {
    if (this._presets[value]) {
      this._current = value;
      this.context.setPreset(this.currentPreset);
    }
  }

  /**
   * iterate to next preset forward
   * @param {any} back
   */
  nextPreset() {
    this.current = (this.current + 1) % this.length;
  }

  prevPreset() {
    this.current = (this.current + this.length - 1) % this.length;
  }

  /**
   * Reset current preset to initial state
   */
  resetPreset() {
    this.current = this.current;
  }

  _addPresets(presets) {
    if (Array.isArray(presets)) {
      for (let i = 0; i < presets.length; i++) {
        this.addPreset(presets[i]);
      }
    }
    this.addPreset(initPreset);
  }

  addPreset({ name, values }) {
    if (
      !name ||
      !typeof name === "string" ||
      (!values instanceof Object && values.constructor === Object)
    )
      return;
    // initialize with basic EG / master gain / filter values
    values = Object.assign({}, initPreset.values, values);
    const newPreset = { name, values, id: this.length };
    this._presets.push(newPreset);
  }
}

/* /////////////////////////
          PRESETS
///////////////////////// */

const emptyPreset = {
  name: "empty",
  values: {
    MASTER_GAIN: 0.5,
    AMP_EG_ATT: 0,
    AMP_EG_DEC: 0,
    AMP_EG_REL: 0,
    AMP_EG_SUS: 0,
    EG_1_ATT: 0,
    EG_1_DEC: 0,
    EG_1_REL: 0,
    EG_1_SUS: 0,
    FILTER_CUT: 0,
    FILTER_EG: 0,
    FILTER_Q: 0,
    FILTER_TP: 0,
    FX1_1: 0,
    FX1_2: 0,
    FX1_ON: 0,
    FX1_WET: 0,
    FX2_1: 0,
    FX2_2: 0,
    FX2_3: 0,
    FX2_4: 0,
    FX2_5: 0,
    FX2_ON: 0,
    FX2_WET: 0,
    FX3_1: 0,
    FX3_2: 0,
    FX3_ON: 0,
    FX3_WET: 0,
    FX4_1: 0,
    FX4_2: 0,
    FX4_ON: 0,
    FX4_WET: 0,
    FX5_1: 0,
    FX5_ON: 0,
    LFO_1_FC: 0,
    LFO_1_GAIN: 0,
    LFO_1_PHASE: 0,
    LFO_1_RETR: 0,
    LFO_1_TP: 0,
    LFO_2_FC: 0,
    LFO_2_GAIN: 0,
    LFO_2_PHASE: 0,
    LFO_2_RETR: 0,
    LFO_2_TP: 0,
    M_ROW_1: [0, 0, 0],
    M_ROW_2: [0, 0, 0],
    M_ROW_3: [0, 0, 0],
    M_ROW_4: [0, 0, 0],
    M_ROW_5: [0, 0, 0],
    OSC_1_FINE: 0,
    OSC_1_OCT: 0,
    OSC_1_PAN: 0,
    OSC_1_PHASE: 0,
    OSC_1_RETR: 0,
    OSC_1_SEMI: 0,
    OSC_1_SPRD: 0,
    OSC_1_TP: 0,
    OSC_1_VOICE: 1,
    OSC_1_VOL: 0,
    OSC_2_FINE: 0,
    OSC_2_OCT: 0,
    OSC_2_PAN: 0,
    OSC_2_PHASE: 0,
    OSC_2_RETR: 0,
    OSC_2_SEMI: 0,
    OSC_2_SPRD: 0,
    OSC_2_TP: 0,
    OSC_2_VOICE: 0,
    OSC_2_VOL: 0,
    OSC_3_PAN: 0,
    OSC_3_VOL: 0
  }
};

const initPreset = {
  name: "Init",
  values: {
    MASTER_GAIN: 0.5,
    AMP_EG_ATT: 0.02,
    AMP_EG_DEC: 0.2,
    AMP_EG_REL: 0.25,
    AMP_EG_SUS: 0.5,
    EG_1_ATT: 0.001,
    EG_1_DEC: 0.1,
    EG_1_REL: 0.2,
    EG_1_SUS: 0.5,
    FILTER_CUT: 10000,
    FILTER_EG: 0,
    FILTER_Q: 0,
    FILTER_TP: 0,
    FX1_1: 0,
    FX1_2: 0,
    FX1_ON: 0,
    FX1_WET: 0,
    FX2_1: 0,
    FX2_2: 0,
    FX2_3: 0,
    FX2_4: 0,
    FX2_5: 0,
    FX2_ON: 0,
    FX2_WET: 0,
    FX3_1: 0,
    FX3_2: 0,
    FX3_ON: 0,
    FX3_WET: 0,
    FX4_1: 0,
    FX4_2: 0,
    FX4_ON: 0,
    FX4_WET: 0,
    FX5_1: 0,
    FX5_ON: 0,
    LFO_1_FC: 0,
    LFO_1_GAIN: 0,
    LFO_1_PHASE: 0,
    LFO_1_RETR: 0,
    LFO_1_TP: 0,
    LFO_2_FC: 0,
    LFO_2_GAIN: 0,
    LFO_2_PHASE: 0,
    LFO_2_RETR: 0,
    LFO_2_TP: 0,
    M_ROW_1: [0, 0, 0],
    M_ROW_2: [0, 0, 0],
    M_ROW_3: [0, 0, 0],
    M_ROW_4: [0, 0, 0],
    M_ROW_5: [0, 0, 0],
    OSC_1_FINE: 0,
    OSC_1_OCT: 0,
    OSC_1_PAN: 0,
    OSC_1_PHASE: 0,
    OSC_1_RETR: 0,
    OSC_1_SEMI: 0,
    OSC_1_SPRD: 0,
    OSC_1_TP: 0,
    OSC_1_VOICE: 1,
    OSC_1_VOL: 1,
    OSC_2_FINE: 0,
    OSC_2_OCT: 0,
    OSC_2_PAN: 0,
    OSC_2_PHASE: 0,
    OSC_2_RETR: 0,
    OSC_2_SEMI: 0,
    OSC_2_SPRD: 0,
    OSC_2_TP: 0,
    OSC_2_VOICE: 0,
    OSC_2_VOL: 0,
    OSC_3_PAN: 0,
    OSC_3_VOL: 0
  }
};
