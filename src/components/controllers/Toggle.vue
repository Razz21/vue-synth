<script>
import BaseController from "./BaseController";
export default {
  name: "Toggle",
  functional: true,
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    value: {
      type: [Number, String],
      validator: v => +v === 0 || +v === 1
    },
    label: String
  },
  render(h, { props, listeners, data }) {
    return h(BaseController, { ...data, props }, [
      h("label", { staticClass: "checkbox" }, [
        h("span", { staticClass: "checkbox__input" }, [
          h("input", {
            attrs: { type: "checkbox", value: props.value },
            class: { checked: props.value },
            on: {
              change(e) {
                return listeners["input"](1 - e.target.value);
              }
            }
          }),
          h("span", { staticClass: "checkbox__control" })
        ])
      ])
    ]);
  }
};
</script>

<style lang="scss">
.checkbox {
  cursor: pointer;

  &__input {
    input {
      position: absolute;
      opacity: 0;
      z-index: -1;
      appearance: none;
      &.checked + span {
        box-shadow: 0 0 0.05em 0.1em #111, 0 0.1em 0.1em 0 #111a;
        &::before {
          background-color: #fff;
          background: radial-gradient(circle at center, #fff, #aaa);
          box-shadow: 0 0 0.4em #fff5, 0 0 0 0.05em #000, inset 0 0 0.08em 0.13em #000;
        }
      }
    }
  }
  &__control {
    display: inline-block;
    width: 1.2em;
    height: 1.2em;
    border-radius: 25%;
    display: flex;
    box-shadow: 0 0 0.05em #111, 0 0.1em 0.1em 0 #111a;
    // overflow: hidden;
    &::before {
      content: "";
      border-radius: inherit;
      width: 100%;
      height: 100%;

      margin: auto;
      display: block;
      background: linear-gradient(0deg, #333, #555);
      box-shadow: 0 0 0 0.03em #000, inset 0 0 0.04em 0.08em #000, inset 0 -0.07em 0.35em #1115;
    }
  }
}
</style>
