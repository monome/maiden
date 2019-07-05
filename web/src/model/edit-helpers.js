export const bufferIsEditable = (buffer) => {
  const contentType = buffer.get('contentType');
  const editable = contentType.includes('text') || contentType.includes('application/json');
  console.log('buffer editable: ', editable, contentType);
  return editable;
};

