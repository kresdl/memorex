import React, { useRef } from "react";
import styled, { keyframes } from "styled-components";

export interface Props {
  classNames: string;
  pairId: number;
  onTurn: () => void;
  onAnimationEnd: () => void;
  timeout: number;
}

const Perspective = styled.div`
  perspective: 400px;
`;

const bgCW90 = keyframes`
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(90deg); }
`;

const fgCW90 = keyframes`
  0% { transform: rotateY(-90deg); }
  100% { transform: rotateY(0deg); }
`;

const fgCCW90 = keyframes`
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(-90deg); }
`;

const bgCCW90 = keyframes`
  0% { transform: rotateY(90deg); }
  100% { transform: rotateY(0deg); }
`;

const Content = styled.div<Pick<Props, "pairId" | "timeout">>`
  width: 144px;
  height: 192px;
  border-radius: 8px;
  animation-duration: ${props => props.timeout}ms;
  background-image: ${props => `url("./images/img${props.pairId + 1}.png");`};
  background-size: 100%;

  &.bg {
    background-image: url("./images/back.png");
  }

  &.bg-cw90 {
    animation-timing-function: ease-in;
    animation-name: ${bgCW90};
  }

  &.fg-cw90 {
    animation-timing-function: ease-out;
    animation-name: ${fgCW90};
  }

  &.fg-ccw90 {
    animation-timing-function: ease-in;
    animation-name: ${fgCCW90};
  }

  &.bg-ccw90 {
    animation-timing-function: ease-out;
    animation-name: ${bgCCW90};
  }
`;

const Card: React.VFC<Props> = ({ onTurn, timeout, classNames, pairId, onAnimationEnd }) => {
  const duration = timeout / 2;
  const stepCount = useRef(0);

  const animationEnd = () => {
    stepCount.current = (stepCount.current + 1) % 5;
    onAnimationEnd();
  };

  const onMouseDown = () => {
    if (!stepCount.current) {
      stepCount.current++;
      onTurn();
    }
  };

  return (
    <Perspective>
      <Content
        timeout={duration}
        onMouseDown={onMouseDown}
        className={classNames}
        pairId={pairId}
        onAnimationEnd={animationEnd}
      />
    </Perspective>
  );
};

export default Card;
