import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import React from "react";

export const onRequest: PagesFunction = async () => {
	return new ImageResponse(
		<div style={{ display: "flex" }}>Hello, world!</div>,
		{
			width: 1200,
			height: 630,
		},
	);
};
