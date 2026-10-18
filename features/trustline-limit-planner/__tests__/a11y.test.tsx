import {it} from "vitest";
import {renderFeature,screen} from "@/core/testing/render";
import {expectNoAxeViolations} from "@/core/testing/axe";
import {withMswHandlers} from "@/core/testing/msw";
import {TrustlineLimitPlannerPanel} from "../components/TrustlineLimitPlannerPanel";
import {copy} from "../copy";
import {sample} from "../fixtures/trustlineLimitPlanner.fixture";
withMswHandlers();
async function fill(user: ReturnType<typeof renderFeature>["user"]){for(const [key,value] of Object.entries(sample)){const spec=copy.fields[key as keyof typeof copy.fields] as {label:string;options?:readonly string[]};const control=screen.getByLabelText(spec.label);if(spec.options)await user.selectOptions(control,value);else{await user.clear(control);if(value)await user.click(control);if(value)await user.paste(value);}}}
it("passes axe initially",async()=>{const {container}=renderFeature(<TrustlineLimitPlannerPanel/>);await expectNoAxeViolations(container);});
it("passes axe with a result",async()=>{const {container,user}=renderFeature(<TrustlineLimitPlannerPanel/>);await fill(user);await user.click(screen.getByRole("button",{name:copy.submit}));await screen.findByText(copy.resultTitle);await expectNoAxeViolations(container);});
