/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { getProfile, postProfile } from '../sagas';
import { mergeJsonApiResources } from '../../../utils/resources/actions';
import { fetchCurrentUser, updateCurrentUser } from '../../../api';
import { localStorageMock } from '../../../utils/testUtils';

describe('UserEditPage sagas', () => {
  // mock localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock() });

  describe('getProfile', () => {
    const it = sagaHelper(getProfile());

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchCurrentUser));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    // TODO: fix this test
    // it('then, should dispatch currentUserLoaded action', (result) => {
    //   expect(result).toEqual(put(currentUserLoaded(response)));
    // });
  });

  describe('postProfile', () => {
    const it = sagaHelper(postProfile({}));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(updateCurrentUser, {}, undefined));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    // TODO: fix following test
    // it('then, should dispatch currentUserUpdated action', (result) => {
    //   expect(result).toEqual(put(currentUserUpdated(response)));
    // });
  });
});
