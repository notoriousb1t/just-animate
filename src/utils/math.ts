import { _ } from './resources'

export const inRange = (val: number, min: number, max: number) =>
  val !== _ && min <= val && val <= max
export const minMax = (val: number, min: number, max: number) =>
  val < min ? min : val > max ? max : val
