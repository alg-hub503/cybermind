import {
  getPlatformSettings as getService,
  updatePlatformSettings as updateService,
} from "./services/platform-settings-service";
import type { UpdatePlatformSettingsDto } from "./types/platform-settings";

export const getPlatformSettings = () => getService();

export const updatePlatformSettings = (data: UpdatePlatformSettingsDto) =>
  updateService(data);
