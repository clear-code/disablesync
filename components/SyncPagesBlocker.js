/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const ID = 'disableaddons@clear-code.com';

const BLOCKED_URIS = [
  'about:sync-tabs',
  'about:sync-log',
  'about:sync-progress',
  'about:accounts'
];

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');

const kCID  = Components.ID('{20300fc0-85ab-11e4-b4a9-0800200c9a66}');
const kID   = '@clear-code.com/disablesync/syncpagesblocker;1';
const kNAME = 'SyncPagesBlocker';

const ObserverService = Cc['@mozilla.org/observer-service;1']
  .getService(Ci.nsIObserverService);

// const Application = Cc['@mozilla.org/steel/application;1']
//     .getService(Ci.steelIApplication);

// let { console } = Application;

// function dir(obj) console.log(Object.getOwnPropertyNames(obj).join("\n"));

const BLOCKED_URIS_PATTERN = new RegExp('^(?:' +
                                          BLOCKED_URIS.map(function(aURI) {
                                            return aURI.replace(/([\\^\$\*\+\?\.\(\)\|\{\}\[\]])/g, '\\$1');
                                          }).join('|') +
                                          ')',
                                        'i');

function SyncPagesBlocker() {}

SyncPagesBlocker.prototype = {
  QueryInterface: function (aIID) {
    if (!aIID.equals(Ci.nsIContentPolicy) &&
        !aIID.equals(Ci.nsISupportsWeakReference) &&
        !aIID.equals(Ci.nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  },

  shouldLoad: function (aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
    if (BLOCKED_URIS_PATTERN.test(aContentLocation.spec)) {
      this.processBlockedContext(aContext);
      Components.utils.reportError(new Error(ID + ': ' + aContentLocation.spec + ' is blocked!'));
      return Ci.nsIContentPolicy.REJECT_REQUEST;
    }

    return Ci.nsIContentPolicy.ACCEPT;
  },

  shouldProcess: function (aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
    return Ci.nsIContentPolicy.ACCEPT;
  },

  processBlockedContext: function (aContext) {
    try {
      if (aContext && aContext.localName == 'browser') {
        aContext.stop();
        let doc = aContext.ownerDocument;
        let chrome = doc.defaultView;
        if (chrome &&
            chrome.gBrowser &&
            chrome.gBrowser.selectedBrowser == aContext &&
            chrome.gBrowser.visibleTabs.length == 1)
          return;
      }
      let win = aContext.contentWindow;
      win.close();
    } catch (error) {}

    // XXX: does not work
    // win.setTimeout(function () {
    //   win.close();
    // }, 0);
  },

  classID           : kCID,
  contractID        : kID,
  classDescription  : kNAME,
  QueryInterface    : XPCOMUtils.generateQI([Ci.nsIContentPolicy]),
  _xpcom_categories : [
    { category : 'content-policy', service : true }
  ]
};

if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([SyncPagesBlocker]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([SyncPagesBlocker]);
