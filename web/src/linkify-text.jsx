import React from 'react';

// Match explicit http(s) URLs only — no fuzzy host matching.
const HTTP_URL = /https?:\/\/[^\s<>"']+/g;

const linkifyText = (text) => {
  if (text == null || text === '') {
    return text;
  }

  const source = String(text);
  const nodes = [];
  let lastIndex = 0;
  let match;

  HTTP_URL.lastIndex = 0;
  while ((match = HTTP_URL.exec(source)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(source.slice(lastIndex, match.index));
    }
    const url = match[0];
    nodes.push(
      <a key={`${match.index}-${url}`} href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>,
    );
    lastIndex = match.index + url.length;
  }

  if (lastIndex === 0) {
    return source;
  }

  if (lastIndex < source.length) {
    nodes.push(source.slice(lastIndex));
  }

  return nodes;
};

export default linkifyText;
