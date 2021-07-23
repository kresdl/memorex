import { useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import * as Rx from "rxjs";
import * as RxOp from "rxjs/operators";
import produce from "immer";

interface Options {
  numPairs?: number;
  duration?: number;
  delay?: number;
}

const NUM_PAIRS = 8;
const DURATION = 250;
const DELAY = 0;

const shuffle = (numPairs: number) => {
  const temp = [...Array(2 * numPairs)].map((_, i) => i >> 1);
  const shuffled: number[] = [];
  while (temp.length) {
    const index = ~~(Math.random() * temp.length);
    shuffled.push(...temp.splice(index, 1));
  }
  return shuffled;
};

const useMemory = (
  { numPairs = NUM_PAIRS, duration = DURATION, delay = DELAY }: Options = {
    numPairs: NUM_PAIRS,
    duration: DURATION,
    delay: DELAY,
  }
) => {
  const [turnCount, setTurnCount] = useState<number>();
  const [classNames, setClassNames] = useState<string[]>([...Array(2 * numPairs)].fill("bg"));
  const statics = useRef({
    cards: shuffle(numPairs),
    flip$: new Subject<number>(),
    animationEnd$: new Subject<number>(),
  });

  useEffect(() => {
    const { cards, flip$, animationEnd$ } = statics.current;

    const updateCards = (value: string, ...indexes: number[]) => {
      setClassNames(
        produce(draft => {
          indexes.forEach(i => {
            draft[i] = value;
          });
        })
      );
    };

    const subscription = flip$
      .pipe(
        RxOp.tap(index => updateCards("bg-cw90 bg", index)),
        RxOp.mergeMap(index =>
          animationEnd$.pipe(
            RxOp.filter(src => index === src),
            RxOp.take(1),
            RxOp.tap(index => updateCards("fg-cw90", index)),
            RxOp.delay(duration / 2)
          )
        ),
        RxOp.bufferCount(2),
        RxOp.map(([a, b]) => ({ a, b, match: cards[a] === cards[b] })),
        RxOp.mergeMap(({ a, b, match }) =>
          Rx.iif(
            () => match,
            Rx.of(true).pipe(RxOp.tap(() => updateCards("match", a, b))),
            Rx.of(false).pipe(
              RxOp.tap(() => updateCards("fg-ccw90", a, b)),
              RxOp.delayWhen(() => animationEnd$.pipe(RxOp.filter(src => a === src))),
              RxOp.tap(() => updateCards("bg-ccw90 bg", a, b))
            )
          )
        ),

        RxOp.scan((count, match) => (match ? count + 1 : count), 0),
        RxOp.takeWhile(count => count < 8),
        RxOp.count()
      )
      .subscribe(setTurnCount);

    return () => {
      subscription.unsubscribe();
    };
  }, [statics, setClassNames, duration, delay]);

  return { classNames, turnCount, ...statics.current };
};

export default useMemory;
