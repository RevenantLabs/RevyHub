import { StatusMessage } from "@/core/ui/StatusMessage"; import { copy } from "@/features/contract-metadata-viewer/copy";
export function NoMetadataNotice() { return <StatusMessage type="info" title={copy.metadataTitle} description={copy.nonePublished} />; }
