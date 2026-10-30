"use client";

export function GuideCorners() {
  const positions = [
    "left-4 top-4 border-l border-t",
    "right-4 top-4 border-r border-t",
    "left-4 bottom-4 border-b border-l",
    "right-4 bottom-4 border-b border-r",
  ];

  return (
    <>
      {positions.map((position) => (
        <div
          key={position}
          className={`absolute z-20 h-12 w-12 border-[3px] border-[var(--signal)] ${position}`}
        />
      ))}
    </>
  );
}
