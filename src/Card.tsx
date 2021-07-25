import React, { useRef } from "react";
import styled, { keyframes } from "styled-components";
import backImg from "./images/back.png";

const ctx = require.context("./images", false, /img/);
const keys = ctx.keys();
const files = keys.map<any>(ctx).map(module => module.default as string);

files.forEach(file => fetch(file));

export interface Props {
  className: string;
  pairId: number;
  onTurn: () => void;
  onTransition: () => void;
  animationDuration: number;
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

const Content = styled.div<Pick<Props, "pairId" | "animationDuration">>`
  width: 144px;
  height: 192px;
  border-radius: 8px;
  animation-duration: ${props => props.animationDuration}ms;
  background-image: ${props => `url("${files[props.pairId]}");`};
  background-size: 100%;

  &.bg {
    background-image: url("${backImg}");
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

const Card: React.VFC<Props> = ({ onTurn, onTransition, ...rest }) => {
  const step = useRef(0);

  const animationEnd = () => {
    if (!((++step.current % 5) % 2)) onTransition();
  };

  const mouseDown = () => {
    if (step.current % 5) return;
    step.current++;
    onTurn();
  };

  return (
    <Perspective>
      <Content onMouseDown={mouseDown} onAnimationEnd={animationEnd} {...rest} />
    </Perspective>
  );
};

export default Card;
