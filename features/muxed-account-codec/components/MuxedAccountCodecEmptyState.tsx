import {Wrench} from "lucide-react";
import {EmptyState} from "@/core/ui";
import {copy} from "../copy";
export function MuxedAccountCodecEmptyState(){return <EmptyState icon={Wrench} title={copy.emptyTitle} description={copy.emptyDescription}/>;}
