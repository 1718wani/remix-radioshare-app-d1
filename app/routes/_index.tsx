import {
	type LinksFunction,
	type MetaFunction,
	redirect,
} from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
	return [
		{ title: "RadiShare | ラジオ番組の切り抜きシェアサービス" },
		{
			name: "description",
			content:
				"お気に入りのラジオ番組の切り抜きを共有し、新しい発見をしよう。RadiShareは、ラジオファンのためのコミュニティプラットフォームです。",
		},
		{
			property: "og:title",
			content: "RadiShare",
		},
		{
			property: "og:description",
			content: "RadiShareはラジオ切り抜きシェアサービスです。",
		},
		{
			property: "og:image",
			content: "https://aikunapp.org/radishare-header.png",
		},
	];
};

export const links: LinksFunction = () => [
	{
		rel: "icon",
		href: "/favicon.ico",
		type: "image/x-icon",
	},
];

export const loader = async () => {
	return redirect("/highlights/all");
};

export default function Index() {
	return <></>;
}
