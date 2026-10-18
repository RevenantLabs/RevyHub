import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { ManageDataCodecPanel } from "@/features/manage-data-codec/components/ManageDataCodecPanel";
import { copy, errorCopy } from "@/features/manage-data-codec/copy";
import {
  binaryHexValue,
  controlBytesHexValue,
  multibyteNameAtLimit,
  multibyteNameOverLimit,
  nonHexValue,
  secretSeed,
  simpleName,
  simpleValue
} from "@/features/manage-data-codec/fixtures/manageDataCodec.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function fill(user: User, field: string, text: string) {
  await user.click(screen.getByLabelText(field));
  await user.paste(text);
}

async function build(
  user: User,
  { name = simpleName, value = simpleValue, encoding = "", mode = "" } = {}
) {
  if (mode) await user.selectOptions(screen.getByLabelText(copy.modeLabel), mode);
  await fill(user, copy.nameLabel, name);
  if (encoding) await user.selectOptions(screen.getByLabelText(copy.encodingLabel), encoding);
  if (value) await fill(user, copy.valueLabel, value);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("ManageDataCodecPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<ManageDataCodecPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows byte lengths, every encoding and the operation XDR", async () => {
    const { user } = renderFeature(<ManageDataCodecPanel />);
    await build(user);

    expect(await screen.findByText(copy.operationTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.xdrNote)).toBeInTheDocument();
    expect(screen.getByText(copy.decodedTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.roundTripNote)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Copy ${copy.copyXdr}` })
    ).toBeInTheDocument();
  });

  it("hides the value inputs entirely in delete mode", async () => {
    const { user } = renderFeature(<ManageDataCodecPanel />);

    await user.selectOptions(screen.getByLabelText(copy.modeLabel), "delete");

    // Hidden, not disabled: a deletion carries no value at all.
    expect(screen.queryByLabelText(copy.valueLabel)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(copy.encodingLabel)).not.toBeInTheDocument();
  });

  it("says a deletion is not the same as an empty value", async () => {
    const { user } = renderFeature(<ManageDataCodecPanel />);
    await build(user, { mode: "delete", value: "" });

    expect(await screen.findByText(copy.deleteTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.valuePresentNo)).toBeInTheDocument();
  });

  it("says a zero-byte value keeps the entry alive", async () => {
    const { user } = renderFeature(<ManageDataCodecPanel />);
    await build(user, { value: "" });

    expect(await screen.findByText(copy.emptyValueTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.valuePresentYes)).toBeInTheDocument();
  });

  it("shows hex only for bytes that are not valid text", async () => {
    const { user } = renderFeature(<ManageDataCodecPanel />);
    await build(user, { value: binaryHexValue, encoding: "hex" });

    expect(await screen.findByText(copy.binaryNotice)).toBeInTheDocument();
    expect(screen.getByText(copy.noText)).toBeInTheDocument();
    // The hex is copyable, so the full value lives on the title attribute.
    expect(screen.getByTitle(binaryHexValue)).toBeInTheDocument();
  });

  it("escapes control characters instead of rendering them", async () => {
    const { user } = renderFeature(<ManageDataCodecPanel />);
    await build(user, { value: controlBytesHexValue, encoding: "hex" });

    expect(await screen.findByText(copy.controlNotice)).toBeInTheDocument();
    expect(screen.getByText("A\\u0000B")).toBeInTheDocument();
    expect(document.body.textContent ?? "").not.toContain(String.fromCharCode(0));
  });

  it("explains a multibyte name whose bytes outnumber its characters", async () => {
    const { user } = renderFeature(<ManageDataCodecPanel />);
    await build(user, { name: multibyteNameAtLimit });

    expect(await screen.findByText(copy.multibyteNotice)).toBeInTheDocument();
    expect(screen.getByText("64 of 64 bytes")).toBeInTheDocument();
    expect(screen.getByText("32 characters")).toBeInTheDocument();
  });

  it("rejects a name that is short in characters but over in bytes", async () => {
    const { user } = renderFeature(<ManageDataCodecPanel />);
    await build(user, { name: multibyteNameOverLimit });

    expect(await screen.findByText(errorCopy.name_too_long.title)).toBeInTheDocument();
  });

  it("explains an undecodable value", async () => {
    const { user } = renderFeature(<ManageDataCodecPanel />);
    await build(user, { value: nonHexValue, encoding: "hex" });

    expect(await screen.findByText(errorCopy.invalid_encoding.title)).toBeInTheDocument();
  });

  it("refuses a pasted secret key and clears it out of the field", async () => {
    const { container, user } = renderFeature(<ManageDataCodecPanel />);
    await build(user, { value: secretSeed });

    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    expect(screen.getByLabelText<HTMLTextAreaElement>(copy.valueLabel).value).toBe("");
    expect(screen.getByLabelText<HTMLInputElement>(copy.nameLabel).value).toBe("");
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });

  it("clears every field and the result on reset", async () => {
    const { user } = renderFeature(<ManageDataCodecPanel />);
    await build(user);
    await screen.findByText(copy.operationTitle);

    await user.click(screen.getByRole("button", { name: copy.resetAll }));

    expect(screen.getByLabelText<HTMLInputElement>(copy.nameLabel).value).toBe("");
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });
});
