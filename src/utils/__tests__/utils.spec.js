import * as utils from "../index";

describe("utils", () => {
  describe("clamp", () => {
    it("should clip lower range", () => {
      expect(utils.clamp(-10, 0, 10)).toBe(0);
    });
    it("should clip upper range", () => {
      expect(utils.clamp(20, 0, 10)).toBe(10);
    });
    it("should not clip if value in range", () => {
      expect(utils.clamp(0, 0, 10)).toBe(0);
      expect(utils.clamp(5, 0, 10)).toBe(5);
      expect(utils.clamp(10, 0, 10)).toBe(10);
    });
  });
  describe("scale", () => {
    it("should return linearly rescaled value in new range", () => {
      expect(utils.scale(0, 0, 1, 5, 10)).toBe(5);
      expect(utils.scale(0.5, 0, 1, 5, 10)).toBe(7.5);
      expect(utils.scale(1, 0, 1, 5, 10)).toBe(10);
    });
  });
  describe("polarToCartesian", () => {
    it("should convert polar coordiantes to Cartesian", () => {
      expect(utils.polarToCartesian(50, 50, 40, 90).x).toBeCloseTo(90);
      expect(utils.polarToCartesian(50, 50, 40, 90).y).toBeCloseTo(50);

      expect(utils.polarToCartesian(50, 50, 40, 130).x).toBeCloseTo(80.64);
      expect(utils.polarToCartesian(50, 50, 40, 130).y).toBeCloseTo(75.71);
    });
  });
  describe("describeArc", () => {
    it("should return svg arc path string", () => {
      const path = utils.describeArc(50, 50, 40, 90, 90);
      const regex = new RegExp(/[MmAa0-9-,.\s]/g);
      expect(typeof path).toBe("string");
      expect(path).toMatch(regex);
    });
  });
  describe("debounce", () => {
    let func, debounceFunc;
    beforeEach(() => {
      jest.useFakeTimers();
      func = jest.fn();
      debounceFunc = utils.debounce(func, 1000);
    });
    it("should execute only once", () => {
      for (let i = 0; i < 100; i++) {
        debounceFunc();
      }
      jest.runAllTimers();
      expect(func).toBeCalledTimes(1);
    });
  });
  describe("throttle", () => {
    let func, throttledFunc;
    beforeEach(() => {
      jest.useFakeTimers();
      func = jest.fn();
    });

    it("should execute in interval", () => {
      throttledFunc = utils.throttle(func, 100);
      const t = setInterval(() => {
        throttledFunc();
      }, 50);
      jest.runTimersToTime(400);

      expect(func).toBeCalledTimes(3);
      clearInterval(t);
    });
    it("should execute at least once with leading=true per `wait` duration", () => {
      throttledFunc = utils.throttle(func, 100, { leading: true });
      const t = setInterval(() => {
        throttledFunc();
      }, 50);
      jest.runTimersToTime(100);

      expect(func).toBeCalledTimes(1);
      clearInterval(t);
    });
    it("should not execute even once with leading=false per `wait` duration", () => {
      throttledFunc = utils.throttle(func, 100, { leading: false });
      const t = setInterval(() => {
        throttledFunc();
      }, 50);
      jest.runTimersToTime(100);

      expect(func).toBeCalledTimes(0);
      clearInterval(t);
    });
    it("should execute once with trailing=true per `wait` duration", () => {
      throttledFunc = utils.throttle(func, 100, { trailing: true, leading: false });
      const t = setInterval(() => {
        throttledFunc();
      }, 50);
      jest.runTimersToTime(200);

      expect(func).toBeCalledTimes(1);
      clearInterval(t);
    });
    it("should not execute even once with trailing=false per `wait` duration", () => {
      throttledFunc = utils.throttle(func, 100, { trailing: false, leading: false });
      const t = setInterval(() => {
        throttledFunc();
      }, 50);
      jest.runTimersToTime(100);

      expect(func).toBeCalledTimes(0);
      clearInterval(t);
    });
  });
  describe("roundToNearest", () => {
    it("should round number to nearest step multiple", () => {
      expect(utils.roundToNearest(1.25, 0.5)).toBe(1.5);
      expect(utils.roundToNearest(1.249, 0.5)).toBe(1);
    });
  });
  describe("random", () => {
    it("should return random float number in specified range", () => {
      const min = 5,
        max = 10,
        res = utils.random(min, max);
      expect(res).toBeGreaterThanOrEqual(min);
      expect(res).toBeLessThanOrEqual(max);
    });
  });
  describe("createEnum", () => {
    it("should return object with autoincrementing unique values", () => {
      const arr = ["test1", "test2", "test3"],
        resEnum = utils.createEnum(arr),
        values = new Set(Object.values(resEnum));
      expect(typeof resEnum).toBe("object");
      expect(Object.isFrozen(resEnum)).toBe(true);
      expect(values.size).toBe(arr.length);
      expect(resEnum[arr[0]]).toBe(0);
      expect(resEnum[arr[arr.length - 1]]).toBe(arr.length - 1);
    });
    it("should return object with key==value", () => {
      const arr = ["test1", "test2", "test3"],
        resEnum = utils.createEnum(arr, true);

      expect(typeof resEnum).toBe("object");
      expect(Object.isFrozen(resEnum)).toBe(true);
      expect(resEnum[arr[0]]).toBe(arr[0]);
      expect(resEnum[arr[arr.length - 1]]).toBe(arr[arr.length - 1]);
    });
  });
});
