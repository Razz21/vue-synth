<template>
  <div class="main-screen">
    <button class="prev" @click="model.prevPreset()">
      <span>&#128710;</span>
    </button>
    <display-base light>
      <div class="main-screen__content">
        <select id="presets" :value="model.current" v-show="!control" @change="onPresetChange">
          <option :value="preset.id" v-for="preset in model._presets" :key="preset.id">{{
            preset.name
          }}</option>
        </select>
        <div class="main-screen__overlay" v-show="control">{{ control }}</div>
      </div>
    </display-base>
    <button class="next" @click="model.nextPreset()">
      <span>&#128710;</span>
    </button>
  </div>
</template>

<script>
import { debounce, throttle } from "@/utils";
import DisplayBase from "@/components/display/DisplayBase";
export default {
  components: { DisplayBase },
  props: {
    model: { type: Object, required: true }
  },
  computed: {
    displayContent() {
      if (this.control) {
        return this.control;
      }
      return this.model.currentPreset.name;
    }
  },
  data() {
    return {
      control: null
    };
  },
  methods: {
    onPresetChange(e) {
      e.target.blur();
      this.model.changePreset(+e.target.value);
    }
  },
  mounted() {
    const debouncedHide = debounce(() => (this.control = null), 1000); //hide after 1 sec
    const controlDataHandler = e => {
      this.control = e;
      debouncedHide();
    };
    // allow signals in given intervals - useful when changing preset where all controls send events in parallel
    const throttledHandler = throttle(controlDataHandler, 50);
    this.$bus.$on("control:change", throttledHandler);
    this.$once("hook:beforeDestroy", () => this.$bus.$off("control:change", throttledHandler));
  }
};
</script>

<style lang="scss">
.main-screen {
  display: flex;
  align-items: center;
  &__content {
    color: #414446;
    font-weight: 500;
    width: 20ch;
    text-align: center;
    font-size: 0.75em;
    padding: 0.4em 0.2em;
    overflow: hidden;
    height: 2em;
    select {
      color: inherit;
      font-weight: inherit;
      font-size: inherit;
      text-align: inherit;
      option {
        font-size: 0.8em;
        font-weight: 400;
      }
    }
  }
  &__overlay {
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    font-size: 1.2em;
    line-height: 1.7;
  }

  .display {
    flex: 1;
    margin: 0 0.5em;
  }
  button {
    cursor: pointer;
    background: #111;
    color: #fff;
    border: none;
    border-radius: 20%;
    width: 1.7em;
    height: 2em;
    display: inline-flex;
    margin: 0.5em 0;
    justify-content: center;
    box-shadow: 0 0 0.1em #000, inset 0 0 0 0.1em #000;
    transform-origin: center;
    span {
      text-shadow: 0 0 1px currentColor;
      font-size: 1em;
      line-height: 2;
    }
    &:focus,
    &:active {
      outline: none;
    }
    &:active {
      box-shadow: 0 0 0.05em #000, inset 0 0 0.1em 0.1em #000;
      transform: scale(0.95);
    }
    &.next span {
      transform: rotate(90deg);
    }
    &.prev span {
      transform: rotate(-90deg);
    }
  }
  .triangle {
    margin: auto;
    display: inline-block;
    position: relative;
    background-color: #111;
    text-align: left;
    transform: rotate(-60deg) skewX(-30deg) scale(1, 0.866);

    &:before,
    &:after {
      content: "";
      position: absolute;
      background-color: inherit;
    }
    &,
    &:before,
    &:after {
      width: 1em;
      height: 1em;
      border-top-right-radius: 30%;
    }

    &:before {
      transform: rotate(-135deg) skewX(-45deg) scale(1.414, 0.707) translate(0, -50%);
    }
    &:after {
      transform: rotate(135deg) skewY(-45deg) scale(0.707, 1.414) translate(50%);
    }
  }
}
</style>
