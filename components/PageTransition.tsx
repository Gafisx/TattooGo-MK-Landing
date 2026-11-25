import { ViewTransition, type ReactNode } from "react";

const PAGE_TRANSITION_MAP = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
} as const;

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={PAGE_TRANSITION_MAP}
      exit={PAGE_TRANSITION_MAP}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
