<template>
  <div class="handle" style="width:100%" v-on="controlHandlers">
    {{ $_displayValue }}
  </div>
</template>

<script>
import { ControlMixin } from "@/mixins/Control";
export default {
  mixins: [ControlMixin],
  computed: {
    $_displayValue() {
      return (this.value * 100) | 0;
    }
  }
};
</script>

<style lang="scss"></style>
