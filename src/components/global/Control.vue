<template>
  <!-- PAGE STUFF -->
  <div>
    <div class="page-container">
      <div class="rela-block container">
        <knob :knob="knobData" v-model="value"></knob>
        <p>{{ value.toFixed(1) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      knobData: {
        id: 0,
        label: "Test Knob",
        rotation: 0,
        color: "#FA9C34",
        active: true,
        selected: false,
        style: 1
      },
      options: [{ label: "one" }, { label: "two" }, { label: "three" }, { label: "four" }],
      value: 10
    };
  },
  methods: {
    unselectKnobs: function() {
      for (var i in this.knobs) {
        this.knobs[i].selected = false;
      }
      for (var i in this.effects) {
        for (var j in this.effects[i].knobs) {
          this.effects[i].knobs[j].selected = false;
        }
        this.effects[i].selected = false;
      }
    }
  }
};
</script>

<style lang="scss">
* {
  // transition: 0.3s cubic-bezier(0.6, 0, 0.2, 1);
}
.abs-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.vert-center {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.horz-center {
  position: absolute;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}

.left {
  position: relative;
  float: left;
}
.right {
  position: relative;
  float: right;
}

.container {
  margin: 20px auto;
  max-width: 700px;
  text-align: center;
}
.effect-container {
  width: 140px;
  border-radius: 3px;
  text-align: center;
  margin: 0 10px 20px;
  background-color: #2c2d2f;
  .knob {
    padding: 0;
    margin: 0 0 10px;
  }
}
.effect-container.wide {
  width: auto;
}
.effect-label {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  padding: 10px 0 10px 10px;
  border-bottom: 4px solid #181b1c;
}
.effect-active-light {
  position: absolute;
  top: 50%;
  left: 10px;

  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  height: 10px;
  width: 10px;
  border-radius: 100%;
}
.knob-container {
  padding: 10px 0;
}
</style>
