import Controller from "../Controller.vue";
import { shallowMount } from "@vue/test-utils";
import { Control } from "@/Synth/control";

jest.mock("@/Synth/control");

describe("Controller.vue", () => {
  // let model;
  // beforeEach(() => {
  //   // Clear all instances and calls to constructor and all methods:

  // });

  test("validate model prop", () => {
    const msg = Controller.props.model;
    expect(msg.required).toBeTruthy();
    expect(msg.type).toBe(Control);
  });
  test("render component", () => {
    const model = new Control();
    const wrapper = shallowMount(Controller, { propsData: { model } });
    expect(wrapper.isVueInstance()).toBe(true);
  });
});
