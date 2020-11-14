import DisplayPicker from "../DisplayPicker.vue";
import { shallowMount } from "@vue/test-utils";

describe("DisplayPicker.vue", () => {
  let model;
  beforeEach(() => {
    model = jest.mock();
  });
  test("render values", async () => {
    const propsData = { step: 1, snap: true, default: 1, value: 0 };
    const wrapper = shallowMount(DisplayPicker, { propsData });
    await wrapper.find(".handle").trigger("dblclick");
    expect(wrapper.emitted().input).toBeTruthy();
    expect(wrapper.emitted().input.length).toBe(1);
    expect(wrapper.emitted("input")[0]).toEqual([propsData.default]);
  });
});
