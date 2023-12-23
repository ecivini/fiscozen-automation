export function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
