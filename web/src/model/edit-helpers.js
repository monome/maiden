export const bufferIsEditable = (buffer) => {
  const contentType = buffer.get('contentType');
  return contentType.includes('text') || contentType.includes('application/json');
};

