import { clamp, scale, getPropertyFromItem } from "@/utils";
export const ControlBase = {
  props: {
    value: null,
    /*
    range of values as array of two elements
    */
    valueRange: {
      type: Array,
      default: () => [0, 1],
      validator: v => Array.isArray(v) && v.length === 2 && v.every(i => +i === +i) && v[0] < v[1]
    },
    /*
    range of position values as array of two integers
    */
    positionRange: {
      type: Array,
      default: () => [0, 100],
      validator: v =>
        Array.isArray(v) && v.length === 2 && v.every(i => Number.isInteger(i)) && v[0] < v[1]
    },
    ticks: {
      type: [Number, String],
      validator: v => Number.isInteger(+v) && +v > 1
    },
    snap: Boolean,
    items: {
      type: Array,
      default: () => []
    },
    itemText: {
      type: [String, Function],
      default: "text"
    },
    itemValue: {
      type: [String, Function],
      default: "value"
    },
    /*
    mouse drag sensitivity; more->faster
    */
    sensitivity: {
      type: [Number, String],
      validator: v => +v === +v && v > 0,
      default: 1
    },
    /*
    default value
    */
    default: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      position$: 0,
      currentY$: 0,
      temp$: 0,
      selected$: false,
      selectedIndex$: -1
    };
  },
  computed: {
    $_ticks() {
      return this.ticks || this.items.length;
    },
    $_tickDelta() {
      let t = this.$_ticks || 2;
      return this.$_positionSpread / (t - 1);
    },
    $_positionSpread() {
      return Math.abs(this.positionRange[1] - this.positionRange[0]);
    },
    $_sensitivity() {
      return (this.sensitivity * this.$_positionSpread) / 100;
    },
    $_snapItems() {
      return this.items && this.items.length && this.snap;
    },
    controlHandlers() {
      return {
        mousemove: this.$_handleMouseMove,
        mouseup: this.$_handleMouseUp,
        mousedown: this.$_handleMouseDown,
        dblclick: this.$_handleDbClick
      };
    }
  },
  methods: {
    $_positionToValue(position) {
      let value;
      // todo return custom value or numeric value
      if (this.$_snapItems) {
        const idx = ~~(position / this.$_tickDelta);
        const item = this.items[idx];
        value = this.$_getValue(item);
      } else {
        value = this.postionToValue(position);
      }
      this.$emit("input", value);
    },
    $_valueToPosition(value) {
      /*
      initialize controler position with provided value
      */
      // if has options to snap (items + snap)
      if (this.$_snapItems) {
        const idx = this.items.findIndex(item => {
          const itemValue = (this.$_getValue(item) || "").toString();
          return itemValue === value;
        });

        if (~idx) {
          return this.valueToSnap(idx);
        }
      }
      // return value in selected range (valueRange prop)
      const d = this.valueRange;
      value = clamp(value, d[0], d[1]);
      return this.valueToPosition(value);
    },
    $_updatePosition(position) {
      const d = this.positionRange;
      const _position = clamp(position, d[0], d[1]);

      this.position$ = _position;
      this.$_positionToValue(_position);
    },
    $_init() {
      this.$_clearDrag();
      this.position$ = this.$_valueToPosition(this.value);
      this.init();
    },
    $_clearDrag() {
      this.selected$ = false;
      window.removeEventListener("mousemove", this.$_handleMouseMove);
      window.removeEventListener("mouseup", this.$_handleMouseUp);
    },
    $_resetToDefault() {
      const position = this.$_valueToPosition(this.default);
      this.$_updatePosition(position);
    },
    $_getText(item) {
      return getPropertyFromItem(item, this.itemText, item);
    },
    $_getValue(item) {
      return getPropertyFromItem(item, this.itemValue, this.$_getText(item));
    },
    // ==========================
    // public methods
    // ==========================
    init() {},
    postionToValue(position) {
      const v = this.valueRange,
        p = this.positionRange;
      return scale(position, p[0], p[1], v[0], v[1]);
    },
    valueToPosition(value) {
      const v = this.valueRange,
        p = this.positionRange;
      return scale(value, v[0], v[1], p[0], p[1]);
    },
    valueToSnap(value) {
      const l = this.items.length - 1,
        p = this.positionRange;
      return scale(value, 0, l, p[0], p[1]);
    },
    renderTicks() {
      if (this.$_ticks) {
        console.warn(
          "Create custom function to generate ticks or remove 'ticks' and 'labels' prop!"
        );
      }
    },
    renderLabels() {
      if (this.items.length) {
        console.warn("Create custom function to generate labels or remove 'labels' prop!");
      }
    },
    /*
    ==========================
    user interaction handlers
    ==========================
    */
    $_handleMouseMove(e) {
      if (!this.selected$) return;

      let position = this.position$,
        delta;

      // Controller position
      delta = (e.pageY - this.currentY$) * this.$_sensitivity;
      if (this.snap) {
        // snap to ticks
        const diff = Math.round(delta / this.$_tickDelta) * this.$_tickDelta;
        position = this.temp$ - diff;
      } else if (delta) {
        // free mode
        if (e.shiftKey) {
          delta *= 0.1;
        }
        position -= delta;
        this.currentY$ = e.pageY;
      } else {
        return;
      }
      // console.log("mouse-move", position);
      this.$_updatePosition(position);
    },
    $_handleMouseUp(e) {
      // console.log("mouse-up");
      this.currentY$ = e.pageY;
      this.temp$ = 0;
      this.$_clearDrag();
    },
    $_handleMouseDown(e) {
      // console.log("mouse-down", this.position$);
      this.selected$ = true;
      this.currentY$ = e.pageY;
      this.temp$ = this.position$;
      e.preventDefault();
      window.addEventListener("mousemove", this.$_handleMouseMove);
      window.addEventListener("mouseup", this.$_handleMouseUp);
    },
    $_handleDbClick() {
      this.$_resetToDefault();
    }
  },
  mounted() {
    this.$_init();
  }
};
