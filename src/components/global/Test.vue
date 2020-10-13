<template>
  <div class="test" v-on="controlHandlers">
    <p>val:{{ value }}</p>
    <p>position:{{ position$ }}</p>
    <p>snap:{{ snap }}</p>
  </div>
</template>

<script>
import { ControlBase } from "@/mixins/Control";
export default {
  mixins: [ControlBase],
  data() {
    return {};
  }
};
</script>

<style lang="scss" scoped>
.test {
  width: 100px;
  height: 100px;
  background: red;
  cursor: grab;
  user-select: all;
  position: relative;
  &:active {
    background: blue;
    -webkit-user-select: none;
    cursor: n-resize;
    cursor: grabbing;
  }
}
</style>
