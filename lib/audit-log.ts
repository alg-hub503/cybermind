/**
 * Minimal structured audit logging — a server log line, not a database table.
 *
 * Decision (2026-09): a full audit-log table was considered and deferred; a
 * structured log line is enough for v1 of school-role assignment. Revisit if
 * a real audit trail (queryable, tamper-evident) becomes a requirement.
 */

type RoleChangeEvent = {
  action: "assign" | "remove";
  actorId: string;
  targetUserId: string;
  schoolId: string;
  oldRoleId: string | null;
  newRoleId: string | null;
};

export function logRoleChange(event: RoleChangeEvent): void {
  console.log(
    JSON.stringify({
      type: "ROLE_CHANGE",
      timestamp: new Date().toISOString(),
      ...event,
    })
  );
}
