<template>
  <div>
    <canvas id="analyser" style="width: 80px; height:50px; background-color: #eee;"></canvas>
    <p>
      <input type="range" v-model="threshold" min="-128" max="128" step="1" />
      {{ threshold }}
    </p>

    <div class="synth-control">
      <label for="">
        <button @click="osc.state == 'started' ? osc.stop() : osc.start()">start|stop</button>
      </label>
      <label for="">
        waveform
        <select @change="osc.setOsc({ type: $event.target.value })" v-model="type">
          <option value="sine" selected>sine</option>
          <option value="sawtooth">sawtooth</option>
          <option value="square">square</option>
        </select>
      </label>
      <RangeInput
        label="count"
        min="1"
        max="8"
        :value="count"
        @input="
          count = $event;
          osc.setOsc({ count: $event });
        "
      />
      <RangeInput
        label="phase"
        max="360"
        :value="phase"
        @input="
          phase = $event;
          osc.setOsc({ phase: $event });
        "
      />
      <RangeInput
        label="spread"
        :value="spread"
        @input="
          spread = $event;
          osc.setOsc({ spread: $event });
        "
      />
      <RangeInput
        label="finetune"
        :value="finetune"
        min="-100"
        @input="
          finetune = $event;
          osc.setOsc({ finetune: $event });
        "
      />
      <RangeInput
        label="seminote"
        min="-12"
        max="12"
        :value="seminote"
        @input="
          seminote = $event;
          osc.setOsc({ seminote: $event });
        "
      />
      <RangeInput
        label="octave"
        min="-3"
        max="3"
        :value="octave"
        @input="
          octave = $event;
          osc.setOsc({ octave: $event });
        "
      />
      <!--  <RangeInput
      label="stereo"
      max="1"
      step="0.01"
      :value="stereo"
      @input="
        stereo = $event;
        osc.stereoOsc($event);
      "
    />-->
      <RangeInput
        label="pan"
        min="-1"
        max="1"
        step="0.01"
        :value="pan"
        @input="
          pan = $event;
          osc.set({ pan: $event });
        "
      />
      <RangeInput
        label="gain"
        max="1"
        step="0.01"
        :value="gain"
        @input="
          gain = $event;
          osc.set({ gain: $event });
        "
      />
    </div>
  </div>
</template>

<script>
import { VCO, OscModule, CustomFatOscillator } from "@/Synth/Oscillators";
import * as Tone from "tone";
import WavePacket from "@/utils/WavePacket";
import { throttle } from "@/utils";
export default {
  data() {
    return {
      osc: null,
      type: "sawtooth",
      count: 1, // num of osc's
      phase: 0,
      spread: 20, // detune between osc's
      // -----
      on: true,
      finetune: 0,
      seminote: 0,
      octave: 0,
      stereo: 0, // stereo spread
      // ----- mixer
      pan: 0,
      gain: 0.2,
      sample: 0,
      threshold: 0
    };
  },
  methods: {
    getOsc() {
      const osc = new VCO({
        frequency: "C4",
        type: this.type,
        count: this.count,
        phase: this.phase,
        spread: this.spread,
        finetune: this.finetune,
        seminote: this.seminote,
        octave: this.octave,
        stereo: this.stereo,
        pan: this.pan,
        gain: this.gain
      });

      return osc.toDestination();
      // return osc;
    }
  },
  mounted() {
    console.clear();
    if (this.osc) {
      this.osc.dispose();
      this.osc = null;
    }
    // this.osc = this.getOsc();

    const osc = new OscModule({
      oscillator: {
        frequency: "G3",
        type: "sawtooth",
        count: this.count,
        phase: this.phase,
        spread: this.spread,
        finetune: this.finetune,
        seminote: this.seminote,
        octave: this.octave,
        stereo: this.stereo,
        retrigger: true
      },
      pan: this.pan,
      gain: this.gain
    });
    this.osc = osc.toDestination();

    /*
      ==========================================================
    */
    const bufferSize = 2048;
    const waveform = new Tone.Waveform(bufferSize);
    // this.osc.connect(waveform);
    // this.osc.fan(waveform);
    // this.osc.start();

    const o = new VCO({
      frequency: "A2",
      type: "sawtooth",
      spread: 0,
      retrigger: true
    });
    o.count = 3;
    o.phase = 0;
    o.spread = 0;
    // o.toDestination();
    o.start();
    const gain = new Tone.Gain(0.1).toDestination();
    o.fan(gain, waveform); // connect in parallel;
    console.log(o.frequency.getValueAtTime());
    // o.connect(waveform);

    /* ========= analyser ========== */
    let canvasWidth, canvasHeight, wp;

    const waveCanvas = document.getElementById("analyser");
    const ctx = waveCanvas.getContext("2d");

    //the waveform data
    const drawWaveform = values => {
      wp.loadData(values);
      // wp.printInfo();
      wp.searchThresholdCrossing();
      wp.shiftWaveBasedOnThreshold();
      //This next enables drawing only of those signals above the threshold
      if (!wp.thresholdFound()) {
        return;
      }
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.lineJoin = "round";
      ctx.lineWidth = 3;
      //draw the waveform
      wp.display(ctx);
      wp.drawThreshold(ctx);
    };

    const drawScope = values => {
      var scaling = canvasHeight / 2;
      var risingEdge = 0;
      var threshold = 0;
      values = WavePacket.downsample(values, 128);
      // console.log(values);

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.fillStyle = "rgb(3, 18, 3)";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgb(0, 200, 0)";
      ctx.shadowBlur = 3;
      ctx.shadowColor = "rgb(0, 255, 0)";

      ctx.beginPath();

      while (values[risingEdge++] > threshold && risingEdge <= canvasWidth);
      if (risingEdge >= canvasWidth) risingEdge = 0;

      while (values[risingEdge++] <= threshold && risingEdge <= canvasWidth);
      if (risingEdge >= canvasWidth) risingEdge = 0;

      for (var x = risingEdge; x < values.length && x - risingEdge < canvasWidth; x++)
        ctx.lineTo(x - risingEdge, scaling - values[x] * scaling);

      ctx.stroke();
    };

    //size the canvases
    function setup() {
      canvasWidth = waveCanvas.offsetWidth;
      canvasHeight = waveCanvas.offsetHeight;
      ctx.canvas.width = canvasWidth;
      ctx.canvas.height = canvasHeight;
      wp = new WavePacket(bufferSize, canvasHeight, canvasWidth);
      // console.log(wp);
    }

    const cb = throttle(val => drawWaveform(val), 100);
    const loop = () => {
      //get the waveform valeus and draw it
      var waveformValues = waveform.getValue();
      // drawWaveform(waveformValues);
      drawScope(waveformValues);
      // cb(waveformValues);
      requestAnimationFrame(loop);
    };

    setup();
    loop();
  }
};
</script>

<style lang="scss">
.asd {
  color: rgb(3, 18, 3);
}
</style>
