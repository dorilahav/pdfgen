// @ts-ignore
import { createRenderer } from '@react-pdf/renderer';

export const reconcilePdfContainer = (document: JSX.Element) => {
  const container = { type: 'ROOT', document: null };
  const renderer = createRenderer({});
  const mountNode = renderer.createContainer(container);

  renderer.updateContainer(document, mountNode);

  return container;
}