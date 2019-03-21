import TextValueSelector from './ValueSelector/TextValueSelector';
import DateValueSelector from './ValueSelector/DateValueSelector';
import AreaValueSelector from './ValueSelector/AreaValueSelector';
import ProjectValueSelector from './ValueSelector/ProjectValueSelector';
import NumberValueSelector from './ValueSelector/NumberValueSelector';
import CustomFieldOptionValueSelector from './ValueSelector/CustomFieldOptionValueSelector';

/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Schema for validating the rules used in smart groups
 */
export type TRule = (
  | {
    ruleType?: 'custom_field_text';
    /**
     * The ID of a custom field
     */
    customFieldId?: string;
    predicate?:
    | 'is'
    | 'not_is'
    | 'contains'
    | 'not_contains'
    | 'begins_with'
    | 'not_begins_with'
    | 'ends_on'
    | 'not_ends_on';
    value?: string;
  }
  | {
    ruleType?: 'custom_field_text';
    /**
     * The ID of a custom field
     */
    customFieldId?: string;
    predicate?: 'is_empty' | 'not_is_empty';
    value?: undefined;
  }
  | {
    ruleType?: 'custom_field_select';
    /**
     * The ID of a custom field
     */
    customFieldId?: string;
    predicate?: 'has_value' | 'not_has_value';
    /**
     * The ID of a custom field option
     */
    value?: string;
  }
  | {
    ruleType?: 'custom_field_select';
    /**
     * The ID of a custom field
     */
    customFieldId?: string;
    predicate?: 'is_empty' | 'not_is_empty';
    value?: undefined;
  }
  | {
    ruleType?: 'custom_field_checkbox';
    /**
     * The ID of a custom field
     */
    customFieldId?: string;
    predicate?: 'is_checked' | 'not_is_checked';
    value?: undefined;
  }
  | {
    ruleType?: 'custom_field_date';
    /**
     * The ID of a custom field
     */
    customFieldId?: string;
    predicate?: 'is_before' | 'is_exactly' | 'is_after';
    value?: string;
  }
  | {
    ruleType?: 'custom_field_date';
    /**
     * The ID of a custom field
     */
    customFieldId?: string;
    predicate?: 'is_empty' | 'not_is_empty';
    value?: undefined;
  }
  | {
    ruleType?: 'custom_field_number';
    /**
     * The ID of a custom field
     */
    customFieldId?: string;
    predicate?:
    | 'is_equal'
    | 'not_is_equal'
    | 'is_larger_than'
    | 'is_larger_than_or_equal'
    | 'is_smaller_than'
    | 'is_smaller_than_or_equal';
    value?: number;
  }
  | {
    ruleType?: 'custom_field_number';
    /**
     * The ID of a custom field
     */
    customFieldId?: string;
    predicate?: 'is_empty' | 'not_is_empty';
    value?: undefined;
  }
  | {
    ruleType?: 'role';
    predicate?: 'is_admin' | 'not_is_admin' | 'is_project_moderator' | 'not_is_project_moderator' | 'is_normal_user' | 'not_is_normal_user';
    value?: undefined;
  }
  | {
    ruleType?: 'email';
    predicate?:
    | 'is'
    | 'not_is'
    | 'contains'
    | 'not_contains'
    | 'begins_with'
    | 'not_begins_with'
    | 'ends_on'
    | 'not_ends_on';
    value?: string;
  }
  | {
    ruleType?: 'lives_in';
    predicate?: 'has_value' | 'not_has_value';
    value?: string;
  }
  | {
    ruleType?: 'lives_in';
    predicate?: 'is_empty' | 'not_is_empty';
    value?: undefined;
  }
  | {
    ruleType?: 'registration_completed_at';
    predicate?: 'is_before' | 'is_exactly' | 'is_after';
    value?: string;
  }
  | {
    ruleType?: 'registration_completed_at';
    predicate?: 'is_empty' | 'not_is_empty';
    value?: undefined;
  }
  | {
    ruleType?: 'participated_in_project';
    predicate?: 'is' | 'not_is';
    value?: string;
  });

export const ruleTypeConstraints = {
  custom_field_text: {
    is: TextValueSelector,
    not_is: TextValueSelector,
    contains: TextValueSelector,
    not_contains: TextValueSelector,
    begins_with: TextValueSelector,
    not_begins_with: TextValueSelector,
    ends_on: TextValueSelector,
    not_ends_on: TextValueSelector,
    is_empty: null,
    not_is_empty: null,
  },
  custom_field_select: {
    has_value: CustomFieldOptionValueSelector,
    not_has_value: CustomFieldOptionValueSelector,
    is_empty: null,
    not_is_empty: null,
  },
  custom_field_checkbox: {
    is_checked: null,
    not_is_checked: null,
  },
  custom_field_date: {
    is_before: DateValueSelector,
    is_exactly: DateValueSelector,
    is_after: DateValueSelector,
    is_empty: null,
    not_is_empty: null
  },
  custom_field_number: {
    is_equal: NumberValueSelector,
    not_is_equal: NumberValueSelector,
    is_larger_than: NumberValueSelector,
    is_larger_than_or_equal: NumberValueSelector,
    is_smaller_than: NumberValueSelector,
    is_smaller_than_or_equal: NumberValueSelector,
    is_empty: null,
    not_is_empty: null
  },
  email: {
    is: TextValueSelector,
    not_is: TextValueSelector,
    contains: TextValueSelector,
    not_contains: TextValueSelector,
    begins_with: TextValueSelector,
    not_begins_with: TextValueSelector,
    ends_on: TextValueSelector,
    not_ends_on: TextValueSelector,
  },
  lives_in: {
    has_value: AreaValueSelector,
    not_has_value: AreaValueSelector,
    is_empty: null,
    not_is_empty: null,
  },
  registration_completed_at: {
    is_before: DateValueSelector,
    is_exactly: DateValueSelector,
    is_after: DateValueSelector,
    is_empty: null,
    not_is_empty: null
  },
  role: {
    is_admin: null,
    not_is_admin: null,
    is_project_moderator: null,
    not_is_project_moderator: null,
    is_normal_user: null,
    not_is_normal_user: null,
  },
  participated_in_project: {
    is: ProjectValueSelector,
    not_is: ProjectValueSelector,
  }
};