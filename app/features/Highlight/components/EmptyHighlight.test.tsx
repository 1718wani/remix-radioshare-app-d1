import { describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { EmptyHighlight } from "./EmptyHighlight";
import { render } from "~/test/render";

describe(EmptyHighlight, () => {
  test("配列が空の場合レンダリングされる", () => {
    render(<EmptyHighlight />);
    expect(screen.getByText("まだ登録されていません")).toBeInTheDocument();
  });
});
