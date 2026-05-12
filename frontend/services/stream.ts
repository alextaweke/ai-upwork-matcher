export async function streamProposal(
  description: string,
  onChunk: (text: string) => void,
) {
  const response = await fetch(
    `http://localhost:8000/api/stream-proposal/?description=${encodeURIComponent(description)}`,
  );

  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    onChunk(decoder.decode(value));
  }
}
