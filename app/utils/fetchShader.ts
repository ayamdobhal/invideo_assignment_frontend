export async function fetchShader(description: string): Promise<string> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/generate_shader`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      }
    );
    const data = await response.json();
    return data.shader || "Error generating shader";
  } catch (error) {
    return `Request failed due to: ${error}`;
  }
}
