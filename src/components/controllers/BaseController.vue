<template functional>
  <div class="controller" :class="[`label-${props.labelPosition}`, data.staticClass, data.class]">
    <div class="controller__wrapper">
      <slot></slot>
    </div>
    <div class="controller__label" v-if="props.label">{{ props.label }}</div>
  </div>
</template>

<script>
export default {
  props: {
    label: { type: String },
    labelPosition: {
      type: String,
      default: "bottom",
      validator: v => ["top", "bottom", "left", "right"].includes(v)
    }
  },
  inheritAttrs: false
};
</script>

<style lang="scss">
.controller {
  font-size: 0.8em;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  margin: 0.1em;
  &__wrapper {
    width: 100%;
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    // add margin, if label exists
    &:not(:last-child) {
      // margin-bottom: 1em;
      margin-bottom: 0.2em;
    }
  }
  &__label {
    // position: absolute;
    bottom: 0;
    font-weight: 600;
    font-size: 0.7em;
    white-space: nowrap;
    text-align: center;
    text-transform: uppercase;
    user-select: none;
    color: #fff7;
    display: flex;
    justify-content: center;
  }
  &.label-right {
    flex-direction: row;
    .controller__wrapper:not(:last-child) {
      margin-right: 0.2em;
    }
  }
  &.label-left {
    flex-direction: row-reverse;
    .controller__wrapper:not(:last-child) {
      margin-left: 0.2em;
      margin-bottom: 0;
    }
  }
  &.label-top {
    flex-direction: column-reverse;
    .controller__wrapper:not(:last-child) {
      margin-top: 0.2em;
    }
  }
}
</style>
