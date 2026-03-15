// Shared spring values keep motion consistent so drag, spacing, and snap all feel physically related.
export const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

export const quickSpringConfig = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
};

export const overlayDropAnimation = {
  duration: 250,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
};
