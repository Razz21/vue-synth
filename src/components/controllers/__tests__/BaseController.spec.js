import BaseController from "../BaseController.vue";
import { shallowMount } from "@vue/test-utils";

describe("BaseController.vue", () => {
  test("renders label", () => {
    const propsData = { label: "some label" };
    const wrapper = shallowMount(BaseController, { propsData });
    expect(wrapper.text()).toContain(propsData.label);
  });
  test("do not render label div if label prop not provided", () => {
    const propsData = {};
    const wrapper = shallowMount(BaseController, { propsData });
    expect(wrapper.find(".controller__label").exists()).toBe(false);
  });
  test("renders label position class", () => {
    const propsData = { label: "some label", labelPosition: "left" };
    const wrapper = shallowMount(BaseController, { propsData });
    expect(wrapper.classes()).toContain("label-" + propsData.labelPosition);
  });
  test("validator label position", () => {
    const validTypes = ["top", "bottom", "left", "right"];
    const validator = BaseController.props.labelPosition.validator;
    validTypes.forEach(type => expect(validator(type)).toBe(true));

    expect(validator("position")).toBe(false);
  });
  // todo test bind class attribute
  // test("render static class", () => {
  //   const attrs = { class: "custom--class" };
  //   const wrapper = shallowMount(BaseController, { attrs });
  //   expect(wrapper.classes()).toContain(attrs.class);
  // });
});
