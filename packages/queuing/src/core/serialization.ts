export const serializeJsonContent = (content: unknown): Buffer => {
  const contentAsString = JSON.stringify(content);

  return Buffer.from(contentAsString);
}

export const deserializeJsonContent = <T>(buffer: Buffer): T => {
  const contentAsString = buffer.toString();

  return JSON.parse(contentAsString);
}