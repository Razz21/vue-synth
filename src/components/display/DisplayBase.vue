<template functional>
  <div
    class="display"
    v-bind="data.attrs"
    :class="[data.staticClass, data.class, props.light ? 'light' : '']"
  >
    <div class="display__wrapper">
      <div class="display__content"><slot></slot></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    light: Boolean
  }
};
</script>

<style lang="scss">
.display {
  box-shadow: inset 1px 1px 3px 1px #0007, inset -2px -2px 5px 1px #ccc2;
  display: inline-block;
  padding: 4px;
  border-radius: 2px;
  overflow: hidden;
  box-sizing: content-box;

  &__wrapper {
    height: inherit;
    border-radius: 1px;
    background-color: #121212;
    box-shadow: inset 0px 0px 1px 1px #0007;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }
  &__content {
    overflow: hidden;
  }
  &.light {
    box-shadow: inset 2px 2px 4px 2px #0007, inset -2px -2px 5px 2px #ccc2;
    box-shadow: inset 2px 2px 3px 2px #000, inset -2px -2px 5px 2px #ccc2, -1px -1px 2px 2px #000a,
      1px 1px 2px 2px #aaa2;
    padding: 1px;
    .display__wrapper {
      background-color: #e5e9ec;
      color: #414446;
      box-shadow: inset 0 0 2px 1px #000;
    }
  }
}
</style>
