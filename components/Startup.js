/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const kCID  = Components.ID('{611950d0-85a3-11e4-b4a9-0800200c9a66}'); 
const kID   = '@clear-code.com/disablesync/startup;1';
const kNAME = 'DisableSyncStartupService';

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');

const BLOCKED_URIS = [
  'about:sync-tabs',
  'about:sync-log',
  'about:accounts'
];

const ObserverService = Cc['@mozilla.org/observer-service;1']
		.getService(Ci.nsIObserverService);

const SSS = Cc['@mozilla.org/content/style-sheet-service;1']
		.getService(Ci.nsIStyleSheetService);

const IOService = Cc['@mozilla.org/network/io-service;1']
		.getService(Ci.nsIIOService);

const BLOCKED_URIS_PATTERN = new RegExp('^(?:' +
                                          BLOCKED_URIS.map(function(aURI) {
                                            return aURI.replace(/([\\^\$\*\+\?\.\(\)\|\{\}\[\]])/g, '\\$1');
                                          }).join('|') +
                                          ')',
                                        'i');
 
function DisableSyncStartupService() { 
}
DisableSyncStartupService.prototype = {
	classID          : kCID,
	contractID       : kID,
	classDescription : kNAME,
	 
	observe : function(aSubject, aTopic, aData) 
	{
		switch (aTopic)
		{
			case 'app-startup':
			case 'profile-after-change':
				ObserverService.addObserver(this, 'final-ui-startup', false);
				return;

			case 'final-ui-startup':
				ObserverService.removeObserver(this, 'final-ui-startup');
				this.init();
				return;

			case 'chrome-document-global-created':
				if (BLOCKED_URIS_PATTERN.test(aSubject.location.href))
					aSubject.location.replace('about:blank');
				return;
		}
	},
 
	init : function() 
	{
		this.registerGlobalStyleSheet();

		ObserverService.addObserver(this, 'chrome-document-global-created', false);
	},
 
	registerGlobalStyleSheet : function() 
	{
		var sheet = IOService.newURI('chrome://disablesync/content/global.css', null, null);
		if (!SSS.sheetRegistered(sheet, SSS.USER_SHEET)) {
			SSS.loadAndRegisterSheet(sheet, SSS.USER_SHEET);
		}
	},
	
  
	QueryInterface : function(aIID) 
	{
		if(!aIID.equals(Ci.nsIObserver) &&
			!aIID.equals(Ci.nsISupports)) {
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
		return this;
	}
 
}; 

if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([DisableSyncStartupService]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([DisableSyncStartupService]);
