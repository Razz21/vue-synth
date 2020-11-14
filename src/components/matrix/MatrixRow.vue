<template>
  <tr class="mod-matrix-row">
    <th scope="row">{{ idx + 1 }}.</th>
    <td>
      <select
        name="source"
        :value="row.value[0]"
        @change="[update($event.target.value, 0), $event.target.blur()]"
      >
        <option :value="item.id" v-for="item in sources" :key="item.id">{{ item.name }}</option>
      </select>
    </td>
    <td>
      <select
        name="destination"
        :value="row.value[1]"
        @change="[update($event.target.value, 1), $event.target.blur()]"
      >
        <option :value="item.id" v-for="item in destinations" :key="item.id">{{
          item.name
        }}</option>
      </select>
    </td>
    <td>
      <matrix-row-amount
        min="-1"
        max="1"
        step="0.01"
        snap
        :value="row.value[2]"
        @input="update($event, 2)"
        bipolar
      ></matrix-row-amount>
    </td>
  </tr>
</template>

<script>
import { MatrixRow } from "@/Synth/ModMatrix";
import MatrixRowAmount from "./MatrixRowAmount";

export default {
  components: { MatrixRowAmount },
  props: {
    row: {
      type: [Object],
      required: true
    },
    idx: Number,
    sources: {
      type: Array,
      default: () => []
    },
    destinations: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      row$: this.row
    };
  },
  methods: {
    update(newValue, idx) {
      const value = [...this.row.value];
      value[idx] = +newValue;
      this.$set(this.row, "value", value);
    }
  }
};
</script>

<style lang="scss">
.mod-matrix-row {
  color: inherit;
  text-align: center;
  border: 1px solid #0004;
  th {
    font-size: 0.9em;
  }
  td {
    height: 100%;

    &:focus,
    &:active {
      outline: none;
    }
  }

  select {
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
    text-align-last: center; //chrome fallback
    width: 100%;
    height: 100%;
    background: transparent;
    color: inherit;
    cursor: pointer;
    display: block;
    -webkit-appearance: none;
    appearance: none;
    border: none;
    &::-ms-expand {
      display: none;
    }
    &:focus,
    &:active {
      outline: none;
      background: #0003;
    }
    option:checked {
      background: red;
      color: green;
    }
  }
}
</style>
