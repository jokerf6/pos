export default function ErrorMessage({ error }: { error: string }) {
  return <p className="text-red-500">{error}</p>;
}
