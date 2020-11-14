import { Envelope } from "tone";

/*
////////////////////////////
    eased decay curve
////////////////////////////
*/
// 1. create linear values array [0,1] (increasing values)
function linearCurve() {
  //ToneJS standard value for envelope curve
  const curveLen = 128;
  const curve = new Array(curveLen);
  for (var i = curveLen; i--; ) {
    curve[i] = i / (curveLen - 1);
  }
  return curve;
}

// 2. invert curve to get decreasing values [1,0]
function invertCurve(curve) {
  const out = new Array(curve.length);
  for (let j = 0; j < curve.length; j++) {
    out[j] = 1 - curve[j];
  }
  return out;
}

// 3. ease linear curve with exponent function [1,0]
function exponentCurve(curve, exp) {
  const pow = Math.pow;
  return curve.map(i => pow(i, exp));
}
// 4. scale curve [1,0] to range [1, sustain] - `decay` curve decrease signal in time
function easedCurve(curve, sustain) {
  return curve.map(i => i * (1 - sustain) + sustain);
}

// 5. pre-compute values with fixed exponent to avoid expensive Math.pow() calculation every update
const decayCurve = exponentCurve(invertCurve(linearCurve()), 3);

const decayExpCurve = easedCurve.bind(null, decayCurve);

export default class EG extends Envelope {
  triggerAttack(time, velocity = 1) {
    time = this.toSeconds(time);
    const originalAttack = this.toSeconds(this.attack);
    let attack = originalAttack;
    const decay = this.toSeconds(this.decay);
    // check if it's not a complete attack
    const currentValue = this.getValueAtTime(time);
    if (currentValue > 0) {
      // subtract the current value from the attack time
      const attackRate = 1 / attack;
      const remainingDistance = 1 - currentValue;
      // the attack is now the remaining time
      attack = remainingDistance / attackRate;
    }
    // attack
    if (attack < this.sampleTime) {
      this._sig.cancelScheduledValues(time);
      // case where the attack time is 0 should set instantly
      this._sig.setValueAtTime(velocity, time);
    } else if (this._attackCurve === "linear") {
      this._sig.linearRampTo(velocity, attack, time);
    } else if (this._attackCurve === "exponential") {
      this._sig.targetRampTo(velocity, attack, time);
    } else {
      this._sig.cancelAndHoldAtTime(time);
      let curve = this._attackCurve;
      // find the starting position in the curve
      for (let i = 1; i < curve.length; i++) {
        // the starting index is between the two values
        if (curve[i - 1] <= currentValue && currentValue <= curve[i]) {
          curve = this._attackCurve.slice(i);
          // the first index is the current value
          curve[0] = currentValue;
          break;
        }
      }
      this._sig.setValueCurveAtTime(curve, time, attack, velocity);
    }
    // decay
    if (decay && this.sustain < 1) {
      const decayValue = velocity * this.sustain;
      const decayStart = time + attack;
      if (this._decayCurve === "linear") {
        this._sig.linearRampToValueAtTime(decayValue, decay + decayStart);
      } else {
        // use custom exponential curve
        const decCurve = decayExpCurve(decayValue);
        this._sig.setValueCurveAtTime(decCurve, decayStart, decay, velocity);

        // handle sustain phase
        this._sig.cancelAndHoldAtTime(decayStart + decay * 0.99); // create some room to connect decay stage with sustain without artifacts
        this._sig.linearRampToValueAtTime(decayValue, decayStart + decay);
      }
    }
    return this;
  }
}
