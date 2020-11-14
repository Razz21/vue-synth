<script>
import { Control } from "@/Synth/control";
import { CONTROL_TYPES } from "@/Synth/synthfunctions";

const KnobVue = () => import("@/components/controllers/Knob.vue");
const WavePickerVue = () => import("@/components/controllers/WavePicker.vue");
const FaderVue = () => import("@/components/controllers/Fader.vue");
const DisplayPickerVue = () => import("@/components/controllers/DisplayPicker.vue");
const ToggleVue = () => import("@/components/controllers/Toggle.vue");
const VSelectVue = () => import("@/components/controllers/VSelect.vue");

export default {
  props: {
    model: {
      type: Control,
      required: true
    }
  },
  data() {
    return {
      modelData: this.model //make reactive
    };
  },

  render(h) {
    let component;
    switch (this.model.type) {
      case CONTROL_TYPES.KNOB:
        component = KnobVue;
        break;
      case CONTROL_TYPES.DISPLAYPICKER:
        component = DisplayPickerVue;
        break;
      case CONTROL_TYPES.FADER:
        component = FaderVue;
        break;
      case CONTROL_TYPES.WAVEPICKER:
        component = WavePickerVue;
        break;
      case CONTROL_TYPES.TOGGLE:
        component = ToggleVue;
        break;
      case CONTROL_TYPES.SELECT:
        component = VSelectVue;
        break;
      default:
        component = KnobVue;
        break;
    }

    const componentProps = { ...this.model, value: this.model.value };
    return h(component, {
      props: componentProps,
      on: {
        input: event => {
          this.model.value = event;
        }
      }
    });
  }
};
</script>
