<template>
  <div style="height:100px">
    <div class="keyboard" :style="{ '--height': 100 }">
      <ul
        class="keyboard__wrapper"
        @mousedown="mouseDown = true"
        @mouseup="mouseDown = false"
        @mouseleave="mouseDown = false"
      >
        <li
          v-for="key in keyNotes"
          class="key"
          :class="[...key.style, key.active ? 'active' : '']"
          :key="key.note"
          :data-note="key.note"
          :data-midi="key.midi"
          @mousedown="handleMouseDown(key)"
          @mouseup="handleMouseUp(key)"
          @mouseout="handleMouseOut(key)"
          @mouseover="handleMouseOver(key)"
        ></li>
      </ul>
    </div>
  </div>
</template>

<script>
const MIN_OCTAVE = -1,
  MAX_OCTAVE = 9,
  WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"],
  BLACK_KEYS = ["C#", "D#", "F#", "G#", "A#"],
  OCTAVE_KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  MIN_MIDI = 0,
  MAX_MIDI = 127,
  MIDDLE_C_MIDI = 60,
  KEYBOARD = {
    // Lower octave.
    a: 0,
    w: 1,
    s: 2,
    e: 3,
    d: 4,
    f: 5,
    t: 6,
    g: 7,
    y: 8,
    h: 9,
    u: 10,
    j: 11,
    // Upper octave.
    k: 12,
    o: 13,
    l: 14,
    p: 15,
    ";": 16
  };

function calculateOctave(val) {
  return Math.floor(val / 12) - 1; // 1 octaves offset
}

function createRange(minMIDI, maxMIDI) {
  minMIDI = clamp(minMIDI, MIN_MIDI, MAX_MIDI);
  maxMIDI = clamp(maxMIDI, MIN_MIDI, MAX_MIDI);

  const notes = [];
  for (let i = minMIDI; i < maxMIDI + 1; i++) {
    const octave = calculateOctave(i);
    const key = OCTAVE_KEYS[i % 12];
    const note = `${key}${octave}`;
    const style = ["key", `${BLACK_KEYS.includes(key) ? "key-black" : "key-white"}`];
    const midi = i;
    const keyNote = { note, style, midi };
    notes.push(keyNote);
  }
  return notes;
}

import { clamp } from "@/utils";
import { Frequency } from "tone";

export default {
  props: {
    MIN_KB_MIDI: {
      type: [Number, String],
      default: 48
    },
    MAX_KB_MIDI: {
      type: [Number, String],
      default: 85
    }
  },
  data() {
    return {
      octave: MIDDLE_C_MIDI / 12, //current octave
      keys: {},
      mouseDown: false,
      keyNotes: []
    };
  },
  methods: {
    inKbRange(midi) {
      // check, if midi signal match virtual piano keyboard range  <min, max);
      return midi >= this.MIN_KB_MIDI && midi < this.MAX_KB_MIDI;
    },
    playNote(note) {
      this.$emit("onKeyDown", note);
    },
    releaseNote(note) {
      this.$emit("onKeyUp", note);
    },
    handleMouseUp(key) {
      if (this.mouseDown) {
        this.$set(key, "active", false);
        this.releaseNote(key.midi);
      }
    },
    handleMouseDown(key) {
      this.$set(key, "active", true);
      this.playNote(key.midi);
    },
    handleMouseOver(key) {
      if (this.mouseDown) {
        this.$set(key, "active", true);
        this.playNote(key.midi);
      }
    },
    handleMouseOut(key) {
      if (this.mouseDown) {
        this.$set(key, "active", false);
        this.releaseNote(key.midi);
      }
    },
    setActiveKey(midi) {},
    onKeyDown() {
      let listener;
      document.removeEventListener("keydown", listener);
      listener = event => {
        const { key } = event;
        // Only trigger once per keydown event.
        const note = KEYBOARD[key];

        if (!this.keys[key] && note !== undefined) {
          this.keys[key] = true;
          const midi = note + this.midiOffset;
          if (this.inKbRange(midi)) {
            const val = midi - this.MIN_KB_MIDI; // relative position on kb
            this.$set(this.keyNotes[val], "active", true);
          }
          this.playNote(midi);
        }
      };
      document.addEventListener("keydown", listener);
    },
    onKeyUp() {
      let listener;

      document.removeEventListener("keyup", listener);

      listener = event => {
        const { key } = event;
        const note = KEYBOARD[key];
        if (this.keys[key] && note !== undefined) {
          this.keys[key] = false;
          const midi = note + this.midiOffset;
          if (this.inKbRange(midi)) {
            const val = midi - this.MIN_KB_MIDI; //
            this.$set(this.keyNotes[val], "active", false);
          }
          this.releaseNote(midi);
        }
      };
      document.addEventListener("keyup", listener);
    }
  },
  mounted() {
    this.keyNotes = this._keys.slice(this.MIN_KB_MIDI, this.MAX_KB_MIDI);
    this.onKeyDown();
    this.onKeyUp();
    // Octave controls.
    document.addEventListener("keydown", event => {
      // Decrease octave range (min: 0).
      if (event.key === "z") {
        this.octave = Math.max(this.octave - 1, MIN_OCTAVE);
      }
      // Increase octave range (max: 10).
      if (event.key === "x") {
        this.octave = Math.min(this.octave + 1, MAX_OCTAVE);
      }
    });
  },
  computed: {
    _keys() {
      return createRange(MIN_MIDI, MAX_MIDI);
    },
    midiOffset() {
      return this.octave * 12;
    },
    kbRange() {
      const whiteKeys = this._keys.slice(this.MIN_KB_MIDI, this.MAX_KB_MIDI);
      const filtered = whiteKeys.filter(({ style }) => style.includes("key-white"));
      return filtered.length;
    }
  }
};
</script>

<style lang="scss">
.keyboard {
  height: 100%;
  &__wrapper {
    --white-width: calc(calc(var(--height, 100) / 4) * 1px);
    // --white-width: 10%;
    --black--width: calc(var(--white-width) * 0.6);
    // width: 100%;
    height: 100%;
    display: flex;
  }

  .key {
    flex: 0 0 auto;
    position: relative;
    margin-left: calc(var(--black--width) / -2);
    &:nth-child(12n + 2),
    &:nth-child(12n + 7) {
      left: calc(var(--white-width) / -10);
    }
    &:nth-child(12n + 4),
    &:nth-child(12n + 11) {
      left: calc(var(--white-width) / 10);
    }

    &::before {
      content: "";
      display: block;
      position: absolute;
      width: inherit;
      bottom: 100%;
      height: 5px;
      left: 50%;
      transform: translate(-50%, 5px);
      z-index: 3;
    }
    &::after {
      content: "";
      display: block;
      position: absolute;
      bottom: 100%;
      width: 110%;
      height: 8px;
      left: -1px;
      top: -1px;
      background-color: #000;
      z-index: 1;
    }
    &.active::before {
      background: #00bdb4;
      box-shadow: 0px 0px 1px 1px #000 inset, 0px 0px 0px 1px #000, 0px 1px 5px 0px #111;
    }
    &.key-white {
      width: var(--white-width);
      height: 100%;
      z-index: 1;
      border-left: 1px solid #bbb;
      border-bottom: 1px solid #bbb;
      border-radius: 0 0 5px 5px;
      box-shadow: -1px 0 0 rgba(255, 255, 255, 0.8) inset, 0 0 5px #ccc inset,
        0 0 3px rgba(0, 0, 0, 0.2);
      background: linear-gradient(to bottom, #eee 0%, #fff 100%);
      &.active {
        border-top: 1px solid #777;
        border-left: 1px solid #999;
        border-bottom: 1px solid #999;
        box-shadow: 2px 0 3px rgba(0, 0, 0, 0.1) inset, -5px 5px 20px rgba(0, 0, 0, 0.3) inset,
          0 0 3px rgba(0, 0, 0, 0.5);
        background: linear-gradient(to bottom, #fff 0%, #bfbfbf 100%);
      }

      + .key-white {
        // halftone white keys
        margin: 0;
      }
    }
    &.key-black {
      z-index: 2;
      width: var(--black--width);
      height: 60%;
      border-left: 1px solid #000;
      border-right: 1px solid #000;
      border-bottom: 1px solid #000;
      border-radius: 0 0 3px 3px;
      box-shadow: -1px -1px 2px rgba(255, 255, 255, 0.2) inset,
        0 -5px 2px 3px rgba(0, 0, 0, 0.6) inset, 0 2px 4px rgba(0, 0, 0, 0.5);
      background: linear-gradient(45deg, #222 0%, #555 100%);
      &.active {
        box-shadow: -1px -1px 2px rgba(255, 255, 255, 0.2) inset,
          0 -2px 2px 3px rgba(0, 0, 0, 0.6) inset, 0 1px 2px rgba(0, 0, 0, 0.5);
        background: linear-gradient(180deg, #444 0%, #222 100%);
      }
    }
  }
}
</style>
