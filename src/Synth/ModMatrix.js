import {
  bipolarToUnipolar,
  unipolarToBipolar,
  SOURCES,
  DESTINATIONS,
  TRANSFORMS
} from "./synthfunctions";

import { ToneAudioNode, Scale, ScaleExp, Multiply, optionsFromArguments } from "tone";

/*
===========================================
===========================================
*/

class MatrixRow extends ToneAudioNode {
  constructor() {
    const options = optionsFromArguments(MatrixRow.getDefaults(), arguments);
    super(options);
    // this._sourceMin = options.sourceMin;
    // this._sourceMax = options.sourceMax;
    this._sourceIndex = options.sourceIndex;
    this._destinationIndex = options.destinationIndex;
    // for GUI -> control
    this._controlValue = options.controlValue;
    // -1.0 - 1.0 or 0 - 1.0 range --> bi-/unipolar
    this._modIntensity = options.modIntensity;
    // destination values range
    this._modRange = options.modRange;
    // transform on Source
    this._sourceTransform = options.sourceTransform;
    // to easily turn on/off a modulation routing
    this._enable = options.enable;

    // this._scale = this.input = new Scale({ min: this._sourceMin, max: this._sourceMax });
    // multiply source
    this.input = new Multiply({
      context: this.context,
      value: this._modRange
    });
    this._mult = this.output = new Multiply({ context: this.context, value: this.modIntensity });

    this.input.connect(this.output);
    // this.init();
  }

  init() {
    switch (this.sourceTransform) {
      case TRANSFORMS.BIPOLAR_TO_UNIPOLAR: {
        this.scale = new Scale();
      }
      case TRANSFORMS.UNIPOLAR_TO_BIPOLAR: {
        this.scale = new ScaleExp();
      }
    }
  }

  get modIntensity() {
    return this._modIntensity;
  }

  set modIntensity(value) {
    this.output.value = value;
    this._modIntensity = value;
  }

  get sourceIndex() {
    return this._sourceIndex;
  }
  set sourceIndex(value) {
    this._sourceIndex = value;
  }

  get destinationIndex() {
    return this._destinationIndex;
  }
  set destinationIndex(value) {
    this._destinationIndex = value;
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
    this.createMatrixCore();
  }
  /**
   * initialize matrix with empty modulation slots
   *
   * @param {ModMatrix} modMatrix
   * @returns {void}
   */
  initializeModMatrix(modMatrix) {
    // return;
    let row;

    for (let i = 0; i < this._slots; i++) {
      row = new MatrixRow({
        sourceIndex: SOURCES.SOURCE_NONE,
        destinationIndex: DESTINATIONS.DEST_NONE,
        controlValue: 0,
        modIntensity: 1,
        modRange: 200,
        sourceTransform: TRANSFORMS.NONE,
        enable: true
      });

      modMatrix.addModMatrixRow(row, i);
    }
  }

  _prepareSlot(rowIdx) {
    const modRow = this.matrixCore[rowIdx];
    if (!modRow) return;
    const source = this.sources[modRow.sourceIndex];
    const destination = this.destinations[modRow.destinationIndex];

    if (source) {
      // source.disconnect();
      source.connect(modRow);
    }
    if (destination) {
      // modRow.disconnect();
      modRow.connect(destination);
    }
  }

  connectSlots() {
    if (!this.matrixCore) return;
    for (let i = 0; i < this._slots; i++) {
      this._prepareSlot(i);
    }
  }

  updateModMatrix(rowIdx, type, value) {
    if (!this.matrixCore) return;
    const row = this.matrixCore[rowIdx];
    // console.log(rowIdx, type, value, row);
    if (!row) return;

    if (type === "source") {
      this._updateSource(row, value);
    } else if (type === "destination") {
      this._updateDestination(row, value);
    }
  }

  _updateSource(row, sourceIdx) {
    const currentSource = this.sources[row.sourceIndex];
    if (currentSource) {
      console.log(currentSource, row);
      currentSource.disconnect(row);
    }
    const source = this.sources[sourceIdx];
    if (source) {
      source.connect(row);
      row.sourceIndex = sourceIdx;
    }
  }

  _updateDestination(row, destinationIdx) {
    console.log(row.destinationIndex, destinationIdx);
    const currentDestination = this.destinations[row.destinationIndex];
    if (currentDestination) {
      row.disconnect(currentDestination);
    }
    const destination = this.destinations[destinationIdx];
    if (destination) {
      row.connect(destination);
      row.destinationIndex = destinationIdx;
    }
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
    for (let i = 0; i < this.matrixCore.length; i++) {
      this.matrixCore[i] = null;
    }
    // clear regular array, not work, if object is sealed
    // this.matrixCore.splice(0, this.matrixCore.length);
  }

  addModMatrixRow(row, idx) {
    if (!this.matrixCore) {
      this.createModMatrixCore();
    }
    if (!this.matrixRowExists(row.sourceIndex, row.destinationIndex)) {
      this.matrixCore[idx] = row;
      this.size++;
    }
  }

  matrixRowExists(sourceIndex, destinationIndex) {
    if (!this.matrixCore) return false;
    // Note: skip, if initialize slots or connect just source or destination
    if (sourceIndex === SOURCES.SOURCE_NONE || destinationIndex === DESTINATIONS.DEST_NONE)
      return false;

    for (let i = 0; i < this.size; i++) {
      const row = this.matrixCore[i];

      if (row.sourceIndex === sourceIndex && row.destinationIndex === destinationIndex) {
        return true;
      }
    }
    return false;
  }

  createMatrixCore() {
    // create fixed length array
    // this.matrixCore = Object.seal(new Array(SOURCES.MAX_SOURCES * DESTINATIONS.MAX_DESTINATIONS));
    // this.matrixCore = Object.seal(
    //   new Array(SOURCES.MAX_SOURCES * DESTINATIONS.MAX_DESTINATIONS).fill(null)
    // );
    this.matrixCore = Object.seal(new Array(this._slots).fill(null));
  }

  deleteModMatrix() {
    this.matrixCore = null;
    this.size = 0;
  }

  enableModMatrixRow(sourceIndex, destinationIndex, enable) {
    if (!this.matrixCore) return;
    for (let i = 0; i < this.size; i++) {
      const row = this.matrixCore[i];
      if (row.sourceIndex === sourceIndex && row.destinationIndex === destinationIndex) {
        row.enable = enable;
        return true;
      }
    }
    return false;
  }

  doModulation() {
    if (!this.matrixCore) return;
    this.clearDestinations();
    for (let i = 0; i < this.size; i++) {
      const row = this.matrixCore[i];
      if (!row) continue;
      if (!row.enable) continue;

      let source = this.sources[row.sourceIndex];

      switch (row.sourceTransform) {
        case TRANSFORMS.UNIPOLAR_TO_BIPOLAR:
          source = unipolarToBipolar(source);
          break;
        case TRANSFORMS.BIPOLAR_TO_UNIPOLAR:
          source = bipolarToUnipolar(source);
          break;
        default:
          break;
      }
      const modValue = source * row.modIntensity * row.modRange;

      // TODO GLOBAL VALUES, E.G. ALL OSCILLATORS/ ALL FILTERS

      this.destinations[row.destinationIndex] += modValue;
    }
  }
}
