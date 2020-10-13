<template functional>
  <label>
    <p>{{ props.label }} - ({{ props.value }})</p>
    <input
      type="range"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      :value="props.value"
      v-on:input="listeners.input($event.target.value)"
    />
  </label>
</template>

<script>
export default {
  props: {
    value: null,
    min: { type: [String, Number], default: 0 },
    max: { type: [String, Number], default: 100 },
    step: { type: [String, Number], default: 1 },
    label: String
  },
  data() {
    return {};
  }
};
</script>

<style lang="scss"></style>
