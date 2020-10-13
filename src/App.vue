<template>
  <div id="app">
    <Effect />
    <piano @onKeyUp="onKeyUp" @onKeyDown="onKeyDown"></piano>
    <button @click="synth.releaseAll()">panic</button>
    <button @click="console.log(synth)">log synth</button>
    <!-- <control v-model="val"></control> -->
    <!-- <KnobV2 v-model="knob" :domain="[0, 5]" size="100px" />
    <Test
      v-model="test"
      :valueRange="[0, 5]"
      :items="['sine', 'saw', 'square']"
      snap
      default="sine"
    /> -->
    <div>
      <label>
        Source
        <select name="source" @change="synth.updateModulation(0, 'source', $event.target.value)">
          <option value="0" selected>---</option>
          <option value="1">LFO 1</option>
        </select>
      </label>
      <label>
        Destination
        <select
          name="destination"
          @change="synth.updateModulation(0, 'destination', $event.target.value)"
        >
          <option value="0" selected>---</option>
          <option value="4">OSC 1 Pitch</option>
          <option value="5">OSC 1 Phase</option>
          <option value="6">OSC 1 Vol</option>
          <option value="7">OSC 1 Pan</option>
          <option value="15">FILTER FC</option>
        </select>
      </label>
      <label for="" @input="synth.updateModulation(0, 'intensity', $event.target.value)">
        Amount
        <input type="range" min="0" max="1" step="0.1" />
      </label>
    </div>
    <hr />
    <Oscilloscope :signal="analyzer" v-if="analyzer" />
    <!-- <button @click="triggerAnalyzer">trigger</button> -->
    <!-- <Oscillator :model="osc" v-if="osc"></Oscillator> -->
    <!-- <synth-base></synth-base> -->
    <!-- <envelope v-model="env1"></envelope>
    {{ env1 }} -->
  </div>
</template>

<script>
function midiToNote(midi) {
  return Tone.Frequency(midi, "midi").toFrequency();
}
import * as Tone from "tone";
import { OscModule } from "@/Synth/Oscillators";
import { Voice, Synth } from "@/Synth";
import { PolySynth } from "tone";
import { VoiceManager, Voice as MVoice } from "@/Synth/Voice";

export default {
  name: "App",
  data() {
    return {
      console,
      val: 0,
      knob: 5,
      test: "sine",
      env1: {
        attack: 0,
        decay: 0.2,
        sustain: 0.2,
        release: 5
      },
      synth: null,
      analyzer: null
    };
  },
  methods: {
    onKeyDown(note) {
      this.synth.triggerAttack(midiToNote(note));
    },
    onKeyUp(note) {
      if (this.synth instanceof Tone.PolySynth) {
        this.synth.triggerRelease(midiToNote(note));
      } else {
        // Trigger release if this is the previous note played.
        this.synth.triggerRelease();
      }
      // console.dir(this.synth._availableVoices.length);
    },
    getOSC() {
      const osc = new OscModule();
      return osc.toDestination();
    },
    triggerAnalyzer() {
      this.$root.$emit("update:analyzer");
    }
  },
  mounted() {
    /* ===================================== */
    // this.synth = this.getOSC();
    // this.analyzer = new Tone.Waveform(1024);
    // this.analyzer = this.synth.source;
    // console.log("this.analyzer", this.analyzer);
    // this.synth.connect(this.analyzer);

    /* ===================================== */
    // this.synth = new Synth({
    //   // voice: Tone.Synth,
    //   voice: Voice,

    //   // options: Voice.getDefaults(),
    //   maxPolyphony: 4
    // }).toDestination();

    /* ===================================== */
    this.synth = new VoiceManager({ maxPolyphony: 6 });
    const gain = new Tone.Gain(0.5).toDestination();
    this.synth.connect(gain);
    this.console.log(this.synth);
  }
};
</script>

<style lang="scss">
* {
  box-sizing: border-box;
  // position: relative;
}
body {
  -webkit-transition: 0s;
  transition: 0s;
  background-color: #181b1c;
  font-family: monospace;
  color: #e4e8ea;
  font-size: 16px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

ul,
li {
  list-style: none;
}
</style>
