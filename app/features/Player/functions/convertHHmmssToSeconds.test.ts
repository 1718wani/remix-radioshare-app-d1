import { describe, expect, it } from "vitest";
import { convertHHMMSSToSeconds } from "~/features/Player/functions/convertHHmmssToSeconds";

describe("convertHHMMSSToSeconds", () => {
	// 正常系のテスト
	it('should convert "01:02:03" to 3723 seconds', () => {
		expect(convertHHMMSSToSeconds("01:02:03")).toBe(3723);
	});

	it('should convert "00:00:00" to 0 seconds', () => {
		expect(convertHHMMSSToSeconds("00:00:00")).toBe(0);
	});

	it('should convert "23:59:59" to 86399 seconds', () => {
		expect(convertHHMMSSToSeconds("23:59:59")).toBe(86399);
	});

	it("should return undefined for empty string input", () => {
		expect(convertHHMMSSToSeconds("")).toBeUndefined();
	});

	it('should return undefined for invalid format "01:02"', () => {
		expect(convertHHMMSSToSeconds("01:02")).toBeUndefined();
	});

	it('should return NaN for non-numeric input "abc:def:ghi"', () => {
		expect(convertHHMMSSToSeconds("abc:def:ghi")).toBeNaN();
	});
});
