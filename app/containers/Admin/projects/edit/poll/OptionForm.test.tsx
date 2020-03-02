import React from 'react';

import { shallow } from 'enzyme';

import { OptionForm } from './OptionForm';

import { mockQuestion } from 'services/__mocks__/pollQuestions';
import { mockOption } from 'services/__mocks__/pollOptions';

jest.mock('components/T', () => 'T');
jest.mock('components/UI/Button', () => 'Button');
jest.mock('semantic-ui-react', () => ({ Icon: 'Icon' }));
jest.mock('components/admin/ResourceList', () => ({ Row: 'Row', TextCell: 'TextCell', List: 'List' }));
jest.mock('./FormOptionRow', () => 'FormOptionRow');
jest.mock('./OptionRow', () => 'OptionRow');
jest.mock('./QuestionDetailsForm', () => 'QuestionDetailsForm');
jest.mock('utils/cl-intl', () => ({ FormattedMessage: 'FormattedMessage' }));

const mockOptions: IPollQuestion[];
const question = mockQuestion('questionId', 'What is your favourite ice cream flavour ?');

describe('<OptionForm/>', () => {
  it('clicking done calls the collapse handler', () => {
    const collapse = jest.fn();
    const wrapper = shallow(
      <OptionForm
        question={question}
        collapse={collapse}
        locale="en"
        pollOptions={null}
      />
    );
    wrapper.find('.e2e-collapse-option-form').simulate('click');
    expect(collapse).toHaveBeenCalledTimes(1);
  });

  describe('boundaries', () => {
    it('renders correctly with when pollOptions is null', () => {
      const wrapper = shallow(
        <OptionForm
          question={question}
          collapse={jest.fn()}
          locale="en"
          pollOptions={null}
        />
      );
      expect(wrapper.find('OptionRow').exists()).toBe(false);
      expect(wrapper.find('.e2e-add-option').exists()).toBe(true);
    });
    it('renders correctly with when pollOptions is []', () => {

      const wrapper = shallow(
        <OptionForm
          question={question}
          collapse={jest.fn()}
          locale="en"
          pollOptions={[]}
        />
      );
      expect(wrapper.find('OptionRow').exists()).toBe(false);
      expect(wrapper.find('.e2e-add-option').exists()).toBe(true);
    });
  });
  describe('displays question settings form', () => {
    it('displays', () => {
      const pollOptions = ['Vanilla', 'Pistachio', 'Raspberry']
        .map((item, index) => mockOption(index, item));
      const wrapper = shallow(
        <OptionForm
          question={question}
          collapse={jest.fn()}
          locale="en"
          pollOptions={pollOptions}
        />
      );
      expect(wrapper.find('.e2e-add-option').exists()).toBe(true);
      expect(wrapper.find('QuestionDetailsForm').exists()).toBe(true);
    });
  });
  describe('displays passed in options', () => {
    it('shows the right amount', () => {
      const pollOptions = ['Vanilla', 'Pistachio', 'Raspberry']
        .map((item, index) => mockOption(index, item));
      const wrapper = shallow(
        <OptionForm
          question={question}
          collapse={jest.fn()}
          locale="en"
          pollOptions={pollOptions}
        />
      );
      expect(wrapper.find('OptionRow').length).toBe(3);
    });
    it('passes down options', () => {
      const wrapper = shallow(
        <OptionForm
          question={question}
          collapse={jest.fn()}
          locale="en"
          pollOptions={[mockOption('vanillaId', 'Vanilla')]}
        />
      );
      expect(wrapper.find('OptionRow').find(item => item.prop('pollOptionId') === 'vanillaId')).toBeTruthy();
    });
    it('List reacts to addition', () => {
      const pollOptions = ['Vanilla', 'Pistachio', 'Raspberry']
        .map((item, index) => mockOption(index, item));
      const wrapper = shallow(
        <OptionForm
          question={question}
          collapse={jest.fn()}
          locale="en"
          pollOptions={pollOptions}
        />
      );
      wrapper.setProps({ pollOptions: [...pollOptions, mockOption('chocolateId', 'Chocolate')] });
      expect(wrapper.find('OptionRow').length).toBe(4);
    });
    it('List reacts to deletion', () => {
      const pollOptions = ['Vanilla', 'Pistachio', 'Raspberry']
        .map((item, index) => mockOption(index, item));
      const wrapper = shallow(
        <OptionForm
          question={question}
          collapse={jest.fn()}
          locale="en"
          pollOptions={pollOptions}
        />
      );
      pollOptions.splice(1, 1);

      wrapper.setProps({ pollOptions: [...pollOptions] });
      expect(wrapper.find('OptionRow').length).toBe(2);
    });
    describe('handles the new question form', () => {
      it('opens it', () => {
        const wrapper = shallow(
          <OptionForm
            question={question}
            collapse={jest.fn()}
            locale="en"
            pollOptions={null}
          />
        );
        expect(wrapper.find('FormOptionRow').exists()).toBe(false);
        wrapper.find('.e2e-add-option').simulate('click');
        const getFormOptionRow = () => wrapper.find('FormOptionRow');
        expect(getFormOptionRow().exists()).toBe(true);
      });
      it('hides the add button while new form is open', () => {
        const wrapper = shallow(
          <OptionForm
            question={question}
            collapse={jest.fn()}
            locale="en"
            pollOptions={null}
          />
        );
        wrapper.find('.e2e-add-option').simulate('click');
        expect(wrapper.find('.e2e-add-option').exists()).toBe(false);
      });
      it('passes down a handler to close the form', () => {
        const wrapper = shallow(
          <OptionForm
            question={question}
            collapse={jest.fn()}
            locale="en"
            pollOptions={null}
          />
        );
        wrapper.find('.e2e-add-option').simulate('click');
        wrapper.find('FormOptionRow').prop('closeRow')();
        expect(wrapper.find('FormOptionRow').exists()).toBe(false);
      });
    });
    describe('handles showing option edition form', () => {
      it('handles opening it, replacing the display row', () => {
        const wrapper = shallow(
          <OptionForm
            question={question}
            collapse={jest.fn()}
            locale="en"
            pollOptions={[mockOption('vanillaId', 'Vanilla')]}
          />
        );
        wrapper.find('OptionRow').prop('editOption')();
        expect(wrapper.find('FormOptionRow').exists()).toBe(true);
        expect(wrapper.find('OptionRow').exists()).toBe(false);
      });
    });
  });
});