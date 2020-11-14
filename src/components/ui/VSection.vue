<template functional>
  <div class="section">
    <div class="section-label">
      <span class="label">
        {{ props.label }}
      </span>
      <slot name="label"></slot>
    </div>
    <div
      class="section-content"
      :id="
        'section__' +
          props.label
            .toLowerCase()
            .split(' ')
            .join('-')
      "
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: String
  }
};
</script>

<style lang="scss">
.section {
  width: 100%;
  // height: 100%;
  display: flex;
  + .section {
    margin-top: 1em;
  }
  flex-direction: column;

  &__wrapper {
    display: block;
  }
  &-label {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.15em;
    .label {
      font-family: "Orbitron", sans-serif;
      font-size: 0.95em;
      font-weight: 900;
      color: #fff;
      text-transform: uppercase;
      mix-blend-mode: overlay;
      white-space: nowrap;
      user-select: none;
    }
  }
  &-content {
    width: 100%;
    flex: 1;
    display: grid; // fit children height
    justify-items: center;
    align-items: flex-end;
  }
}
</style>
