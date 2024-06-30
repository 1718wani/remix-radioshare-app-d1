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
