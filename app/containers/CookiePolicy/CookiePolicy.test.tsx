import React from 'react';
import 'jest-styled-components';
jest.mock('utils/cl-intl');
jest.mock('services/pages');
jest.mock('utils/eventEmitter');
import { CookiePolicy } from './';
import eventEmitter from 'utils/eventEmitter';

import { shallowWithIntl } from 'utils/testUtils/withIntl';
import { shallow } from 'enzyme';

const emit = eventEmitter.emit as jest.Mock;

describe('<CookiePolicy />', () => {
  it('renders correctly', () => {
    const wrapper = shallowWithIntl(<CookiePolicy />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly openConsentManager button', () => {
    const wrapper = shallowWithIntl(<CookiePolicy />);
    const cookieMessage = wrapper.find('FormattedMessage.cookiePreferencesMessage');
    const values = cookieMessage.props().values;
    const prefbutton = values && values.changePreferencesButton as JSX.Element | null;
    const button = prefbutton && shallow(prefbutton);
    expect(button).toMatchSnapshot();
  });

  /* this is a pretty reliant on the implementation way to test that it opens consent manager.
  */
  it('has a functional openConsentManager Button', () => {
    // render component
    const wrapper = shallowWithIntl(<CookiePolicy />);
    expect(eventEmitter.emit).toBeCalledTimes(0);

    const cookieMessage = wrapper.find('FormattedMessage.cookiePreferencesMessage');
    const values = cookieMessage.props().values;
    const prefbutton = values && values.changePreferencesButton as JSX.Element | null;
    const button = prefbutton && shallow(prefbutton);
    button && button.simulate('click');
    expect(eventEmitter.emit).toBeCalledTimes(1);
    expect(emit.mock.calls[0][1]).toBe('openConsentManager');
  });
});