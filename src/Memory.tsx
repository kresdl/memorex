import React, { useState } from "react";
import styled from "styled-components";
import Card from "./Card";
import useMemory from "./useMemory";

const FLIP_DURATION = 400;

const Container = styled.main`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-auto-rows: auto;
  grid-gap: 10px;
`;

const Memory: React.VFC = () => {
  const { cards, classNames, turnCount, flip$, transition$ } = useMemory({ flipDuration: FLIP_DURATION });

  return (
    <Container>
      <Grid>
        {cards.map((pairId, i) => (
          <Card
            key={i}
            className={classNames[i]}
            pairId={pairId}
            onTurn={() => flip$.next(i)}
            animationDuration={FLIP_DURATION / 2}
            onTransition={() => transition$.next(i)}
          />
        ))}
      </Grid>
    </Container>
  );
};

export default Memory;
