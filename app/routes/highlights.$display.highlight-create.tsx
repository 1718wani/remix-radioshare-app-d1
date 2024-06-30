import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
	Autocomplete,
	Button,
	Flex,
	Modal,
	Select,
	Stack,
	Text,
	TextInput,
	Textarea,
	rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	type ActionFunctionArgs,
	type MetaFunction,
	json,
} from "@remix-run/cloudflare";
import {
	Form,
	useActionData,
	useNavigate,
	useNavigation,
	useParams,
	useRouteLoaderData,
} from "@remix-run/react";
import { useState } from "react";
import type { z } from "zod";
import { createHighlight } from "~/features/Highlight/apis/createHighlight";
import { validateHighlightData } from "~/features/Highlight/functions/validateHighlightData";

import { schemaForHighlightShare } from "~/features/Highlight/types/schemaForHighlightShare";
import { useToastForFormAction } from "~/features/Notification/hooks/useToastForFormAction";
import { getAllRadioshows } from "~/features/Radioshow/apis/getAllRadioshows";
import { useIsMobile } from "~/hooks/useIsMobile";
import type { loader as rootLoader } from "~/root";
import type { loader as highlightsLoader } from "~/routes/highlights.$display";

export const meta: MetaFunction = () => {
	return [
		{ title: "切り抜きシェア | RadiShare" },
		{
			name: "description",
			content:
				"新しい切り抜きを投稿するページです。ラジオ番組の切り抜きをシェアしましょう。",
		},
	];
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const radioshows = await getAllRadioshows(context);
	const radioshowsData = radioshows.map((show) => ({
		value: show.id.toString(),
		label: show.title,
	}));
	const schema: z.ZodTypeAny = schemaForHighlightShare(radioshowsData);

	const submission = parseWithZod(formData, { schema });

	if (submission.status !== "success") {
		return json({
			success: false,
			message: "データの送信に失敗しました",
			submission: submission.reply(),
		});
	}

	const highlightData = submission.value;

	// highlightDataがcreateHighlightType型に合致するか検証
	try {
		validateHighlightData(highlightData);
	} catch (error) {
		return json({ success: false, message: (error as Error).message });
	}

	await createHighlight(highlightData, request, context);
	const redirectUrl = "/highlights/all?orderBy=createdAt&ascOrDesc=desc&offset=0";
	const jsonData = { success: true, message: "切り抜きシェアが完了しました" };

	const headers = new Headers();
	headers.set("Location", redirectUrl);

	return json(jsonData, {
		status: 303,
		headers: headers,
	});
};

export default function HighlightCreate() {
	const [opened, { close }] = useDisclosure(true);
	const routeLoaderData = useRouteLoaderData<typeof rootLoader>("root");
	const highlightLoaderData = useRouteLoaderData<typeof highlightsLoader>(
		"routes/highlights.$display",
	);
	const { display } = useParams();
	const actionData = useActionData<typeof action>();
	const navigate = useNavigate();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const isMobileOs = useIsMobile();

	const radioshowsData = routeLoaderData
		? routeLoaderData.radioShows.map((show) => ({
				value: show.id.toString(),
				label: show.title,
			}))
		: [];

	// 現在のradioidに基づいてデフォルトの番組を見つける
	const defaultRadioshow = radioshowsData.find(
		(show) => show.value === display,
	);

	const [selectedRadioshow, setSelectedRadioshow] = useState(
		defaultRadioshow ? defaultRadioshow.label : "",
	);

	const [isEndTimeUnset, setIsEndTimeUnset] = useState(true);

	const schema: z.ZodTypeAny = schemaForHighlightShare(radioshowsData);

	const [
		form,
		{
			title,
			description,
			replayUrl,
			radioshowData,
			startHours,
			startMinutes,
			startSeconds,
			endHours,
			endMinutes,
			endSeconds,
		},
	] = useForm({
		constraint: getZodConstraint(schema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
	});

	const handleOpenRadioshowCreateModal = () => {
		navigate(`/highlights/${highlightLoaderData?.display}/radio-create`);
	};

	const handleCloseModal = () => {
		close();
		navigate(`/highlights/${highlightLoaderData?.display}`);
	};

	useToastForFormAction({ actionData });

	const hours = Array.from({ length: 4 }, (_, i) => ({
		value: i.toString().padStart(2, "0"),
		label: i.toString().padStart(2, "0"),
	}));
	const minutesAndSeconds = Array.from({ length: 60 }, (_, i) => ({
		value: i.toString().padStart(2, "0"),
		label: i.toString().padStart(2, "0"),
	}));

	return (
		<Modal
			title="切り抜きシェア"
			opened={opened}
			onClose={handleCloseModal}
			size={"lg"}
			fullScreen={isMobileOs}
		>
			<Form method="post" {...getFormProps(form)}>
				<Stack gap="md" mx={"xl"} mb={"xl"}>
					<Autocomplete
						label="番組名"
						placeholder="番組名"
						data={radioshowsData}
						maxDropdownHeight={200}
						value={selectedRadioshow}
						onChange={setSelectedRadioshow}
						error={radioshowData.errors}
						size="md"
					/>
					<input type="hidden" name="radioshowData" value={selectedRadioshow} />

					<TextInput
						{...getInputProps(title, { type: "text" })}
						name="title"
						placeholder="コーナー名/発言の内容など"
						label="タイトル"
						withAsterisk={false}
						error={title.errors}
						size="md"
					/>

					<Textarea
						{...getInputProps(description, { type: "text" })}
						name="description"
						defaultValue={""}
						placeholder="切り抜きの説明"
						label="説明（オプション）"
						error={description.errors}
						size="md"
					/>

					<TextInput
						{...getInputProps(replayUrl, { type: "url" })}
						name="replayUrl"
						placeholder="https://www.youtube.com/watch,https://open.spotify.com/episode"
						label="再生用リンク(SpotifyかYoutubeのみ)"
						error={replayUrl.errors}
						withAsterisk={false}
						size="md"
					/>
					<Stack gap={rem(3)}>
						<Text size="md" fw={500}>
							開始時間
						</Text>
						<Flex gap={"xs"} align={"center"}>
							<Select
								{...getInputProps(startHours, { type: "text" })}
								name="startHours"
								data={hours}
								defaultValue={"00"}
								withCheckIcon={false}
								clearable={false}
								allowDeselect={false}
								onChange={(value) => {
									if (isEndTimeUnset) {
										form.update({
											name: endHours.name,
											value: value || "00",
										});
									}
								}}
								size="md"
							/>
							<Text>:</Text>
							<Select
								{...getInputProps(startMinutes, { type: "text" })}
								name="startMinutes"
								data={minutesAndSeconds}
								defaultValue={"00"}
								withCheckIcon={false}
								clearable={false}
								allowDeselect={false}
								onChange={(value) => {
									if (isEndTimeUnset) {
										form.update({
											name: endMinutes.name,
											value: value || "00",
										});
									}
								}}
								size="md"
							/>
							<Text>:</Text>
							<Select
								{...getInputProps(startSeconds, { type: "text" })}
								name="startSeconds"
								data={minutesAndSeconds}
								defaultValue={"00"}
								withCheckIcon={false}
								clearable={false}
								allowDeselect={false}
								size="md"
							/>
						</Flex>
					</Stack>

					<Stack gap={rem(3)}>
						<Text size="md" fw={500}>
							終了時間
						</Text>
						<Flex gap={"xs"} align={"center"}>
							<Select
								defaultValue="00"
								onChange={() => setIsEndTimeUnset(false)}
								{...getInputProps(endHours, { type: "text" })}
								name="endHours"
								data={hours}
								withCheckIcon={false}
								clearable={false}
								allowDeselect={false}
								size="md"
							/>
							<Text>:</Text>
							<Select
								defaultValue="00"
								onChange={() => setIsEndTimeUnset(false)}
								{...getInputProps(endMinutes, { type: "text" })}
								name="endMinutes"
								data={minutesAndSeconds}
								withCheckIcon={false}
								clearable={false}
								allowDeselect={false}
								size="md"
							/>
							<Text>:</Text>
							<Select
								{...getInputProps(endSeconds, { type: "text" })}
								name="endSeconds"
								data={minutesAndSeconds}
								defaultValue={"00"}
								withCheckIcon={false}
								clearable={false}
								allowDeselect={false}
								size="md"
							/>
						</Flex>
						{(startHours.errors ||
							startMinutes.errors ||
							startSeconds.errors ||
							endHours.errors ||
							endMinutes.errors ||
							endSeconds.errors) && (
							<Text size="xs" c={"red"}>
								開始時間は終了時間より前に設定してください
							</Text>
						)}
					</Stack>

					<Button
						size="md"
						loading={isSubmitting}
						loaderProps={{ type: "oval" }}
						fullWidth={true}
						type="submit"
					>
						切り抜きをシェア
					</Button>
					<button
						type="button"
						onClick={handleOpenRadioshowCreateModal}
						style={{
							textDecoration: "none",
							width: "fit-content",
							cursor: "pointer",
							background: "none",
							border: "none",
							padding: 0,
						}}
					>
						<Text
							size="xs"
							variant="gradient"
							fw={700}
							gradient={{ from: "blue", to: "blue.3" }}
						>
							番組名が見つからない場合はこちらから作成
						</Text>
					</button>
				</Stack>
			</Form>
		</Modal>
	);
}
