import vercelOGPagesPlugin from "@cloudflare/pages-plugin-vercel-og";

interface Props {
	ogTitle: string;
}

export const onRequest = vercelOGPagesPlugin<Props>({
	imagePathSuffix: "/social-image.png",
	component: ({ ogTitle }) => {
		return <div style={{ display: "flex" }}>{ogTitle}</div>;
	},
	extractors: {
		on: {
			'meta[property="og:title"]': (props) => ({
				element(element) {
					const content = element.getAttribute("content");
					props.ogTitle = content ?? "";
				},
			}),
		},
	},
	autoInject: {
		openGraph: true,
	},
});
