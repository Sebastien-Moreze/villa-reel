'use client';

import React, { useEffect, useState } from "react";

type LetterData = {
  char: string;
  /* Phase 1 — pluie : départ aléatoire au-dessus */
  rx: number;   // décalage horizontal de départ (px)
  ry: number;   // hauteur de départ (négatif = au-dessus)
  rot: number;  // rotation de chute
  /* Phase 2 — vent : dispersion */
  wx: number;   // déplacement horizontal vent
  wy: number;   // déplacement vertical vent
  wrot: number; // rotation vent
  /* Timing */
  delay: number; // décalage de départ (ms)
};

const KEYFRAMES = `
@keyframes letterRainWind {
  0% {
    opacity: 0;
    transform: translateY(var(--ry)) translateX(var(--rx)) rotate(var(--rot));
  }
  30% {
    opacity: 1;
    transform: translateY(0px) translateX(0px) rotate(0deg);
  }
  52% {
    opacity: 0.5;
    transform: translateY(var(--wy)) translateX(var(--wx)) rotate(var(--wrot));
  }
  70% {
    opacity: 0.75;
    transform:
      translateY(calc(var(--wy) * -0.25))
      translateX(calc(var(--wx) * -0.25))
      rotate(calc(var(--wrot) * -0.15));
  }
  100% {
    opacity: 1;
    transform: translateY(0px) translateX(0px) rotate(0deg);
  }
}
`;

export function AnimatedTitle({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [letters, setLetters] = useState<LetterData[] | null>(null);
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    const data: LetterData[] = text.split("").map((char, i) => ({
      char,
      rx:    Math.round(Math.random() * 240 - 120),
      ry:    -Math.round(Math.random() * 180 + 100),
      rot:   Math.round(Math.random() * 200 - 100),
      wx:    Math.round(Math.random() * 350 - 175),
      wy:    Math.round(Math.random() * 120 - 60),
      wrot:  Math.round(Math.random() * 400 - 200),
      delay: i * 45 + Math.round(Math.random() * 60),
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLetters(data);

    /* Retire les styles d'animation une fois terminée (perf) */
    const maxDelay = data.reduce((m, l) => Math.max(m, l.delay), 0);
    const timer = setTimeout(() => setAnimDone(true), maxDelay + 2600);
    return () => clearTimeout(timer);
  }, [text]);

  /* Rendu SSR : invisible jusqu'au JS */
  if (!letters) {
    return (
      <span className={className} style={{ opacity: 0 }}>
        {text}
      </span>
    );
  }

  return (
    <>
      {/* Keyframes injectées une seule fois */}
      {!animDone && <style>{KEYFRAMES}</style>}

      <span className={className}>
        {letters.map((l, i) =>
          l.char === " " ? (
            <span key={i} style={{ display: "inline-block", width: "0.3em" }} />
          ) : (
            <span
              key={i}
              style={
                animDone
                  ? { display: "inline-block" }
                  : ({
                      display: "inline-block",
                      animation: `letterRainWind 2.4s cubic-bezier(0.22, 1, 0.36, 1) ${l.delay}ms both`,
                      "--rx":   `${l.rx}px`,
                      "--ry":   `${l.ry}px`,
                      "--rot":  `${l.rot}deg`,
                      "--wx":   `${l.wx}px`,
                      "--wy":   `${l.wy}px`,
                      "--wrot": `${l.wrot}deg`,
                    } as React.CSSProperties)
              }
            >
              {l.char}
            </span>
          )
        )}
      </span>
    </>
  );
}
