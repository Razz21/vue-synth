<template>
  <div class="_synth">
    <button @click="panic">PANIC</button>
    <br />
    <piano @onKeyUp="onKeyUp" @onKeyDown="onKeyDown"></piano>

    <div class="synth-control">
      <label>
        <p>portamento - ({{ portamento }})</p>
        <input
          type="range"
          min="0"
          max="4"
          step="0.01"
          v-model.number="portamento"
          @input="synth.set('portamento', $event.target.value)"
        />
      </label>
      <label>
        <p>Master - ({{ volume }})</p>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          v-model.number="volume"
          @input="synth.setVolume($event.target.value)"
        />
      </label>
      <label>
        <p>Amp Env</p>
        <Envelope v-model="envelope"></Envelope>
      </label>
    </div>
  </div>
</template>
<script>
function midiToNote(midi) {
  return Tone.Frequency(midi, "midi").toFrequency();
}

class Oscillators extends Source {
  constructor(options) {
    options = Tone.defaultArg(options, Oscillators.defaults);
    // options = Tone.optionsFromArguments(Oscillators.defaults, options);
    super(options);
    this.osc1 = new Tone.OmniOscillator(options.oscillator1);
    this.osc2 = new Tone.OmniOscillator(options.oscillator2);

    this.freq1 = this.osc1.frequency;
    this.freq2 = this.osc2.frequency;

    this.connectComponent(this.osc1, options.oscillator1.on);
    this.connectComponent(this.osc2, options.oscillator2.on);
  }

  connectComponent(component, connect) {
    component.disconnect();
    // if (connect) {
    //   component.connect(this.output);
    // }
    component.connect(this.output);
    return this;
  }
  setNotes(note, time, portamento) {
    // todo https://github.com/Tonejs/Tone.js/blob/ed0d3b0/Tone/instrument/Monophonic.ts#L124
    portamento = +portamento;
    // console.log("portamento", typeof portamento, portamento);
    if (portamento > 0) {
      this.freq1.setValueAtTime(this.freq1.value, time);
      this.freq2.setValueAtTime(this.freq2.value, time);
      this.freq1.exponentialRampToValueAtTime(note, time + portamento);
      this.freq2.exponentialRampToValueAtTime(note, time + portamento);
    } else {
      this.freq1.setValueAtTime(note, time);
      this.freq2.setValueAtTime(note, time);
    }
    return this;
  }
  start(time) {
    this.osc1.start(time);
    this.osc2.start(time);
    return this;
  }
  stop(time) {
    this.osc1.stop(time);
    this.osc2.stop(time);
    return this;
  }
  dispose() {
    return this;
  }
}

Oscillators.defaults = {
  oscillator1: {
    on: true,
    range: 1,
    type: "triangle",
    volume: 0.5
  },
  oscillator2: {
    on: true,
    detune: 10,
    range: 2,
    type: "sawtooth",
    volume: 0.5
  }
};

class MyMonoSynth extends Monophonic {
  constructor(options) {
    options = Tone.defaultArg(options, MyMonoSynth.defaults);
    super(options);

    this.MASTER = new Tone.Gain(options.volume);

    this.source = new Oscillators(options);
    this.envelope = new Tone.AmplitudeEnvelope(options.envelope);
    this.portamento = options.portamento;
    this.source.chain(this.envelope, this.MASTER, this.output);
  }

  set envelopeProps(props) {
    this.envelope.attack = props.attack;
    this.envelope.decay = props.decay;
    this.envelope.sustain = props.sustain;
    this.envelope.release = props.decay;
  }
  setNote(note, time) {
    time = this.toSeconds(time);
    this.source.setNotes(note, time, this.portamento);
    return this;
  }
  triggerAttack(note, time, velocity) {
    time = this.toSeconds(time);
    this._triggerEnvelopeAttack(time, velocity);
    this.setNote(note, time);
    return this;
  }
  _triggerEnvelopeAttack(time, velocity) {
    this.envelope.triggerAttack(time, velocity);
    this.source.start(time);
    return this;
  }
  _triggerEnvelopeRelease(time) {
    time = this.toSeconds(time);
    this.envelope.triggerRelease(time);
    this.source.stop(time + this.envelope.release);
    return this;
  }
  dispose() {
    this.source.dispose();
    return this;
  }
  releaseAll() {
    // TODO
    return;
  }
  setVolume(val) {
    this.MASTER.gain.setValueAtTime(val);
  }
}

MyMonoSynth.defaults = {
  envelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0.3,
    release: 1
  },
  modMix: 0.5,
  oscillator1: {
    on: true,
    type: "triangle",
    volume: 0.5
  },
  oscillator2: {
    on: true,
    detune: 10,
    type: "sawtooth",
    volume: 0.5
  },
  portamento: 0,
  volume: 0.5
};

class Synth {
  constructor() {
    this.VCO = new Tone.Oscillator("C4", "sawtooth");
    this.VCA = new Tone.Gain(0.1);
    this.ADSR = new Tone.AmplitudeEnvelope({
      attack: 0,
      decay: 1,
      sustain: 1,
      release: 0.4
    });
    this.Env = new Tone.Envelope({
      attack: 0,
      decay: 3,
      sustain: 1,
      release: 5
    });
    this.Env2 = new Tone.FrequencyEnvelope({
      attack: 1,
      decay: 2,
      sustain: 1,
      release: 3
    });
    this.filter = new Tone.Filter(500, "highpass");
  }

  start() {
    this.Env2.connect(this.filter.frequency);
    this.VCO.chain(this.filter, this.ADSR, this.VCA, Tone.Destination);
    this.VCO.start();
  }
  triggerAttack(note) {
    this.VCO.frequency.setValueAtTime(note);
    this.ADSR.triggerAttack();
    this.Env.triggerAttack();
    this.Env2.triggerAttack();
  }
  triggerRelease(note) {
    this.ADSR.triggerRelease();
    this.Env.triggerRelease();
    this.Env2.triggerRelease();
  }
  detune(val) {
    this.VCO.detune.setValueAtTime(val);
  }
}

import * as Tone from "tone";
import { Monophonic } from "tone/build/esm/instrument/Monophonic";
import { Source } from "tone/build/esm/source/Source";

export default {
  data() {
    return {
      synth: null,
      detune: -100,
      envelope: {
        attack: 0.005,
        decay: 0.5,
        sustain: 0.3,
        release: 1
      },
      oscillator1: {
        on: true,
        range: 1,
        type: "square",
        volume: -6
      },
      oscillator2: {
        on: true,
        detune: 10,
        range: 2,
        type: "sine",
        volume: -6
      },
      portamento: 0,
      volume: 1
    };
  },
  computed: {},
  methods: {
    panic() {
      this.synth && this.synth.releaseAll();
    },
    onKeyDown(note) {
      this.synth.triggerAttack(midiToNote(note));
    },
    onKeyUp(note) {
      // this.synth.triggerRelease(midiToNote(note));
      if (this.synth instanceof Tone.PolySynth) {
        this.synth.triggerRelease(midiToNote(note));
      } else {
        // Trigger release if this is the previous note played.
        this.synth.triggerRelease();
      }
    },
    getSynth() {
      if (this.synth) {
        this.synth.dispose();
        this.synth = null;
      }
      const synth = new MyMonoSynth({
        envelope: this.envelope,
        oscillator1: this.oscillator1,
        oscillator2: this.oscillator2,
        portamento: this.portamento,
        volume: this.volume
      });
      return synth.toDestination();
    }
  },
  mounted() {
    console.clear();
    // this.synthesizer();
    this.synth = this.getSynth();
    // console.log(this.synth.set);
  }
};
</script>

<style lang="scss">
._synth {
  display: block;
}
.synth-control {
  border: 2px solid #aaa;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  > label {
    flex: 0 0 100px;
    border: 1px solid #555;
    margin: 0.5rem;
  }
}
</style>
