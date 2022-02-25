export const bufferIsEditable = buffer => {
  const contentType = buffer.get('contentType');
  return contentType.includes('text') || contentType.includes('application/json');
};

export const bufferIsAudio = buffer => {
  const contentType = buffer.get('contentType');
  return contentType.includes('audio');
};
