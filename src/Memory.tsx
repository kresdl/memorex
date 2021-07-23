import React from "react";
import styled from "styled-components";
import Card from "./Card";
import useMemory from "./useMemory";

const DURATION = 700;

const Container = styled.div`
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
  const { cards, classNames, turnCount, flip$, animationEnd$ } = useMemory({ duration: DURATION });

  return (
    <Container>
      <Grid>
        {cards.map((pairId, i) => (
          <Card
            key={i}
            classNames={classNames[i]}
            pairId={pairId}
            onTurn={() => flip$.next(i)}
            timeout={DURATION}
            onAnimationEnd={() => animationEnd$.next(i)}
          />
        ))}
      </Grid>
    </Container>
  );
};

export default Memory;
