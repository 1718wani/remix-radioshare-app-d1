import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { render } from "~/test/render";
import { EmptyHighlight } from "./EmptyHighlight";

describe(EmptyHighlight, () => {
	test("配列が空の場合レンダリングされる", () => {
		render(<EmptyHighlight />);
		expect(screen.getByText("まだ登録されていません")).toBeInTheDocument();
	});
});
