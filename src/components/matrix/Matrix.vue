<template>
  <display-base class="mod-matrix" light>
    <table>
      <thead>
        <th scope="col"></th>
        <th scope="col">Source</th>
        <th scope="col">Destination</th>
        <th scope="col">Amt</th>
      </thead>
      <tbody>
        <matrix-row
          v-for="(row, idx) in modMatrix"
          :key="row.id"
          v-bind="{ row, idx, sources, destinations }"
        ></matrix-row>
      </tbody>
    </table>
    <slot></slot>
  </display-base>
</template>

<script>
import { SOURCES, DESTINATIONS } from "@/Synth/synthfunctions";
import MatrixRow from "./MatrixRow";
import DisplayBase from "@/components/display/DisplayBase";
export default {
  components: { MatrixRow, DisplayBase },
  props: {
    modMatrix: {
      type: [Array],
      required: true
    }
  },
  computed: {
    matrix() {
      if (this.modMatrix) {
        return this.modMatrix.getMatrixCore();
      }
    }
  },
  data() {
    return {
      sources: [
        { name: "---", id: SOURCES.SOURCE_NONE },
        { name: "LFO 1", id: SOURCES.LFO_1_OUT },
        { name: "LFO 2", id: SOURCES.LFO_2_OUT },
        { name: "AMP EG", id: SOURCES.AMP_EG_OUT },
        { name: "FILTER EG", id: SOURCES.EG_1_OUT }
      ],
      destinations: [
        { name: "---", id: DESTINATIONS.DEST_NONE },
        { name: "PITCH 1", id: DESTINATIONS.OSC_1_PITCH },
        { name: "PITCH 2", id: DESTINATIONS.OSC_2_PITCH },
        { name: "PITCH 12", id: DESTINATIONS.OSC_12_PITCH },
        { name: "VOLUME 1", id: DESTINATIONS.OSC_1_VOL },
        { name: "VOLUME 2", id: DESTINATIONS.OSC_2_VOL },
        { name: "VOLUME 3", id: DESTINATIONS.OSC_3_VOL },
        { name: "VOLUME 123", id: DESTINATIONS.OSC_123_VOL },
        { name: "PAN 1", id: DESTINATIONS.OSC_1_PAN },
        { name: "PAN 2", id: DESTINATIONS.OSC_2_PAN },
        { name: "PAN 3", id: DESTINATIONS.OSC_3_PAN },
        { name: "FILTER:CUTOFF", id: DESTINATIONS.FILTER_CUT }
      ]
    };
  }
};
</script>

<style lang="scss">
.mod-matrix {
  table {
    border-collapse: collapse;
    width: 18em;
    height: 100%;
    table-layout: fixed;
    text-align: center;
    margin: 0.1em;
    border-style: hidden;
  }

  thead,
  tbody {
    font-size: 0.6em;
    text-transform: uppercase;
    height: 100%;
  }
  thead th {
    padding: 0.3em;
    background-color: #cfd3d4;
    background-clip: padding-box;
    &:nth-child(2) {
      width: 31%;
    }
    &:nth-child(3) {
      width: 40%;
    }
    &:nth-child(4) {
      width: 20%;
    }
  }

  th,
  td {
    border: 1px solid #0004;
  }
}
</style>
