<template>
  <base-controller v-bind="{ ...$props, ...$attrs }" class="flex-1">
    <div class="fader" @wheel="$_handleMouseWheel">
      <div class="fader-track" ref="track">
        <div class="fader-thumb" :style="{ '--moveY': position$ }">
          <div class="fader-thumb-handle handle" v-on="controlHandlers"></div>
        </div>
      </div>
      <svg
        viewBox="0 0 40 100"
        width="40"
        height="100"
        preserveAspectRatio="none"
        shape-rendering="geometricPrecision"
      >
        <path :d="svgticks"></path>
      </svg>
    </div>
  </base-controller>
</template>

<script>
import { scale } from "@/utils";
import { ControlMixin } from "@/mixins/Control";
import BaseController from "./BaseController";
export default {
  mixins: [ControlMixin],
  components: { BaseController },
  computed: {
    faderTicks() {
      const viewBoxHeight = 100;
      return this.ticks.map(t => {
        return { pos: this.valueToPosition(t) * viewBoxHeight, value: -t };
      });
    },
    svgticks() {
      const steps = 12,
        length = 13,
        width = ` h${length} `;
      let path = "";

      for (let i = 0; i < steps; i++) {
        path += "M" + 0 + " " + (i / (steps - 1)) * 100 + width; // left tick
        path += "M" + 27 + " " + (i / (steps - 1)) * 100 + width; // right tick
      }
      return path;
    }
  }
};
</script>

<style lang="scss">
.fader {
  width: 100%;
  min-height: 5em;
  width: 2em;
  // height: 100%;
  position: relative;
  margin: 0.5em 0;
  align-self: stretch;
  &-track {
    z-index: 1;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0.25rem;
    background-color: #000;
    border-width: 1px;
    border-style: solid;
    border-image: linear-gradient(to bottom, #121212, #252525) 1;
  }
  &-scale {
    display: inline-block;
    width: 100%;
    &__tick {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0.5;
      width: 35%;
      &::before,
      &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 30%;
        height: 1px;
        display: block;
        background-color: #c8c8c8;
      }
      &::after {
        left: auto;
        right: 0;
      }
      span {
        position: absolute;
        right: -2em;
        line-height: 0;
        font-size: 0.52em;
        // letter-spacing: 0.01em;
        color: #fff;
        font-weight: 600;
      }
    }
  }
  &-thumb {
    position: absolute;
    top: 100%;
    height: 100%;
    width: 2rem;
    left: 50%;
    transform: translate(-50%, calc(var(--moveY, 0) * -100%));
    pointer-events: none;

    &-handle {
      pointer-events: auto;
      height: 25%;
      height: 1.75em;
      width: 60%;
      // left: 50%;
      margin: 0 auto;
      display: block;
      transform: translateY(-50%) translateY(-1px);
      box-shadow: 0 0.25rem 0.5rem 0 rgba(0, 0, 0, 0.5), 0 0 1px 1px #171717;

      background: linear-gradient(
          0deg,
          transparent 15%,
          #222 16%,
          transparent 18%,
          transparent 25%,
          #111 26%,
          transparent 28%,
          transparent 35%,
          #111 36%,
          transparent 38%,
          transparent 45%,
          #111 46%,
          transparent 48%,
          transparent 55%,
          #111 56%,
          transparent 58%,
          transparent 65%,
          #111 66%,
          transparent 68%,
          transparent 75%,
          #111 76%,
          transparent 78%
        ),
        linear-gradient(
          180deg,
          #222 0%,
          #444 10%,
          #151515 15%,
          #151515 20%,
          #151515 50%,
          #222 70%,
          #353535 85%,
          #131313 90%
        );
      &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 2px;
        background-color: #c1c1c1;
        margin-top: -1px;
        box-shadow: inset 1px 1px 1px #888;
      }
    }
  }

  svg {
    position: absolute;
    pointer-events: none;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    padding: 2px 0;
    path {
      stroke: #fff3;
      stroke-width: 1;
    }
  }
}
</style>
