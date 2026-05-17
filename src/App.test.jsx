import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import App from "./App.jsx";

it("renders the product shell", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: /binge tracker/i })).toBeInTheDocument();
});
