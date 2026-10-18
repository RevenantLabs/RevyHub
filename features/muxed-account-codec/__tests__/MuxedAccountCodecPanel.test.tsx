import {expect,it} from "vitest";
import {renderFeature,screen} from "@/core/testing/render";
import {withMswHandlers} from "@/core/testing/msw";
import {MuxedAccountCodecPanel} from "../components/MuxedAccountCodecPanel";
import {copy} from "../copy";
import {sample} from "../fixtures/muxedAccountCodec.fixture";
withMswHandlers();
async function fill(user: ReturnType<typeof renderFeature>["user"]){for(const [key,value] of Object.entries(sample)){const spec=copy.fields[key as keyof typeof copy.fields] as {label:string;options?:readonly string[]};const control=screen.getByLabelText(spec.label);if(spec.options)await user.selectOptions(control,value);else{await user.clear(control);if(value)await user.click(control);if(value)await user.paste(value);}}}
it("renders a useful result and clears it on edits and reset",async()=>{const {user}=renderFeature(<MuxedAccountCodecPanel/>);expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();await fill(user);await user.click(screen.getByRole("button",{name:copy.submit}));expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();await user.click(screen.getByRole("button",{name:copy.reset}));expect(screen.queryByText(copy.resultTitle)).not.toBeInTheDocument();expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();});
it("shows input errors once",async()=>{const {user}=renderFeature(<MuxedAccountCodecPanel/>);await user.click(screen.getByRole("button",{name:copy.submit}));expect(await screen.findByRole("alert")).toBeInTheDocument();});

it("never retains a pasted seed in either address field",async()=>{const {user,container}=renderFeature(<MuxedAccountCodecPanel/>);for(const field of [copy.fields.muxed.label,copy.fields.base.label]){await user.click(screen.getByLabelText(field));await user.paste("S_SECRET_REJECTED");expect(screen.getByLabelText(field)).toHaveValue("");expect(container.innerHTML).not.toContain("S_SECRET_REJECTED");}});
