import { json } from "@remix-run/react";
import { createRemixStub } from "@remix-run/testing";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { render } from "~/test/render";
import { ShareButton } from "./ShareButton";

describe("投稿ボタンのテスト", async () => {
	test("ユーザーがログインしていない場合、LoginNavigateModalが開く", async () => {
		const RemixStub = createRemixStub([
			{
				path: "/",
				Component: ShareButton,
				loader() {
					return json({ user: null });
				},
			},
		]);
		render(<RemixStub />);

		await waitFor(() => {
			fireEvent.click(
				screen.getByRole("button", {
					name: "新しく切り抜きを投稿",
					hidden: true,
				}),
			);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});
	});

	test("投稿ボタンが正しくレンダリングされる", async () => {
		const RemixStub = createRemixStub([{ path: "/", Component: ShareButton }]);
		render(<RemixStub />);

		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: "新しく切り抜きを投稿" }),
			).toBeInTheDocument();
		});
	});
});
