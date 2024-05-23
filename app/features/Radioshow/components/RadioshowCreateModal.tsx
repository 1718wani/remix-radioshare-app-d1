import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  rem,
  Stack,
  TextInput,
  FileInput,
  Button,
  Modal,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Form } from "@remix-run/react";
import { IconCheck, IconPhoto, IconX } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { ZodObject, z } from "zod";
import { isRadioshowCreateModalOpenAtom } from "~/features/Player/atoms/isRadioshowCreateModalOpenAtom";
import { RadioshowCreateModalProps } from "~/routes/highlights";

export const radioshowCreateschema: ZodObject<{
  title: z.ZodString;
  headerImage: z.ZodEffects<z.ZodType<File, z.ZodTypeDef, File>>;
}> = z.object({
  title: z.string({ required_error: "タイトルは必要です" }),
  headerImage: z

    .instanceof(File, { message: "画像ファイルを選択してください" })
    .transform((file) => file)
    .refine((file) => file.size < 5 * 1024 * 1024, {
      message: "ファイルサイズは最大5MBです",
    })
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
      {
        message: ".jpeg .jpgもしくは.pngのみ可能です",
      }
    ),
});

export default function RadioshowCreateModal({ opened, close, data }:RadioshowCreateModalProps) {
  const [form, { title, headerImage }] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: radioshowCreateschema });
    },
  });

  const [, setIsRadioshowCreateModalOpen] = useAtom(
    isRadioshowCreateModalOpenAtom
  );

  useEffect(() => {
    if (!data) return;
    if (!data.success) {
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "送信に失敗しました",
        message: data.message,
        color: "red",
        icon: <IconX />,
      });
    }

    if (data.success && data.message === "番組登録が完了しました") {
      setIsRadioshowCreateModalOpen(false);
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "",
        message: data.message,
        color: "blue",
        icon: <IconCheck />,
      });
    }
  }, [data, setIsRadioshowCreateModalOpen]);

  const icon = (
    <IconPhoto style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
  );
  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="番組名を登録してください"
        size={"lg"}
        zIndex={3001}
      >
        <Form
          method="POST"
          action="/highlights"
          encType="multipart/form-data"
          {...getFormProps(form)}
        >
          <Stack gap="md" mx={"xl"}>
            <TextInput
              {...getInputProps(title, { type: "text" })}
              name="title"
              label="番組タイトル"
              placeholder="番組名"
              error={title.errors}
            />
            <FileInput
              name="headerImage"
              leftSection={icon}
              accept="image/png,image/jpeg,image/jpg"
              label="ヘッダー画像"
              placeholder="画像を選択してください"
              error={headerImage.errors}
            />
            <Button fullWidth type="submit">
              新規登録
            </Button>
          </Stack>
        </Form>
      </Modal>
    </>
  );
}
