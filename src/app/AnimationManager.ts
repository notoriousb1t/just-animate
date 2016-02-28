declare const jQuery;

import {extend, isArray, isFunction, each, multiapply, toArray} from './helpers';
import {IAnimation, IAnimationTiming, IElementProvider, IKeyframe, IAnimationOptions, IAnimationOptionsMap, jQuery as JQueryType} from './interfaces';
import {AnimationRelay} from './AnimationRelay';

export type ElementSource = Element | Element[] | string | JQueryType | IElementProvider;

function getElements(source: ElementSource): Element[] {
    if (!source) {
        throw Error("Cannot find elements.  Source is undefined");
    }
    if (source instanceof Element) {
        return [source];
    }
    if (typeof source === 'string') {
        return toArray(document.querySelectorAll(source));
    }
    if (isArray(source) || (typeof jQuery === 'function' && source instanceof jQuery)) {
        const elements = [];
        each(source as any[], i => {
            elements.push.apply(elements, getElements(i));
        });
        return elements;
    }
    if (isFunction(source)) {
        const provider = source as IElementProvider;
        const result = provider();
        return getElements(result);
    }
    return [];
}

export class AnimationManager {
    private _definitions: IAnimationOptionsMap;
    private _timings: IAnimationTiming;

    constructor() {
        this._definitions = {};
        this._timings = {
            duration: 1000,
            fill: "both"
        };
    }

    animate(name: string, el: Element, timings?: IAnimationTiming): IAnimation;
    animate(name: string, el: Element[], timings?: IAnimationTiming): IAnimation;
    animate(name: string, el: string, timings?: IAnimationTiming): IAnimation;
    animate(name: string, el: JQueryType, timings?: IAnimationTiming): IAnimation;
    animate(name: string, el: IElementProvider, timings?: IAnimationTiming): IAnimation;
    animate(name: string, el: ElementSource, timings?: IAnimationTiming): IAnimation {
        if (typeof name === 'undefined') {
            return;
        }

        const definition = this._definitions[name];
        if (typeof definition === 'undefined') {
            return;
        }

        let timings2 = extend({}, definition.timings);
        if (timings) {
            timings2 = extend(timings2, timings);
        }

        const keyframes = definition.keyframes;
        const elements = getElements(el);
        const players = multiapply(elements, 'animate', [keyframes, timings2]) as IAnimation[];

        return new AnimationRelay(players);

    }
    configure(timings?: IAnimationTiming) {
        extend(this._timings, timings);
    }
    register(name: string, animationOptions: IAnimationOptions) {
        this._definitions[name] = animationOptions;

        const self = this;
        self[name] = (el, timings) => {
            return self.animate(name, el, timings);
        };
        return self;
    }
}