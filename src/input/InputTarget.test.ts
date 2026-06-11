import { describe, expect, it } from "@jest/globals";
import { isTypingTarget } from "./InputTarget";

describe("isTypingTarget", () => {
  it("detects editable text targets", () => {
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const editable = document.createElement("div");

    editable.contentEditable = "true";

    expect(isTypingTarget(input)).toBe(true);
    expect(isTypingTarget(textarea)).toBe(true);
    expect(isTypingTarget(editable)).toBe(true);
  });

  it("ignores non-editable and missing targets", () => {
    expect(isTypingTarget(document.createElement("button"))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});
