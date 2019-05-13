import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'ideas',
  name: 'admin Ideas',
  component: Loadable({
    loader: () => import('containers/Admin/ideas'),
    loading: LoadableLoadingAdmin,
    delay: 500
  }),
  indexRoute: {
    name: 'admin ideas index',
    component: Loadable({
      loader: () => import('containers/Admin/ideas/all'),
      loading: LoadableLoadingAdmin,
      delay: 500
    }),
  },
});