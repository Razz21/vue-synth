<template>
  <div class="synth">
    <div class="synth__wrapper">
      <div class="synth__layout" v-if="synth && synth.ready">
        <div class="row row-1" v-if="defer(2)">
          <div class="col" v-for="i in 2" :key="i">
            <v-section :label="`osc ${i}`">
              <Controller :model="synth.getControl(CONTROLLERS[`OSC_${i}_TP`])" />
              <Controller :model="synth.getControl(CONTROLLERS[`OSC_${i}_OCT`])" />
              <Controller :model="synth.getControl(CONTROLLERS[`OSC_${i}_SEMI`])" />
              <Controller :model="synth.getControl(CONTROLLERS[`OSC_${i}_FINE`])" />
              <Controller :model="synth.getControl(CONTROLLERS[`OSC_${i}_PHASE`])" />
              <Controller :model="synth.getControl(CONTROLLERS[`OSC_${i}_SPRD`])" />
              <Controller :model="synth.getControl(CONTROLLERS[`OSC_${i}_VOICE`])" />
              <Controller :model="synth.getControl(CONTROLLERS[`OSC_${i}_RETR`])" />
            </v-section>
          </div>
        </div>
        <div class="row-divider divider-1"></div>
        <div class="row row-2" v-if="defer(3)">
          <div class="col" v-for="i in 2" :key="i">
            <v-section :label="`lfo ${i}`">
              <Controller :model="synth.getControl(CONTROLLERS[`LFO_${i}_RETR`])" />
              <Controller :model="synth.getControl(CONTROLLERS[`LFO_${i}_TP`])" />
              <Controller :model="synth.getControl(CONTROLLERS[`LFO_${i}_PHASE`])" />
              <Controller :model="synth.getControl(CONTROLLERS[`LFO_${i}_FC`])" />
              <Controller :model="synth.getControl(CONTROLLERS[`LFO_${i}_GAIN`])" />
            </v-section>
          </div>
          <div class="col">
            <v-section label="mixer">
              <div class="flex flex-column" v-for="i in 3" :key="i">
                <Controller :model="synth.getControl(CONTROLLERS[`OSC_${i}_VOL`])" />
                <Controller :model="synth.getControl(CONTROLLERS[`OSC_${i}_PAN`])" />
              </div>
            </v-section>
          </div>
          <div class="col">
            <div>
              <v-section label="filter env">
                <Controller :model="synth.getControl(CONTROLLERS.EG_1_ATT)" />
                <Controller :model="synth.getControl(CONTROLLERS.EG_1_DEC)" />
                <Controller :model="synth.getControl(CONTROLLERS.EG_1_SUS)" />
                <Controller :model="synth.getControl(CONTROLLERS.EG_1_REL)" />
              </v-section>

              <v-section label="amp env">
                <Controller :model="synth.getControl(CONTROLLERS.AMP_EG_ATT)" />
                <Controller :model="synth.getControl(CONTROLLERS.AMP_EG_DEC)" />
                <Controller :model="synth.getControl(CONTROLLERS.AMP_EG_SUS)" />
                <Controller :model="synth.getControl(CONTROLLERS.AMP_EG_REL)" />
              </v-section>
            </div>
          </div>
        </div>
        <div class="row-divider"></div>
        <div class="row row-3" v-if="defer(4)">
          <div class="col">
            <v-section label="filter">
              <Controller :model="synth.getControl(CONTROLLERS.FILTER_TP)" />
              <Controller :model="synth.getControl(CONTROLLERS.FILTER_CUT)" />
              <Controller :model="synth.getControl(CONTROLLERS.FILTER_Q)" />
              <Controller :model="synth.getControl(CONTROLLERS.FILTER_EG)" />
            </v-section>
          </div>
          <div class="col">
            <v-section label="mod matrix">
              <template #label>
                <Toggle
                  @input="toggleAnalyser"
                  :value="Number(!!analyser)"
                  class="toggle-scope"
                  id="SCOPE_ON"
                >
                </Toggle>
              </template>
              <Matrix :modMatrix="synth.getControlMatrix">
                <template v-if="analyser">
                  <Analyser :analyser="analyser"></Analyser>
                </template>
              </Matrix>
            </v-section>
          </div>
          <div class="col">
            <v-section label="master">
              <div class="h-full flex flex-column justify-between">
                <MainScreen :model="synth.presetManager" />
                <div class="flex justify-between align-center">
                  <Toggle v-model="rotate" class="toggle-fx" id="FX_ON"> </Toggle>
                  <Controller :model="synth.getControl(CONTROLLERS.MASTER_GAIN)" />
                </div>
              </div>
              <Meter :meter="synth.meter" />
            </v-section>
          </div>
        </div>
        <div class="row-divider"></div>
        <div class="bottom-panel">
          <div class="bottom-panel__wrapper" :class="[rotate ? 'show-fx' : 'show-kb']">
            <div class="row effects" v-if="defer(6)">
              <div class="col">
                <v-section label="distort">
                  <template #label>
                    <Controller :model="synth.getControl(CONTROLLERS.FX1_ON)" />
                  </template>
                  <Controller :model="synth.getControl(CONTROLLERS.FX1_1)" />
                  <Controller :model="synth.getControl(CONTROLLERS.FX1_2)" />
                  <Controller :model="synth.getControl(CONTROLLERS.FX1_WET)" />
                </v-section>
              </div>
              <div class="col">
                <v-section label="chorus">
                  <template #label>
                    <Controller :model="synth.getControl(CONTROLLERS.FX2_ON)" />
                  </template>
                  <Controller :model="synth.getControl(CONTROLLERS.FX2_1)" />
                  <Controller :model="synth.getControl(CONTROLLERS.FX2_2)" />
                  <Controller :model="synth.getControl(CONTROLLERS.FX2_3)" />
                  <Controller :model="synth.getControl(CONTROLLERS.FX2_4)" />
                  <Controller :model="synth.getControl(CONTROLLERS.FX2_5)" />
                  <Controller :model="synth.getControl(CONTROLLERS.FX2_WET)" />
                </v-section>
              </div>
              <div class="col">
                <v-section label="delay">
                  <template #label>
                    <Controller :model="synth.getControl(CONTROLLERS.FX3_ON)" />
                  </template>
                  <Controller :model="synth.getControl(CONTROLLERS.FX3_1)" />
                  <Controller :model="synth.getControl(CONTROLLERS.FX3_2)" />
                  <Controller :model="synth.getControl(CONTROLLERS.FX3_WET)" />
                </v-section>
              </div>
              <div class="col">
                <v-section label="reverb">
                  <template #label>
                    <Controller :model="synth.getControl(CONTROLLERS.FX4_ON)" />
                  </template>
                  <Controller :model="synth.getControl(CONTROLLERS.FX4_1)" />
                  <Controller :model="synth.getControl(CONTROLLERS.FX4_2)" />
                  <Controller :model="synth.getControl(CONTROLLERS.FX4_WET)" />
                </v-section>
              </div>
              <div class="col">
                <v-section label="limiter">
                  <template #label>
                    <Controller :model="synth.getControl(CONTROLLERS.FX5_ON)" />
                  </template>
                  <Controller :model="synth.getControl(CONTROLLERS.FX5_1)" />
                </v-section>
              </div>
            </div>
            <div class="row overflow-hidden justify-center" v-if="defer(5)">
              <div class="col" style="padding:0">
                <div class="piano-section">
                  <div class="piano-section__wrapper" draggable="false">
                    <piano @onKeyUp="onKeyUp" @onKeyDown="onKeyDown" height="6.2em"></piano>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Waveform } from "tone";
import Synthesizer from "@/Synth";
import Piano from "@/components/Piano";
import VSection from "@/components/ui/VSection";
import Matrix from "@/components/matrix/Matrix";
import Meter from "@/components/vis/Meter";
import MainScreen from "@/components/vis/MainScreen";
import Toggle from "@/components/controllers/Toggle";
import Controller from "@/components/controllers/Controller";
const Analyser = () => import("@/components/vis/Analyser");
import { CONTROLLERS } from "@/Synth/synthfunctions";
import Defer from "@/mixins/Defer";
export default {
  mixins: [Defer()],
  components: { Controller, Piano, VSection, Matrix, Meter, MainScreen, Toggle, Analyser },
  data() {
    return {
      synth: null,
      CONTROLLERS,
      analyser: null,
      rotate: 0
    };
  },
  methods: {
    onKeyDown(note) {
      this.synth.triggerAttack(note);
    },
    onKeyUp(note) {
      this.synth.triggerRelease(note);
    },
    async createSynth() {
      const synth = new Synthesizer();
      const ready = await synth.init();
      return synth.toDestination();
    },
    destroySynth() {
      if (this.synth) {
        this.synth.disconnect();
        const oldsynth = this.synth;
        this.synth = null;
        oldsynth.panic();
      }
    },
    dumpPreset() {
      this.synth && this.synth.dumpPreset();
    },
    async panic() {
      this.destroySynth();
      const synth = await this.createSynth();
      if (synth) {
        // make object properties not reactive
        Object.defineProperties(synth, {
          voiceManager: { configurable: false },
          controlManager: { configurable: false },
          effects: { configurable: false }
        });
        this.synth = synth;
      }
    },
    toggleAnalyser() {
      if (!this.synth) return;
      if (!this.analyser) {
        this.analyser = new Waveform(1024);
        this.synth.connect(this.analyser);
      } else {
        this.synth.disconnect(this.analyser);
        this.analyser = null;
      }
    }
  },
  async created() {
    this.$emit("ready");
    await this.panic();
  },
  beforeDestroy() {
    this.destroySynth();
  }
};
</script>

<style lang="scss">
.synth {
  display: inline-block;
  margin: auto;
  flex-shrink: 0;
  &__wrapper {
    margin: 1rem auto;
    overflow: hidden;
    border-radius: 0.4em;
    &::before {
      content: "";
      z-index: 2;
      pointer-events: none;
      position: absolute;
      width: 100%;
      height: 100%;
      box-shadow: inset 0 0.4em 0.15em -0.3em #fff4, inset 0.3em 0 0.2em -0.2em #aaa5,
        inset -0.3em 0 0.2em -0.2em #000a;
      mix-blend-mode: hard-light;
    }
  }
}
.synth__layout {
  // background: #181b1c;
  background: #050505;
  display: grid;

  grid-template-columns: 1fr;
  grid-template-rows: auto;
  grid-auto-rows: auto;
  // ------------
  border-style: solid;
  border-width: 0em 3em;
  border-image: url("~@/assets/images/wood.jpg") 0 100%;
  box-shadow: inset 0.6em 0 0.1em -0.5em #000, inset -0.6em 0 0.1em -0.5em #000,
    inset 0 0 3em 3em #000;
  &::before {
    content: "";
    z-index: 1;
    pointer-events: none;
    position: absolute;
    width: 100%;
    height: 100%;
    box-shadow: 0 0 0.3em 0.1em #111;
  }
  .row-divider {
    position: relative;
    z-index: 4;
    &::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      margin: 0 auto;
      width: 100%;
      height: 6px;
      border-radius: 1px;
      box-shadow: 0 3px 2px 0 #5551, 0 -1px 1px #111, inset -1px 2px 4px 2px #0008,
        inset 1px -1px 2px 2px #7771;
      // ---------------
      height: 3px;
      border-radius: 0;
      box-shadow: 0 1px 1px 0 #5555, 0 -1px 1px #0004, inset 1px -1px 2px 2px #000;
    }
  }
  .row {
    background: #181b1c;
    // display: flex;

    /* grid */
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: auto;
    grid-auto-columns: auto;
    /* /grid */

    &.row-3 {
      z-index: 2;
    }
    &.effects {
      grid-template-columns: min-content auto;
    }
  }
  .col {
    position: relative;
    padding: 0.7em 1em;
    display: flex;
    // flex: 0 1 auto;
    // flex: 1;
    + .col {
      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        margin: auto 0;
        width: 5px;
        height: 87%;
        border-radius: 1px;
        width: 3px;
        height: 100%;
        border-radius: 0;
        box-shadow: 1px 0px 3px 0px #5555, -2px 0px 1px #0004, inset -1px 1px 1px 0px #000;
      }
    }
  }
  .text {
    position: absolute;
    left: 20%;
    top: 50%;
    font-size: 4rem;
    text-transform: uppercase;
    font-weight: 800;
    mix-blend-mode: overlay;
    color: #fff;
  }
  .piano-section {
    margin: auto;
    margin-bottom: 0;
    padding: 0.1em;
    box-shadow: inset 0 0 2px 2px #111;

    &__wrapper {
      // box-shadow: 0 0 5px 2px #111;
      &::before {
        box-shadow: inset 0 6px 8px 1px #111a, inset 0 3px 3px 1px #111;
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 3;
      }
    }
  }
}

.section {
  #section {
    &__osc-1,
    &__osc-2,
    &__filter-env,
    &__amp-env {
      justify-items: start;
      // grid-auto-columns: auto;
      grid-auto-rows: 1fr;
      grid-template-rows: 1fr;
      grid-auto-flow: column;
      column-gap: 0.1em;
    }
    &__lfo-1,
    &__lfo-2,
    &__filter,
    &__chorus {
      grid-template-rows: 1fr 1fr;
      grid-template-columns: repeat(3, 1fr);

      column-gap: 0.1em;
    }
    &__filter {
      grid-template-columns: repeat(2, 1fr);
    }
    &__lfo-1,
    &__lfo-2 {
      min-width: 5em;
      .controller:nth-child(-n + 3) {
        align-self: baseline;
      }
    }

    &__filter {
      .controller:nth-child(-n + 2) {
        align-self: baseline;
      }
    }
    &__limiter {
      align-items: center;
    }

    &__distort,
    &__delay,
    &__reverb {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      align-items: flex-end;
      .controller {
        flex: 1 0 33%;
      }
    }
    &__distort {
      .controller:first-child {
        flex: 0 0 80%;
      }
    }

    &__mixer {
      grid-template-columns: 1fr;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      grid-auto-rows: auto;
      justify-items: center;
      align-items: stretch;
      column-gap: 0.5em;
    }

    &__master {
      grid-template-columns: 1fr auto;
    }
  }
  .toggle-fx {
    .checkbox__control {
      width: 2.5em;
      height: 2.5em;
      &::after {
        font-family: sans-serif;
        font-size: 1.5em;
        content: "FX";
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-weight: 900;
        color: #0008;
      }
    }
  }
  .toggle-scope {
    .checkbox__control {
      &::after {
        font-family: sans-serif;
        // font-size: 1.5em;
        content: "∿";
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-weight: 900;
        color: #0008;
      }
    }
  }
}

.bottom-panel {
  perspective: 600px;

  z-index: 1;
  &__wrapper {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    display: grid;
    grid-template: 1fr / 1fr 1fr / 1fr;
    transform: translateZ(-4.8em);
    transition: transform 1s ease-out;
    will-change: transform;
    &.show-kb {
      transform: translateZ(-4.8em) rotateY(0deg);
    }
    &.show-fx {
      transform: translateZ(-4.8em) rotateX(-90deg);
    }
    .row {
      background: #181b1c;
      border-bottom: 0.1em solid #000;
      transform: rotateY(0deg) translateZ(4.8em); // front
      &.effects {
        transform: rotateX(90deg) translateZ(4.8em); //top
      }
      grid-column: 1 / -1;
      grid-row: 1 / -1;
    }
  }
}
</style>
