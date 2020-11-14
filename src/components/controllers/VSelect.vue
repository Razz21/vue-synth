<template>
  <base-controller v-bind="{ ...$props, ...$attrs }">
    <div class="select">
      <select :value="value" @change="onChange">
        <option :value="idx" v-for="(item, idx) in items" :key="item">{{
          item | uppercase
        }}</option>
      </select>
    </div>
  </base-controller>
</template>

<script>
import BaseController from "./BaseController";
export default {
  components: { BaseController },
  name: "VSelect",
  props: {
    id: {
      type: [String, Number]
      // required: true
    },
    value: {
      type: [Number, String],
      validator: v => Number.isInteger(+v) && +v >= 0
    },
    label: String,
    items: {
      type: Array,
      default: () => []
    }
  },
  filters: {
    uppercase: val => val.toUpperCase()
  },
  methods: {
    onChange(e) {
      e.target.blur();
      this.$emit("input", +e.target.value);
    }
  }
};
</script>

<style lang="scss" scoped>
.select {
  cursor: pointer;
  color: #fff;
  background: #050505;
  width: 100%;
  height: 1.5em;
  text-align: center;
  max-width: 20ch;
  border-radius: 0.3em;
  box-shadow: 0 0 0.03em 0.1em #000, inset 0.1em 0.1em 0.1em -0.05em #fff3;
}
select {
  color: inherit;
  cursor: inherit;
  text-transform: uppercase;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  text-align-last: center;
  width: 100%;
  height: 100%;
  background: transparent;

  display: block;
  -webkit-appearance: none;
  appearance: none;
  border: none;
  option {
    color: initial;
    font-size: 0.9em;
    width: 100%;
  }

  &::-ms-expand {
    display: none;
  }
  &:focus,
  &:active {
    outline: none;
  }
}
</style>
