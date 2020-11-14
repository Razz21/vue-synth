<template>
  <display-base>
    <div class="display-led" :style="{ '--size': size }">
      <div class="display-led__content">
        {{ text }}
      </div>
    </div>
  </display-base>
</template>

<script>
export default {
  props: {
    /*
    panel's width in characters
     */
    size: {
      type: [Number, String],
      default: 3,
      validator: v => Number.isInteger(+v) && v >= 1
    },
    text: {
      type: String,
      default: ""
    }
  },
  data() {
    return {};
  }
};
</script>

<style lang="scss">
.display-led {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 0.3em 0 0.1em;
  font-size: 1.5em;
  height: 1em;
  color: #ccc;
  text-shadow: 0 0 1px #999;
  font-family: "OpenSansPX", sans-serif;

  &__content {
    text-align: end;
    // overflow: hidden;
    width: calc(var(--size, 3) * 1ch);
  }
}
</style>
