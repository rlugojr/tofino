/* @flow */

// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

import expect from 'expect';
import configureStore from '../../../../app/ui/browser/store/store';
import * as actions from '../../../../app/ui/browser/actions/main-actions';
import * as profileCommandTypes from '../../../../app/shared/constants/profile-command-types';
import { ipcMain as ipcMainMock } from '../../../../app/shared/electron';

describe('Action - unbookmark', () => {
  const sessionId = 1;

  beforeEach(function() {
    this.store = configureStore();
    this.getState = () => this.store.getState().profile;
    this.dispatch = this.store.dispatch;
  });

  it('Should remove bookmarks from profile state', function() {
    const { dispatch, getState } = this;

    expect(getState().get('bookmarks').has('http://moz1.com')).toEqual(false);
    dispatch(actions.bookmark(sessionId, 'http://moz1.com', 'moz1'));
    expect(getState().get('bookmarks').has('http://moz1.com')).toEqual(true);
    dispatch(actions.unbookmark(sessionId, 'http://moz1.com'));
    expect(getState().get('bookmarks').has('http://moz1.com')).toEqual(false);
  });

  it('Should send a message to the main process', function(done) {
    const { dispatch } = this;

    ipcMainMock.on('profile-command', handleIpc);

    dispatch(actions.bookmark(sessionId, 'http://moz1.com', 'moz1'));
    dispatch(actions.unbookmark(sessionId, 'http://moz1.com'));

    function handleIpc(e, { command }) {
      // Filter out any mock ipc calls that are not of interest
      // to the current test.
      if (command.type !== profileCommandTypes.DID_UNBOOKMARK_LOCATION ||
          command.payload.url !== 'http://moz1.com') {
        return;
      }
      expect(command.type).toEqual(profileCommandTypes.DID_UNBOOKMARK_LOCATION);
      expect(command.payload.url).toEqual('http://moz1.com');
      expect(command.payload.sessionId).toEqual(sessionId);
      ipcMainMock.removeListener('profile-command', handleIpc);
      done();
    }
  });
});
