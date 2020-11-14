<template>
  <base-controller v-bind="{ ...$props, ...$attrs }">
    <display-base>
      <div class="wave-picker" v-on="controlHandlers">
        <div class="wave-picker__wrapper">
          <div class="wave-picker__content">
            <svg viewBox="0 0 200 100" width="100%" height="100%" preserveAspectRatio="none">
              <path :d="waves[value]" />
            </svg>
          </div>
        </div>
      </div>
    </display-base>
  </base-controller>
</template>

<script>
import { ControlMixin } from "@/mixins/Control";
import DisplayBase from "@/components/display/DisplayBase";
import BaseController from "./BaseController";
export default {
  mixins: [ControlMixin],
  components: { DisplayBase, BaseController },
  props: {
    waves: {
      type: Array,
      default: () => [
        "m0,50 c40,-64 60,-64 100,0c40,64 60,64 100,0", //sine
        "M0 0 L 0,100 L 200,0 L 200,100", //saw
        "M0 50 L 50,0 L 150,100 L 200,50", //triangle
        "M0 100 L 0 0 L 100,0 L 100,100 L 200,100 L 200,0" // square
      ]
    }
  }
};
</script>

<style lang="scss">
.wave-picker {
  cursor: grab;
  user-select: all;
  position: relative;
  width: 2.6rem;
  height: 1.48rem;
  border-radius: 0.1em;
  &__wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    box-sizing: border-box;
    border-radius: 3px;
    > div {
      height: 100%;
    }
  }
  &__content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 0.1em;
  }
  .arrows {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height: 100%;
    width: 12px;
    font-size: 0.5em;
    line-height: 0.5em;

    &::before,
    &::after {
      color: rgba($primary-control, 0.267);
      display: block;
      content: "";
      width: 0;
      height: 0;
      border-left: 3px solid transparent;
      border-right: 3px solid transparent;
      border-bottom: 8px solid currentColor;
    }

    &::after {
      border-bottom: 0;
      border-top: 8px solid currentColor;
    }
  }

  &:active {
    -webkit-user-select: none;
    cursor: n-resize;
    cursor: grabbing;
  }

  svg {
    overflow: visible;
    padding: 0.5em 0.25em;
    padding: 0.25em;
    path {
      stroke: $primary-control;
      stroke-width: 10;
      fill: none;
      filter: drop-shadow(0px 0px 5px $primary-control);
    }
  }
  .divider {
    height: 85% !important;
    margin: auto 0;
    width: 2px;
    border-radius: 2px;
    box-shadow: inset 0 0 1px 1px #0007, inset -1px -1px 1px #444a;
  }
}
</style>
