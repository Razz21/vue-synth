<template>
  <div v-if="ready">
    <button @click="fx1.toggleBypass()">bypass1 {{ fx1.bypass }}</button>
    <button @click="fx2.toggleBypass()">bypass2 {{ fx2.bypass }}</button>
  </div>
</template>

<script>
import * as Tone from "tone";
class FX extends Tone.ToneAudioNode {
  constructor(options) {
    super();
    this.effect = new options.effect(options.options);
    this._bypass = options.bypass;
    this._lastBypass = options.bypass;
    this.input = new Tone.Gain();
    this.output = new Tone.Gain();

    this.effect.connect(this.output);
    this.activate(!options.bypass); // initialize effect
  }

  get bypass() {
    return this._bypass;
  }

  set bypass(val) {
    if (this._lastBypass === val) return;

    this._bypass = Boolean(val);
    this.activate(!val);
    this._lastBypass = val;
  }

  activate(doActivate) {
    if (doActivate) {
      this.input.disconnect();
      this.input.connect(this.effect);
    } else {
      this.input.disconnect();
      this.input.connect(this.output);
    }
  }

  toggleBypass() {
    this.bypass = !this._bypass;
  }

  dispose() {
    super.dispose();
    this.effect.dispose();
    return this;
  }
}
export default {
  data() {
    return {
      synth: null,
      fx1: null,
      fx2: null,
      ready: false
    };
  },
  mounted() {
    this.synth = new Tone.Oscillator();
    // this.synth.start();

    this.fx1 = new FX({
      effect: Tone.Distortion,
      options: { distortion: 0.8 },
      bypass: true
    });
    this.fx2 = new FX({ effect: Tone.Phaser, bypass: true });
    this.synth.chain(this.fx1, this.fx2, Tone.Destination);
    this.ready = true;
  }
};
</script>

<style lang="scss"></style>
