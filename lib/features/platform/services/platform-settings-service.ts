import { PrismaPlatformSettingsRepository } from "../repositories/prisma-platform-settings-repository";
import type { UpdatePlatformSettingsDto } from "../types/platform-settings";

const repository = new PrismaPlatformSettingsRepository();

export async function getPlatformSettings() {
  let settings = await repository.find();

  if (!settings) {
    settings = await repository.create();
  }

  return settings;
}

export async function updatePlatformSettings(data: UpdatePlatformSettingsDto) {
  const existing = await repository.find();

  if (!existing) {
    return repository.create(data);
  }

  return repository.update(data);
}
