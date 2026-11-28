it.skip('renders without crashing', async () => {
  const React = (await import('react')).default;
  const { createRoot } = await import('react-dom/client');
  const { default: App } = await import('./app');
  const div = document.createElement('div');
  createRoot(div).render(<App />);
});
