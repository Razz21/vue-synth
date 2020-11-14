<template>
  <base-controller v-bind="{ ...$props, ...$attrs }">
    <display-base>
      <div class="display-led handle" :style="{ '--size': size }" v-on="controlHandlers">
        <div class="display-led__content">
          {{ displayValue }}
        </div>
      </div>
    </display-base>
  </base-controller>
</template>

<script>
import { ControlMixin } from "@/mixins/Control";
import LedDisplayVue from "@/components/display/LedDisplay";
import DisplayBase from "@/components/display/DisplayBase";
import BaseController from "./BaseController";
export default {
  mixins: [ControlMixin],
  props: { items: Array },
  components: { DisplayBase, BaseController },
  computed: {
    displayValue() {
      if (this.items && this.items.length) {
        return this.items[this.value];
      }
      return this.$_valueToDisplay(this.value);
    }
  },
  extends: LedDisplayVue
};
</script>

<style lang="scss"></style>
