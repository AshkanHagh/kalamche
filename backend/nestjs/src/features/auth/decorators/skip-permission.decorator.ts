import { SetMetadata } from "@nestjs/common";

export const SkipPermission = () => SetMetadata("skip-permission", true);
