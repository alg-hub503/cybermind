# Workspace Policy

## Official Workspace

The official development workspace for this project is:

C:\Users\CyberMind-work

Reason:
- Builds successfully (
pm run build)
- Prisma works (
px prisma db push)
- No filesystem permission issues
- Contains the current active development on the develop branch

## Deprecated Workspace

Do NOT use:

C:\Users\CyberMind

Reason:
- Contains Windows permission corruption (EPERM / Access denied)
- pp/api/admin is inaccessible
- Not reliable for development

All future development should be performed from:

C:\Users\CyberMind-work
