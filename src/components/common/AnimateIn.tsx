"use client";
import React from "react";
import { Easing, motion, Variants } from "framer-motion";

// Animation types
export type AnimationType =
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "slideInUp"
  | "slideInDown"
  | "slideInLeft"
  | "slideInRight"
  | "scaleIn"
  | "scaleInUp"
  | "scaleInDown"
  | "rotateIn"
  | "bounceIn"
  | "zoomIn"
  | "flipInX"
  | "flipInY"
  | "rollIn"
  | "lightSpeedIn"
  | "custom";

// Easing types
export type EasingType =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "circIn"
  | "circOut"
  | "circInOut"
  | "backIn"
  | "backOut"
  | "backInOut"
  | "anticipate"
  | "bounceIn"
  | "bounceOut"
  | "bounceInOut";

interface AnimateInProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  distance?: number;
  easing?: EasingType;
  once?: boolean;
  threshold?: number;
  className?: string;
  viewport?: {
    once?: boolean;
    margin?: string;
    amount?: number | "some" | "all";
  };
  customVariants?: Variants;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  disabled?: boolean;
}

// Easing configurations
const easingMap = {
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  circIn: [0.6, 0.04, 0.98, 0.335],
  circOut: [0.075, 0.82, 0.165, 1],
  circInOut: [0.785, 0.135, 0.15, 0.86],
  backIn: [0.6, -0.28, 0.735, 0.045],
  backOut: [0.175, 0.885, 0.32, 1.275],
  backInOut: [0.68, -0.55, 0.265, 1.55],
  anticipate: [0.215, 0.61, 0.355, 1],
  bounceIn: [0.25, 0.46, 0.45, 0.94],
  bounceOut: [0.55, 0.055, 0.675, 0.19],
  bounceInOut: [0.445, 0.05, 0.55, 0.95],
};

// Animation variants
const createVariants = (
  animation: AnimationType,
  distance: number,
  easing: EasingType,
  duration: number
): Variants => {
  const ease = easingMap[easing] || easingMap.easeOut;

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        duration,
        ease: ease as unknown as Easing[],
      },
    },
  };

  switch (animation) {
    case "fadeIn":
      variants.hidden = { opacity: 0 };
      variants.visible = { opacity: 1, ...variants.visible };
      break;

    case "fadeInUp":
      variants.hidden = { opacity: 0, y: distance };
      variants.visible = { opacity: 1, y: 0, ...variants.visible };
      break;

    case "fadeInDown":
      variants.hidden = { opacity: 0, y: -distance };
      variants.visible = { opacity: 1, y: 0, ...variants.visible };
      break;

    case "fadeInLeft":
      variants.hidden = { opacity: 0, x: -distance };
      variants.visible = { opacity: 1, x: 0, ...variants.visible };
      break;

    case "fadeInRight":
      variants.hidden = { opacity: 0, x: distance };
      variants.visible = { opacity: 1, x: 0, ...variants.visible };
      break;

    case "slideInUp":
      variants.hidden = { y: distance };
      variants.visible = { y: 0, ...variants.visible };
      break;

    case "slideInDown":
      variants.hidden = { y: -distance };
      variants.visible = { y: 0, ...variants.visible };
      break;

    case "slideInLeft":
      variants.hidden = { x: -distance };
      variants.visible = { x: 0, ...variants.visible };
      break;

    case "slideInRight":
      variants.hidden = { x: distance };
      variants.visible = { x: 0, ...variants.visible };
      break;

    case "scaleIn":
      variants.hidden = { opacity: 0, scale: 0 };
      variants.visible = { opacity: 1, scale: 1, ...variants.visible };
      break;

    case "scaleInUp":
      variants.hidden = { opacity: 0, scale: 0, y: distance };
      variants.visible = { opacity: 1, scale: 1, y: 0, ...variants.visible };
      break;

    case "scaleInDown":
      variants.hidden = { opacity: 0, scale: 0, y: -distance };
      variants.visible = { opacity: 1, scale: 1, y: 0, ...variants.visible };
      break;

    case "rotateIn":
      variants.hidden = { opacity: 0, rotate: -180 };
      variants.visible = { opacity: 1, rotate: 0, ...variants.visible };
      break;

    case "bounceIn":
      variants.hidden = { opacity: 0, scale: 0.3 };
      variants.visible = {
        opacity: 1,
        scale: 1,
        transition: {
          duration,
          ease: "backOut",
          scale: {
            type: "spring",
            damping: 10,
            stiffness: 100,
            restDelta: 0.001,
          },
        },
      };
      break;

    case "zoomIn":
      variants.hidden = { opacity: 0, scale: 0.5 };
      variants.visible = { opacity: 1, scale: 1, ...variants.visible };
      break;

    case "flipInX":
      variants.hidden = { opacity: 0, rotateX: -90 };
      variants.visible = { opacity: 1, rotateX: 0, ...variants.visible };
      break;

    case "flipInY":
      variants.hidden = { opacity: 0, rotateY: -90 };
      variants.visible = { opacity: 1, rotateY: 0, ...variants.visible };
      break;

    case "rollIn":
      variants.hidden = { opacity: 0, x: -distance, rotate: -120 };
      variants.visible = { opacity: 1, x: 0, rotate: 0, ...variants.visible };
      break;

    case "lightSpeedIn":
      variants.hidden = { opacity: 0, x: distance, skewX: -30 };
      variants.visible = {
        opacity: 1,
        x: 0,
        skewX: 0,
        transition: {
          duration: duration * 0.6,
          ease: "easeOut",
        },
      };
      break;

    default:
      variants.hidden = { opacity: 0 };
      variants.visible = { opacity: 1, ...variants.visible };
      break;
  }

  return variants;
};

const AnimateIn: React.FC<AnimateInProps> = ({
  children,
  animation = "fadeInUp",
  duration = 0.6,
  delay = 0,
  distance = 50,
  easing = "easeOut",
  once = true,
  threshold = 0.1,
  className,
  viewport,
  customVariants,
  onAnimationStart,
  onAnimationComplete,
  disabled = false,
}) => {
  // If disabled, return children without animation
  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  // Use custom variants if provided, otherwise create from animation type
  const variants =
    customVariants || createVariants(animation, distance, easing, duration);

  // Viewport configuration
  const viewportConfig = viewport || {
    once,
    margin: "0px 0px -100px 0px",
    amount: threshold,
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      variants={variants}
      transition={{
        delay,
        ...(variants.visible as { transition?: Record<string, unknown> })?.transition,
      }}
      onAnimationStart={onAnimationStart}
      onAnimationComplete={onAnimationComplete}
    >
      {children}
    </motion.div>
  );
};

export default AnimateIn;
