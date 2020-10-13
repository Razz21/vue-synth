import * as Tone from "tone";

class Synth {
  constructor() {
    this.synth = null;
  }

  create() {
    const osc = new Tone.Oscillator("C4", "sine");
    const gain = new Tone.Gain(0.3).toDestination();
    osc.connect(gain);
  }
}

export default Synth;
