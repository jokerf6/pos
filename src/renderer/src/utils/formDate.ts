export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);

  const formatted =
    `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ` +
    `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
  return formatted;
}

