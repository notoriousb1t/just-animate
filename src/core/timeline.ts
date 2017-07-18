import {
  D_ALTERNATIVE,
  D_NORMAL,
  S_FINISHED,
  S_IDLE,
  S_PAUSED,
  S_PENDING,
  S_RUNNING
} from '../constants'

import { loopOn, loopOff, getPlugins } from '.'
import { toEffects, addKeyframes } from './effects'
import { inferOffsets, propsToKeyframes } from '../transformers'
import { sortBy, forEach, head, push } from '../utils/lists'
import { isDefined, isArrayLike } from '../utils/type'
import { convertToMs } from '../utils/units'
import { getTargets } from '../utils/get-targets'
import {
  _,
  CANCEL,
  FINISH,
  PAUSE,
  PLAY,
  SEEK,
  UPDATE
} from '../utils/resources'

import {
  AddAnimationOptions,
  AnimationController,
  AnimationOptions,
  BaseAnimationOptions,
  Effect,
  PropertyKeyframe,
  KeyframeOptions,
  PropertyOptions,
  TargetConfiguration,
  ToAnimationOptions
} from '../types'

import { max, inRange } from '../utils/math'

const propKeyframeSort = sortBy<PropertyKeyframe>('time')

// tslint:disable-next-line:variable-name
export class Timeline {
  public currentTime: number
  public duration: number
  public playbackRate: number
  private _nextTime: number
  private _state: number
  private _config: TargetConfiguration[]
  private _effects: AnimationController[]
  private _times: number
  private _iteration: number
  private _time: number
  private _dir: number
  private _listeners: { [key: string]: { (time: number): void }[] }

  constructor() {
    const self = this
    // initialize default values
    self.duration = 0
    self._nextTime = 0
    self.playbackRate = 1
    self._dir = D_NORMAL
    self._state = S_IDLE
    self._config = []
    self._listeners = {}

    // bind tick to instance
    self._tick = self._tick.bind(self)

    Object.defineProperty(self, 'currentTime', {
      get() {
        return self._time
      },
      set(time: number) {
        self.seek(time)
      }
    })
  }

  public add(opts: AddAnimationOptions) {
    const { _nextTime } = this
    const hasTo = isDefined(opts.to)
    const hasFrom = isDefined(opts.from)
    const hasDuration = isDefined(opts.duration)

    // pretty exaustive rules for importing times
    let from: number, to: number
    if (hasFrom && hasTo) {
      from = opts.from
      to = opts.to
    } else if (hasFrom && hasDuration) {
      from = opts.from
      to = from + opts.duration
    } else if (hasTo && hasDuration) {
      to = opts.to
      from = to - opts.duration
    } else if (hasTo && !hasDuration) {
      from = _nextTime
      to = from + opts.to
    } else if (hasDuration) {
      from = _nextTime
      to = from + opts.duration
    } else {
      throw new Error('Missing duration')
    }

    return this.fromTo(max(from, 0), max(to, 0), opts)
  }

  public fromTo(
    from: number | string,
    to: number | string,
    options: BaseAnimationOptions
  ) {
    const config = this._config

    if (isArrayLike(options.css)) {
      // fill in missing offsets
      inferOffsets(options.css as KeyframeOptions[])
    } else {
      // convert properties to offsets
      options.css = propsToKeyframes(options.css as PropertyOptions)
    }

    // ensure to/from are in milliseconds (as numbers)
    const options2 = options as AnimationOptions
    options2.from = convertToMs(from)
    options2.to = convertToMs(to)
    options2.duration = options2.to - options2.from

    // add all targets as property keyframes
    forEach(getTargets(options.targets), (target, i) =>
      addKeyframes(
        head(config, t2 => t2.target === target) ||
          push(config, {
            from: options2.from,
            to: options2.to,
            duration: options2.to - options2.from,
            endDelay: (options2.endDelay || 0),
            target,
            keyframes: [],
            propNames: []
          }),
        i,
        options2
      )
    )

    // sort property keyframes
    forEach(config, c => c.keyframes.sort(propKeyframeSort))

    // recalculate property keyframe times and total duration
    this._calcTimes()
    return this
  }

  public to(toTime: string | number, opts: ToAnimationOptions) {
    const { duration } = this
    const to = convertToMs(toTime)

    let fromTime: number
    if (isDefined(opts.from)) {
      fromTime = convertToMs(opts.from)
    } else if (isDefined(opts.duration)) {
      fromTime = to - convertToMs(opts.duration)
    } else {
      fromTime = duration
    }

    return this.fromTo(max(fromTime, 0), to, opts)
  }

  public cancel() {
    const self = this
    self._time = 0
    self._iteration = _
    self._state = S_IDLE
    loopOff(self._tick)
    forEach(self._effects, c => c(CANCEL, 0, self.playbackRate))
    forEach(self._listeners[CANCEL], c => c(0))
    self._teardown()
    return self
  }

  public finish() {
    const self = this
    self._setup()
    self._time = _
    self._iteration = _
    self._state = S_FINISHED
    loopOff(self._tick)
    forEach(self._effects, c => c(FINISH, _, self.playbackRate))
    forEach(self._listeners[FINISH], c => c(_))
    return self
  }

  public on(eventName: string, listener: () => void) {
    const self = this
    const { _listeners } = self

    const listeners = _listeners[eventName] || (_listeners[eventName] = [])
    if (listeners.indexOf(listener) === -1) {
      push(listeners, listener)
    }

    return self
  }
  public off(eventName: string, listener: () => void) {
    const self = this
    const listeners = self._listeners[eventName]
    if (listeners) {
      const indexOfListener = listeners.indexOf(listener)
      if (indexOfListener !== -1) {
        listeners.splice(indexOfListener, 1)
      }
    }
    return self
  }

  public pause() {
    const self = this
    const { currentTime, playbackRate, _listeners, _time } = self
    self._setup()
    self._state = S_PAUSED
    loopOff(self._tick)
    forEach(self._effects, e => e(PAUSE, currentTime, playbackRate))
    forEach(_listeners[PAUSE], c => c(_time))
    return self
  }

  public play(iterations = 1, dir = D_NORMAL) {
    const self = this
    self._setup()
    self._times = iterations
    self._dir = dir

    if (
      self._state === S_PAUSED ||
      (self._state !== S_RUNNING && self._state !== S_PENDING)
    ) {
      self._state = S_PENDING
    }

    loopOn(self._tick)
    forEach(self._listeners[PLAY], c => c(self._time))
    return self
  }

  public reverse() {
    const self = this
    self.playbackRate = (self.playbackRate || 0) * -1

    if (self._state === S_RUNNING) {
      // if currently running, pause the animation and replay from that position
      self.pause().play()
    }
    return self
  }

  public seek(time: number | string) {
    const self = this
    const timeMs = convertToMs(time)
    self._time = timeMs
    forEach(self._effects, e => e(SEEK, timeMs, self.playbackRate))
  }

  public getEffects(): Effect[] {
    return toEffects(this._config)
  }

  private _calcTimes() {
    const self = this
    let timelineTo = 0
    let maxNextTime = 0

    forEach(self._config, target => {
      const { keyframes } = target

      var targetFrom: number
      var targetTo: number

      forEach(keyframes, keyframe => {
        const time = keyframe.time
        if (time < targetFrom || targetFrom === _) {
          targetFrom = time
        }
        if (time > targetTo || targetTo === _) {
          targetTo = time
          if (time > timelineTo) {
            timelineTo = time
          }
        }
      })

      target.to = targetTo
      target.from = targetFrom
      target.duration = targetTo - targetFrom
      
      maxNextTime = max(targetTo + target.endDelay, maxNextTime)
    })

    self._nextTime = maxNextTime
    self.duration = timelineTo
  }

  private _setup(): void {
    const self = this
    if (!self._effects) {
      const effects = toEffects(self._config)
      const plugins = getPlugins()
      const animations: AnimationController[] = []
      forEach(plugins, p => p.animate(effects, animations))
      self._effects = animations
    }
  }

  private _teardown(): void {
    const self = this
    self._effects = _
  }

  private _tick(delta: number) {
    const self = this
    const playState = self._state

    // canceled
    if (playState === S_IDLE) {
      self.cancel()
      return
    }
    // finished
    if (playState === S_FINISHED) {
      self.finish()
      return
    }
    // paused
    if (playState === S_PAUSED) {
      self.pause()
      return
    }
    // running/pending

    // calculate running range
    const duration = self.duration
    const iterations = self._times
    const playbackRate = self.playbackRate
    const isReversed = playbackRate < 0

    let time = self._time
    let iteration = self._iteration || 0

    if (self._state === S_PENDING) {
      // reset position properties if necessary
      if (
        time === _ ||
        (isReversed && time > duration) ||
        (!isReversed && time < 0)
      ) {
        // if at finish, reset to start time
        time = isReversed ? duration : 0
      }
      if (iteration === iterations) {
        // if at finish reset iterations to 0
        iteration = 0
      }
      self._state = S_RUNNING
    }

    time += delta * playbackRate

    // check if timeline has finished
    let hasEnded = false
    if (!inRange(time, 0, duration)) {
      self._iteration = ++iteration
      time = isReversed ? 0 : duration
      hasEnded = true
    }

    // call update
    self._iteration = iteration
    self._time = time
    forEach(self._listeners[UPDATE], c => c(time))
    forEach(self._effects, c => c(UPDATE, time, playbackRate))

    if (!hasEnded) {
      // if not ended, return early
      return
    }

    if (iterations === iteration) {
      // end the cycle
      self.finish()
      return
    }

    if (self._dir === D_ALTERNATIVE) {
      // change direction
      self.playbackRate = (self.playbackRate || 0) * -1
    }

    // if not the last iteration, reset the clock and call tick again
    time = self.playbackRate < 0 ? duration : 0
    self._time = time
    self._tick(0)
  }
}
