export function formatDate(
  date: Date,
  format: string = "DD/MM/YYYY"
): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return format.replace("DD", dd).replace("MM", mm).replace("YYYY", yyyy);
}
