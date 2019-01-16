import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'insights',
  getComponent: loadAndRender(import('./')),
  indexRoute: {
    getComponent: loadAndRender(import('./All')),
  },
  childRoutes: [
    {
      path: 'new',
      getComponent: loadAndRender(import('./New')),
    },
  ],
});