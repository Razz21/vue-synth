<template>
  <div>
    <EnvStage
      :min="DEFAULTS[stage].min"
      :max="DEFAULTS[stage].max"
      :stage="stage"
      :value="val"
      @input="update(stage, $event)"
      v-for="(val, stage) in value"
      :key="stage"
      log
    />
  </div>
</template>

<script>
const DEFAULTS = {
  attack: { min: 0, max: 2 },
  decay: { min: 0, max: 2 },
  sustain: { min: 0, max: 1 },
  release: { min: 0, max: 5 }
};
import Log from "@/utils/Log";
import Linear from "@/utils/Linear";
import { scale } from "@/utils";
export default {
  props: ["value"],
  data() {
    return {
      DEFAULTS: DEFAULTS
    };
  },
  computed: {},
  components: {
    EnvStage: {
      functional: true,
      render(h, { props, listeners }) {
        // runtime variables
        const steps = 200;
        let position, RangeHandler;
        if (props.log) {
          RangeHandler = new Log({
            minpos: 0,
            maxpos: steps,
            minval: props.min,
            maxval: props.max
          });
        } else {
          RangeHandler = new Linear({
            minpos: 0,
            maxpos: steps,
            minval: props.min,
            maxval: props.max
          });
        }

        position = RangeHandler.position(props.value);

        function inputHandler(event) {
          const value = RangeHandler.value(event.target.value).toFixed(3);
          listeners.input(value, props.stage);
        }

        return h("label", { style: { display: "block" } }, [
          props.stage,
          h("input", {
            attrs: {
              type: "range",
              min: 0,
              max: steps,
              steps: steps,
              value: position
            },
            on: {
              input: inputHandler
            }
          })
        ]);
      },
      props: {
        min: [Number, String],
        max: [Number, String],
        value: [Number, String],
        stage: String,
        log: Boolean
      }
    }
  },
  methods: {
    update(key, value) {
      // console.log("update", value);
      this.$emit("input", { ...this.value, [key]: value });
    }
  },
  mounted() {
    // console.clear();
  }
};
</script>

<style lang="scss"></style>
