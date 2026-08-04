import { prisma } from "@/lib/prisma";
import type { UpdatePlatformSettingsDto } from "../types/platform-settings";

const SINGLETON_ID = "singleton";

export class PrismaPlatformSettingsRepository {
  find() {
    return prisma.platformSettings.findUnique({
      where: { id: SINGLETON_ID },
    });
  }

  create(data: Partial<UpdatePlatformSettingsDto> = {}) {
    return prisma.platformSettings.create({
      data: {
        id: SINGLETON_ID,
        ...data,
      },
    });
  }

  update(data: UpdatePlatformSettingsDto) {
    return prisma.platformSettings.update({
      where: { id: SINGLETON_ID },
      data,
    });
  }
}
