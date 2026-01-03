"use client";

import { motion, useInView, Variant } from "motion/react";
import { useRef, useMemo, type ElementType } from "react";
import { cn } from "@/lib/utils";

type AnimationType = "blurIn" | "blurInUp" | "fadeIn" | "slideUp";
type AnimationBy = "character" | "word" | "line" | "text";

interface TextAnimateProps {
  children: string;
  animation?: AnimationType;
  by?: AnimationBy;
  as?: ElementType;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  style?: React.CSSProperties;
}

const animationVariants: Record<
  AnimationType,
  { hidden: Variant; visible: Variant }
> = {
  blurIn: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
  blurInUp: {
    hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
};

export function TextAnimate({
  children,
  animation = "blurIn",
  by = "word",
  as: Component = "p",
  className,
  delay = 0,
  duration = 0.5,
  once = true,
  style,
}: TextAnimateProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.1 });

  const segments = useMemo(() => {
    if (by === "text") return [children];
    if (by === "line") return children.split("\n");
    if (by === "word") return children.split(" ");
    if (by === "character") return children.split("");
    return [children];
  }, [children, by]);

  const variants = animationVariants[animation];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: by === "text" ? 0 : by === "line" ? 0.3 : by === "word" ? 0.1 : 0.03,
        delayChildren: delay,
      },
    },
  };

  if (by === "text") {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div
          variants={variants}
          transition={{ duration }}
          className={cn(className)}
        >
          {Component === "p" || Component === "span" || Component === "div" ? (
            <Component className={cn(className)}>{children}</Component>
          ) : (
            children
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <Component ref={ref} className={cn(className)} style={style}>
      <motion.span
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
        style={{ display: "inline-block" }}
      >
        {segments.map((segment, i) => (
          <motion.span
            key={`${segment}-${i}`}
            variants={variants}
            transition={{ duration }}
            style={{ display: "inline-block" }}
          >
            {segment}
            {by === "word" && i < segments.length - 1 && "\u00A0"}
            {by === "line" && i < segments.length - 1 && <br />}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
}
