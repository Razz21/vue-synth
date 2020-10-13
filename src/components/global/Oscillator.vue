<template>
  <div>
    <div class="synth-control">
      <label for="">
        <button @click="model.state == 'started' ? model.stop() : model.start()">start|stop</button>
      </label>
      <label for="">
        waveform
        <select @change="model.setSource({ type: $event.target.value })">
          <option value="sine" selected>sine</option>
          <option value="sawtooth">sawtooth</option>
          <option value="square">square</option>
        </select>
      </label>
      <label>
        retrigger
        <input
          type="checkbox"
          :checked="model.on"
          @change="model.setSource({ retrigger: $event.target.checked })"
        />
      </label>
      <RangeInput
        label="count"
        min="1"
        max="8"
        :value="model.source.count"
        @input="model.setSource({ count: $event })"
      />
      <RangeInput
        label="phase"
        max="360"
        :value="model.source.phase"
        @input="model.setSource({ phase: $event })"
      />
      <RangeInput
        label="spread"
        :value="model.source.spread"
        @input="model.setSource({ spread: $event })"
      />
      <RangeInput
        label="finetune"
        :value="model.source.finetune"
        min="-100"
        @input="model.setSource({ finetune: $event })"
      />
      <RangeInput
        label="seminote"
        min="-12"
        max="12"
        :value="model.source.seminote"
        @input="model.setSource({ seminote: $event })"
      />
      <RangeInput
        label="octave"
        min="-3"
        max="3"
        :value="model.source.octave"
        @input="model.setSource({ octave: $event })"
      />
      <RangeInput
        label="pan"
        min="-1"
        max="1"
        step="0.01"
        :value="model.pan"
        @input="model.set({ pan: $event })"
      />
      <RangeInput
        label="gain"
        max="1"
        step="0.01"
        :value="model.gain"
        @input="model.set({ gain: $event })"
      />
    </div>
  </div>
</template>

<script>
import { VCO, OscModule } from "@/Synth/Oscillators";
import * as Tone from "tone";
import WavePacket from "@/utils/WavePacket";
import { throttle } from "@/utils";
export default {
  props: {
    model: {
      type: OscModule,
      required: true
    }
  },
  mounted() {
    // console.log(this.model);
    // console.clear();
  }
};
</script>

<style lang="scss"></style>
