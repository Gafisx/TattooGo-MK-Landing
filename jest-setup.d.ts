import "@testing-library/jest-dom";

declare global {
  // Jest/matchers are intentionally unused here.
  // The project test setup imports @testing-library/jest-dom and vitest-axe,
  // and vitest is configured with globals:true, so test files use those
  // matchers directly. This file exists only to keep TypeScript aware of the
  // project's test globals when needed.
}
