import { describe, it, expect } from "vitest";
import { sanitizeFilename } from "@/utils/sanitize-filename";

describe("sanitizeFilename", () => {
  it("returns lowercase alphanumeric filenames unchanged", () => {
    expect(sanitizeFilename("filename")).toBe("filename");
    expect(sanitizeFilename("file123")).toBe("file123");
  });

  it("converts filenames to lowercase", () => {
    expect(sanitizeFilename("FileName")).toBe("filename");
    expect(sanitizeFilename("FILE_NAME")).toBe("file_name");
  });

  it("replaces invalid characters with dashes", () => {
    // Note that trailing dashes are removed by LEADING_OR_TRAILING_DOTS_AND_DASHES
    expect(sanitizeFilename('file<name>')).toBe("file-name");
    expect(sanitizeFilename('file:name')).toBe("file-name");
    expect(sanitizeFilename('file"name"')).toBe("file-name");
    expect(sanitizeFilename('file/name')).toBe("file-name");
    expect(sanitizeFilename('file\\name')).toBe("file-name");
    expect(sanitizeFilename('file|name')).toBe("file-name");
    expect(sanitizeFilename('file?name')).toBe("file-name");
    expect(sanitizeFilename('file*name')).toBe("file-name");

    // Multiple invalid characters together
    expect(sanitizeFilename('file<>:"/\\|?*name')).toBe("file-name");
  });

  it("replaces whitespace with dashes", () => {
    expect(sanitizeFilename("file name")).toBe("file-name");
    expect(sanitizeFilename("file   name")).toBe("file-name");
    expect(sanitizeFilename("file\tname")).toBe("file-name");
    expect(sanitizeFilename("file\nname")).toBe("file-name");
  });

  it("collapses multiple consecutive dashes into a single dash", () => {
    expect(sanitizeFilename("file--name")).toBe("file-name");
    expect(sanitizeFilename("file---name")).toBe("file-name");
    // Invalid characters and whitespace replaced by dashes should collapse
    expect(sanitizeFilename("file < > name")).toBe("file-name");
  });

  it("removes leading and trailing dots and dashes", () => {
    expect(sanitizeFilename(".filename")).toBe("filename");
    expect(sanitizeFilename("..filename")).toBe("filename");
    expect(sanitizeFilename("-filename")).toBe("filename");
    expect(sanitizeFilename("-.filename")).toBe("filename");
    expect(sanitizeFilename("filename.")).toBe("filename");
    expect(sanitizeFilename("filename..")).toBe("filename");
    expect(sanitizeFilename("filename-")).toBe("filename");
    expect(sanitizeFilename("filename.-")).toBe("filename");
    expect(sanitizeFilename(".-filename.-")).toBe("filename");
  });

  it("normalizes unicode characters (NFKC)", () => {
    // \uFB01 is the "fi" ligature
    expect(sanitizeFilename(" \uFB01le ")).toBe("file");
    // Full-width characters
    expect(sanitizeFilename("ｆｉｌｅ")).toBe("file");
  });

  it("returns the default fallback ('export') if the result is empty", () => {
    expect(sanitizeFilename("")).toBe("export");
    expect(sanitizeFilename("   ")).toBe("export");
    expect(sanitizeFilename("...")).toBe("export");
    expect(sanitizeFilename("---")).toBe("export");
    expect(sanitizeFilename("<>:")).toBe("export");
  });

  it("returns the custom fallback if provided and the result is empty", () => {
    expect(sanitizeFilename("", "custom")).toBe("custom");
    expect(sanitizeFilename("   ", "custom")).toBe("custom");
    expect(sanitizeFilename("...", "custom")).toBe("custom");
    expect(sanitizeFilename("---", "custom")).toBe("custom");
    expect(sanitizeFilename("<>:", "custom")).toBe("custom");
  });
});
