<template>
  <div class="keyboard__wrapper">
    <ul
      class="keyboard"
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
      >
        {{ key.active ? "T" : "F" }}
      </li>
    </ul>
    {{ mouseDown }}
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
  KEYBOARD = {
    // Lower octave.
    a: "Cl",
    w: "C#l",
    s: "Dl",
    e: "D#l",
    d: "El",
    f: "Fl",
    t: "F#l",
    g: "Gl",
    y: "G#l",
    h: "Al",
    u: "A#l",
    j: "Bl",
    // Upper octave.
    k: "Cu",
    o: "C#u",
    l: "Du",
    p: "D#u",
    ";": "Eu",
    "'": "Fu",
    "]": "F#u",
    "\\": "Gu"
  };

function clampMIDI(val) {
  return clamp(val, MIN_MIDI, MAX_MIDI);
}

function calculateOctave(val) {
  return Math.floor(val / 12) - 1; // 1 octaves offset
}

function createRange(minMIDI, maxMIDI) {
  minMIDI = clampMIDI(minMIDI);
  maxMIDI = clampMIDI(maxMIDI);

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
  data() {
    return {
      octave: 3, //current octave
      keys: {},
      mouseDown: false,
      keyNotes: []
    };
  },
  methods: {
    keyToNote(key) {
      const note = KEYBOARD[key];
      if (!note) return;
      return Frequency(note.replace("l", this.octave).replace("u", this.octave + 1)).toNote();
    },
    playNote(note) {
      this.$emit("onKeyDown", note);
    },
    releaseNote(note) {
      this.$emit("onKeyUp", note);
    },
    handleMouseUp(key) {
      if (this.mouseDown) {
        key["active"] = false;
        this.releaseNote(key.note);
      }
    },
    handleMouseDown(key) {
      key["active"] = true;
      this.playNote(key.note);
    },
    handleMouseOver(key) {
      if (this.mouseDown) {
        key["active"] = true;
        this.playNote(key.note);
      }
    },
    handleMouseOut(key) {
      if (this.mouseDown) {
        key["active"] = false;
        this.releaseNote(key.note);
      }
    },

    // handleMouseUp2(e) {
    //   this.mouseDown = false;
    //   const target = e.target;
    //   const note = target.dataset.note;
    //   note && this.releaseNote(note);
    // },
    // handleMouseDown2(e) {
    //   this.mouseDown = true;
    //   const target = e.target;
    //   const note = target.dataset.note;
    //   console.warn("down", note);
    //   note && this.playNote(note);
    // },
    // handleMouseOver2(e) {
    //   if (this.mouseDown) {
    //     const target = e.target;
    //     const note = target.dataset.note;
    //     console.log("over", note);
    //     note && this.playNote(note);
    //   }
    // },
    // handleMouseOut2(e) {
    //   const target = e.target;
    //   const note = target.dataset.note;
    //   note && this.releaseNote(note);
    // },

    onKeyDown() {
      let listener;
      document.removeEventListener("keydown", listener);
      listener = event => {
        const { key } = event;
        // Only trigger once per keydown event.
        if (!this.keys[key]) {
          this.keys[key] = true;
          const note = this.keyToNote(key);
          if (note) {
            this.playNote(note);
          }
        }
      };
      document.addEventListener("keydown", listener);
    },
    onKeyUp() {
      let listener;

      document.removeEventListener("keyup", listener);

      listener = event => {
        const { key } = event;
        const note = this.keyToNote(key);
        if (this.keys[key] && note) {
          this.keys[key] = false;
          this.releaseNote(note);
        }
      };
      document.addEventListener("keyup", listener);
    }
  },
  mounted() {
    this.keyNotes = this._keys.slice(48, 60);
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
    }
  }
};
</script>

<style lang="scss" scoped>
.keyboard {
  // display: flex;
  // position: relative;
  --white-width: 50px;
  --black--width: 30px;
  display: flex;
  .key {
    position: relative;
    margin-left: calc(var(--black--width) / -2);
    &.key-white {
      flex: 1;
      max-width: var(--white-width);
      min-width: var(--black--width);
      height: 200px;
      border: 1px solid black;
      z-index: 1;
      + .key-white {
        margin: 0;
      }
    }
    &.key-black {
      z-index: 2;
      background-color: black;
      width: var(--black--width);
      height: 100px;
      border: 1px solid black;
    }

    &.active {
      background-color: aqua;
    }
  }
}
</style>
