import { clamp, scale } from "@/utils";
import _merge from "lodash.merge";
import { LogControlMixin } from "@/mixins/LogControl";
import { ExpControlMixin } from "@/mixins/ExpControlMixin";
import { StepControlMixin } from "@/mixins/StepControlMixin";
import { BaseControlMixin } from "@/mixins/BaseControlMixin";
export const ControlMixin = {
  beforeCreate() {
    const { step, log, exp } = this.$options.propsData;
    let mixin;
    // _merge() override constructor $options, so changes in component are permanent
    // and options need to be updated every time
    if (step) {
      mixin = StepControlMixin;
    } else if (exp) {
      mixin = ExpControlMixin;
    } else if (log) {
      mixin = LogControlMixin;
    } else {
      mixin = BaseControlMixin;
    }
    // override component options with mixin
    _merge(this.$options, mixin);

    // override mixin options with component custom methods/computed etc.
    // _merge(this.$options, _merge({}, mixin, this.$options));
  },
  props: {
    /*
    id prop for presets functionality
    */
    id: {
      type: [String, Number]
      // required: true
    },
    value: null,
    /*
    default value
    */
    default: {
      type: [Number, String],
      default: 0,
      validate: v => +v === +v // Number
    },
    min: {
      type: [Number, String],
      default: 0,
      validate: v => +v === +v // Number
    },
    max: {
      type: [Number, String],
      default: 1,
      validate: v => +v === +v // Number
    },

    /*
    mouse drag sensitivity; more->faster
    */
    sensitivity: {
      type: [Number, String],
      validator: v => +v === +v && v > 0,
      default: 1
    },

    step: {
      type: [String, Number],
      validate: v => +v === +v && v > 0 // positive integer / float
    },
    digits: {
      type: [String, Number],
      default: 2,
      validator: v => Number.isInteger(+v) && v >= 0
    },
    units: {
      type: String,
      default: ""
    },
    exp: {
      type: [Number, String],
      validator: v => +v !== 0 && +v === +v // differ zero
    },
    snap: Boolean,
    bipolar: Boolean,
    log: Boolean,
    label: String
  },
  data() {
    return {
      currentY$: 0,
      temp$: 0,
      selected$: false,
      wheelResistance: 1 // mouse wheel sensitivity; more -> slower (more accurate change)
    };
  },

  computed: {
    position$: {
      get() {
        return this.$_valueToPosition(this.value);
      },
      set(position) {
        this.$_positionToValue(position);
      }
    },
    min$() {
      // transform prop to number to avoid wrong string parsing in math calculations
      return Number(this.min);
    },
    max$() {
      // transform prop to number to avoid wrong string parsing in math calculations
      return Number(this.max);
    },
    $_steps() {
      if (this.step) {
        return this.$_valueSpread / this.step;
      }
      return 0;
    },
    $_stepDelta() {
      if (this.$_steps > 0) {
        return 1 / this.$_steps;
      }
      return 1;
    },
    $_valueSpread() {
      return this.max$ - this.min$;
    },

    $_sensitivity() {
      return this.sensitivity / 120;
    },
    controlHandlers() {
      return {
        mousemove: this.$_handleMouseMove,
        mouseup: this.$_handleMouseUp,
        mousedown: this.$_handleMouseDown,
        dblclick: this.$_handleDbClick,
        click: this.$_handleMouseClick
      };
    }
  },
  methods: {
    // ==========================
    // private methods
    // ==========================
    $_valueToDisplay(value) {
      let valueNumber = value.toFixed(this.digits);
      if (this.digits === 0 && valueNumber > 1000) {
        valueNumber /= 1000;
        valueNumber = valueNumber.toFixed(valueNumber < 10 ? 2 : 1) + "k";
      }
      return valueNumber + this.units;
    },
    $_positionToValue(position) {
      const value = this.positionToValue(position);
      // prevent calling handler with repeated values
      if (this.value !== value) {
        this.$emit("input", value);
        this.$bus.$emit("control:change", this.$_valueToDisplay(value));
      }
    },
    $_valueToPosition(value) {
      /*
      initialize controler position with provided value
      */
      // return value in selected range (min -> max)
      value = clamp(value, this.min$, this.max$);
      return this.valueToPosition(value);
    },
    $_updatePosition(position) {
      const _position = clamp(position, 0, 1);

      if (_position !== this.position$) {
        this.position$ = _position;
      }
    },
    $_init() {
      this.$_clearDrag();
      this.init();
    },
    $_clearDrag() {
      this.selected$ = false;
      window.removeEventListener("mousemove", this.$_handleMouseMove);
      window.removeEventListener("mouseup", this.$_handleMouseUp);
    },
    $_resetToDefault() {
      this.$emit("input", this.default);
    },
    // ==========================
    // public methods
    // ==========================
    init() {},
    positionToValue(position) {
      return scale(position, 0, 1, this.min$, this.max$);
    },
    valueToPosition(value) {
      return scale(value, this.min$, this.max$, 0, 1);
    },
    // ==========================
    // user interaction handlers
    // ==========================
    $_handleMouseMove(e) {
      if (!this.selected$) return;

      let position = this.position$,
        delta;
      // Controller position
      delta = (e.pageY - this.currentY$) * this.$_sensitivity;
      if (e.shiftKey) {
        delta *= 0.1;
      }
      if (this.snap) {
        // snap to step
        const diff = Math.floor(delta / this.$_stepDelta) * this.$_stepDelta;
        position = this.temp$ - diff;
      } else if (delta) {
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
      this.selected$ = true;
      this.currentY$ = e.pageY;
      this.temp$ = this.position$;
      e.preventDefault();

      window.addEventListener("mousemove", this.$_handleMouseMove);
      window.addEventListener("mouseup", this.$_handleMouseUp);
    },
    $_handleDbClick() {
      this.$_resetToDefault();
    },
    $_handleMouseWheel(e) {
      e.preventDefault();
      this.selected$ = true;
      this.$_clearDrag();
      const sign = (e.deltaY || -e.wheelDelta || e.detail) >> 10 || 1;
      let position = this.position$ - 0.05 * sign; // / this.wheelResistance;
      this.$_updatePosition(position);
    },
    $_handleMouseClick(e) {
      this.$bus.$emit("control:change", this.$_valueToDisplay(this.value));
    }
  },
  mounted() {
    this.$_init();
  }
};
