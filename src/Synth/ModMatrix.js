import { SOURCES, DESTINATIONS } from "./synthfunctions";
import { ToneAudioNode, Multiply, optionsFromArguments } from "tone";
import { Command, MatrixCommand } from "@/Synth/commands";

/*
===========================================
*/

export class Modulator extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Modulator.getDefaults(), arguments));
    const options = optionsFromArguments(Modulator.getDefaults(), arguments);
    this._source = options.source;
    this._destination = options.destination;
    this.signalNode = this.input = this.output = new Multiply({
      value: options.amount,
      type: options.type,
      context: this.context
    });
  }

  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      source: null,
      destination: null,
      type: "audiorange",
      amount: 0
    });
  }

  get amount() {
    return this.signalNode.factor.value;
  }

  set amount(val) {
    this.signalNode.factor.value = val;
  }

  /*
  control source node
  */
  setSource(node) {
    if (this._source === node) return;
    if (this._source) {
      this._source.disconnect(this.signalNode);
      this._source = null;
    }
    if (node) {
      this._source = node;
      this._source.connect(this.signalNode);
    }
  }

  /*
  control destination node
  */
  setDestination(node) {
    if (this._destination === node) return;
    this.signalNode.disconnect();
    if (node) {
      this._destination = node;
      this.signalNode.connect(this._destination);
    }
  }
  get source() {
    return this._source;
  }

  set source(node) {
    if (this._source === node) return;
    if (this._source) {
      this._source.disconnect(this.signalNode);
      this._source = null;
    }
    if (node) {
      this._source = node;
      this._source.connect(this.signalNode);
    }
  }

  get destination() {
    return this._destination;
  }

  set destination(node) {
    if (this._destination === node) return;
    this.signalNode.disconnect();
    if (node) {
      this._destination = node;
      this.signalNode.connect(this._destination);
    }
  }

  dispose() {
    super.dispose();
    this.source && this.source.disconnect(this.signalNode);
    this.signalNode.disconnect();
    this.signalNode.dispose();
    this.source = null;
    this.destination = null;
  }
}

export class MatrixRow {
  constructor() {
    const options = optionsFromArguments(MatrixRow.getDefaults(), arguments);

    this._id = options.id;
    this._source = options.source;
    this._destination = options.destination;
    // for GUI -> control
    this._amount = options.amount;
    this._command = null;
  }

  static getDefaults() {
    return { source: 0, destination: 0, value: 0 };
  }

  setCommand(command) {
    if (command instanceof Command) {
      this._command = command;
    }
  }

  set(values) {
    if (Array.isArray(values)) {
      this.source = values[0] || 0;
      this.destination = values[1] || 0;
      this.amount = values[2] || 0;
    }
  }

  getValues() {
    return [this.source, this.destination, this.value];
  }

  execute(options) {
    if (!this._command) return;
    this._command.execute({ id: this.id, ...options });
  }

  get amount() {
    return this._amount;
  }

  set amount(amount) {
    this._amount = amount;
    this.execute({ value });
  }

  get id() {
    return this._id;
  }

  get source() {
    return this._source;
  }

  set source(source) {
    if (this.source !== source) {
      this._source = source;
      this.execute({ source });
    }
  }

  get destination() {
    return this._destination;
  }

  set destination(destination) {
    if (this.destination !== destination) {
      this._destination = destination;
      this.execute({ destination });
    }
  }

  dispose() {
    this.source = 0;
    this.destination = 0;
    this.value = 0;
  }
}

export class ModMatrix {
  constructor() {
    // available slots
    this._slots = 5;
    this.size = 0;
    this.matrixCore = null;
    this.sources = new Array(SOURCES.MAX_SOURCES);
    this.destinations = new Array(DESTINATIONS.MAX_DESTINATIONS);
    this.modulators = null;
  }

  /**
   * initialize matrix with empty modulation slots
   *
   * @param {ModMatrix} modMatrix
   * @returns {void}
   */

  initializeModMatrix(modMatrix, context) {
    // const command = new MatrixCommand(context);
    // for (let i = 0; i < this._slots; i++) {
    //   const row = new MatrixRow({ id: i });
    //   row.setCommand(command);
    //   modMatrix.addModMatrixRow(row, i);
    // }
  }

  initializeModulators() {
    this.modulators = new Array(this._slots);
    for (let i = 0; i < this._slots; i++) {
      this.modulators[i] = new Modulator();
    }
  }

  setRows(matrix, rows) {
    if (!matrix.matrixCore || !Array.isArray(rows)) return;
    matrix.matrixCore.map(row => {
      row.set(rows[i]);
    });
  }

  getRows() {
    if (!this.matrixCore) return [];
    return this.matrixCore.reduce((acc, row) => {
      const values = row.getValues();
      acc.push(values);
      return acc;
    }, []);
  }

  set({ id, value }) {
    if (!this.modulators) return;
    const mod = this.modulators[id];
    if (!mod) return;
    const source = this.sources[value[0]],
      destination = this.destinations[value[1]],
      amount = value[2];

    mod.source = source;
    mod.destination = destination;
    mod.amount = amount;
  }

  _setSource(mod, idx) {
    const source = this.sources[idx];
    mod.setSource(source);
  }

  _setDestination(mod, idx) {
    const destination = this.destinations[idx];
    mod.setDestination(destination);
  }

  _setValue(mod, value) {
    mod.value = value;
  }

  getMatrixCore() {
    return this.matrixCore;
  }

  setMatrixCore(modMatrix) {
    this.matrixCore = modMatrix;
    this.size = this.getMatrixSize();
  }

  getMatrixSize() {
    let size = 0;
    if (!this.matrixCore) return size;
    for (let i = 0; i < this.matrixCore.length; i++) {
      const row = this.matrixCore[i];
      if (row) size++;
    }
    return size;
  }

  clearMatrix() {
    if (!this.matrixCore) return;
    let i;
    for (i = this.matrixCore.length; i--; ) {
      this.matrixCore[i] = null;
    }
  }

  addModMatrixRow(row, idx) {
    if (!this.matrixCore) {
      this.createMatrixCore();
    }
    this.matrixCore[idx] = row;
    this.size++;
  }

  createMatrixCore() {
    // create fixed length array
    this.matrixCore = Object.seal(new Array(this._slots).fill(null));
  }

  deleteModMatrix() {
    this.matrixCore = null;
    this.size = 0;
  }

  deleteModulators() {
    if (!this.modulators) return;
    for (let i = 0; i < this.modulators.length; i++) {
      const modulator = this.modulators[i];
      modulator.dispose();
    }
    this.modulators = null;
  }

  dispose() {
    this.deleteModulators();
    this.deleteModMatrix();

    this.sources = null;
    this.destinations = null;
  }
}
