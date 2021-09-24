import { useEffect, useMemo, useState } from "react";
import { Subject } from "rxjs";
import * as Rx from "rxjs";
import * as RxOp from "rxjs/operators";
import produce from "immer";

interface Options {
  numPairs?: number;
  flipDuration?: number;
  coverDelay?: number;
}

const NUM_PAIRS = 8;
const FLIP_DURATION = 250;
const COVER_DELAY = 500;

const shuffle = (numPairs: number) => {
  const temp = [...Array(2 * numPairs)].map((_, i) => i >> 1);
  const shuffled: number[] = [];
  while (temp.length) {
    const index = ~~(Math.random() * temp.length);
    const [pairId] = temp.splice(index, 1);
    shuffled.push(pairId);
  }
  return shuffled;
};

const initializedClassNames = (numPairs: number) => [...Array(2 * numPairs)].fill("bg");

const useMemory = (
  { numPairs = NUM_PAIRS, flipDuration = FLIP_DURATION, coverDelay = COVER_DELAY }: Options = {
    numPairs: NUM_PAIRS,
    flipDuration: FLIP_DURATION,
    coverDelay: COVER_DELAY,
  }
) => {
  const [turnCount, setTurnCount] = useState<number>();
  const [classNames, setClassNames] = useState<string[]>(initializedClassNames(numPairs));

  const statics = useMemo(
    () => ({
      cards: shuffle(numPairs),
      flip$: new Subject<number>(),
      transition$: new Subject<number>(),
    }),
    [numPairs]
  );

  useEffect(() => {
    setClassNames(initializedClassNames(numPairs));
    const { cards, flip$, transition$ } = statics;

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
          transition$.pipe(
            RxOp.filter(src => index === src),
            RxOp.take(1),
            RxOp.tap(index => updateCards("fg-cw90", index)),
            RxOp.delay(flipDuration / 2)
          )
        ),
        RxOp.bufferCount(2),
        RxOp.mergeMap(([a, b]) =>
          Rx.iif(
            () => cards[a] === cards[b],
            Rx.of(true).pipe(RxOp.tap(() => updateCards("match", a, b))),
            Rx.of(false).pipe(
              RxOp.delay(coverDelay),
              RxOp.tap(() => updateCards("fg-ccw90", a, b)),
              RxOp.delayWhen(() => transition$.pipe(RxOp.filter(src => a === src))),
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
  }, [statics, setClassNames, flipDuration, coverDelay]);

  return { classNames, turnCount, ...statics };
};

export default useMemory;
