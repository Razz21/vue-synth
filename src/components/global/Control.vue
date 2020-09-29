<template>
  <!-- PAGE STUFF -->
  <div @mouseUp="unselectKnobs">
    <div class="page-container">
      <div class="rela-block container">
        <!-- Effects -->
        <!-- <div
          v-for="effect in effects"
          class="rela-inline effect-container"
          @mouseDown="effect.selected = true"
          :key="'effect_' + effect.id"
        >
          <div class="rela-block effect-label">
            <div
              class="rela-inline effect-active-light"
              :style="{ 'background-color': effect.active ? effect.color : '#888' }"
              @click="effect.active = !effect.active"
            ></div>
            {{ effect.label }}
          </div>
          <div class="rela-block knob-container">
            <div
              v-for="knob in effect.knobs"
              :class="['rela-inline', 'knob', 'style' + effect.knobStyle]"
              :key="knob.label"
            >
              <div
                class="rela-block knob-dial"
                :style="{ color: effect.active ? effect.color : '#888' }"
              >
                <div
                  class="abs-center dial-grip"
                  :style="{ transform: 'translate(-50%,-50%) rotate(' + knob.rotation + 'deg)' }"
                  @mouseDown="
                    knob.selected = true;
                    currentY = event.pageY;
                    event.preventDefault();
                  "
                ></div>
                <svg class="dial-svg" viewBox="0 0 100 100">
                  <path d="M20,76 A 40 40 0 1 1 80 76" fill="none" stroke="#55595C" />
                  <path
                    d="M20,76 A 40 40 0 1 1 80 76"
                    fill="none"
                    :stroke="effect.active ? effect.color : '#888'"
                    :style="{ 'stroke-dashoffset': 184 - 184 * ((knob.rotation * 1 + 132) / 264) }"
                  />
                </svg>
              </div>
              <div
                class="rela-block knob-label"
                :style="{ color: effect.active ? '#E4E8EA' : '#888' }"
              >
                {{ knob.label }}
              </div>
            </div>
          </div>
        </div> -->
        <br />
        <!-- Knobs -->
        <!-- <div
          v-for="knob in knobs"
          :class="['rela-inline', 'knob', 'style' + knob.style]"
          :key="knob.id"
        >
          <div
            class="knob-active-light"
            :style="{ 'background-color': knob.active ? knob.color : '#888' }"
            @click="knob.active = !knob.active"
          ></div>
          <div class="rela-block knob-dial" :style="{ color: knob.active ? knob.color : '#888' }">
            <div
              class="abs-center dial-grip"
              :style="{ transform: 'translate(-50%,-50%) rotate(' + knob.rotation + 'deg)' }"
              @mouseDown="
                knob.selected = true;
                app.currentY = event.pageY;
                event.preventDefault();
              "
            ></div>
            <svg class="dial-svg" viewBox="0 0 100 100">
              <path d="M20,76 A 40 40 0 1 1 80 76" fill="none" stroke="#55595C" />
              <path
                d="M20,76 A 40 40 0 1 1 80 76"
                fill="none"
                :stroke="knob.active ? knob.color : '#888'"
                :style="{ 'stroke-dashoffset': 184 - 184 * ((knob.rotation * 1 + 132) / 264) }"
              />
            </svg>
          </div>
          <div class="rela-block knob-label" :style="{ color: knob.active ? '#E4E8EA' : '#888' }">
            {{ knob.label }}
          </div>
        </div> -->
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
      effects: [
        {
          id: 0,
          label: "Spread",
          knobs: [
            {
              label: "Amount",
              rotation: -132,
              selected: false
            },
            {
              label: "Space",
              rotation: -132,
              selected: false
            },
            {
              label: "High Pass",
              rotation: -132,
              selected: false
            }
          ],
          active: true,
          selected: false,
          color: "#23F376",
          knobStyle: 1
        },
        {
          id: 1,
          label: "Chorus",
          knobs: [
            {
              label: "Dry/Wet",
              rotation: -132,
              selected: false
            },
            {
              label: "Rate",
              rotation: -132,
              selected: false
            },
            {
              label: "Feedback",
              rotation: -132,
              selected: false
            }
          ],
          active: true,
          selected: false,
          color: "#ED31A2",
          knobStyle: 2
        },
        {
          id: 2,
          label: "Delay",
          knobs: [
            {
              label: "Dry/Wet",
              rotation: -132,
              selected: false
            },
            {
              label: "Time",
              rotation: -132,
              selected: false
            },
            {
              label: "Fine",
              rotation: -132,
              selected: false
            }
          ],
          active: true,
          selected: false,
          color: "#FA9C34",
          knobStyle: 3
        }
      ],
      knobs: [
        {
          id: 0,
          label: "Test Knob",
          rotation: -132,
          color: "#FA9C34",
          active: true,
          selected: false,
          style: 1
        },
        {
          id: 1,
          label: "Test Knob 2",
          rotation: -132,
          color: "#21CD92",
          active: true,
          selected: false,
          style: 1
        },
        {
          id: 2,
          label: "Test Knob 3",
          rotation: -132,
          color: "#ED31A2",
          active: true,
          selected: false,
          style: 3
        },
        {
          id: 3,
          label: "Test Knob 4",
          rotation: -132,
          color: "#FFFB43",
          active: true,
          selected: false,
          style: 3
        },
        {
          id: 4,
          label: "Test Knob 5",
          rotation: -132,
          color: "#23CDE8",
          active: true,
          selected: false,
          style: 2
        },
        {
          id: 5,
          label: "Test Knob 6",
          rotation: -132,
          color: "#E22",
          active: true,
          selected: false,
          style: 2
        }
      ],
      currentY: 0,
      mousemoveFunction: function(e) {
        var selectedEffect = app.effects.filter(function(i) {
          return i.selected === true;
        })[0];
        if (selectedEffect) {
          var selectedKnob = selectedEffect.knobs.filter(function(i) {
            return i.selected === true;
          })[0];
        } else {
          var selectedKnob = app.knobs.filter(function(i) {
            return i.selected === true;
          })[0];
        }
        if (selectedKnob) {
          // Knob Rotation
          if (e.pageY - app.currentY !== 0) {
            selectedKnob.rotation -= e.pageY - app.currentY;
          }
          app.currentY = e.pageY;

          // Setting Max rotation
          if (selectedKnob.rotation >= 132) {
            selectedKnob.rotation = 132;
          } else if (selectedKnob.rotation <= -132) {
            selectedKnob.rotation = -132;
          }

          // Knob method to update parameters based on the know rotation
          // selectedKnob.method(selectedKnob.rotation, selectedKnob.modifier);
        }
      },
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
  transition: 0.3s cubic-bezier(0.6, 0, 0.2, 1);
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
