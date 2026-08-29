"use client";

import React from "react";

export default function VisualFrame({ src, alt, className = "", overlay = false }) {
  return (
    <figure className={`relative overflow-hidden bg-[#070B14] ${className}`}>
      <img
        src={src}
        alt={alt}
        className="block w-full h-full object-cover object-center"
        draggable={false}
      />
      {overlay && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian-950/40 via-transparent to-transparent" />
      )}
    </figure>
  );
}
