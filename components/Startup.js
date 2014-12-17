/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const kCID  = Components.ID('{611950d0-85a3-11e4-b4a9-0800200c9a66}'); 
const kID   = '@clear-code.com/disablesync/startup;1';
const kNAME = 'DisableSyncStartupService';

const ObserverService = Components
		.classes['@mozilla.org/observer-service;1']
		.getService(Components.interfaces.nsIObserverService);

const SSS = Components
		.classes['@mozilla.org/content/style-sheet-service;1']
		.getService(Components.interfaces.nsIStyleSheetService);

const IOService = Components
		.classes['@mozilla.org/network/io-service;1']
		.getService(Components.interfaces.nsIIOService);
 
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
		}
	},
 
	init : function() 
	{
		this.registerGlobalStyleSheet();
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
		if(!aIID.equals(Components.interfaces.nsIObserver) &&
			!aIID.equals(Components.interfaces.nsISupports)) {
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
		return this;
	}
 
}; 
 	 
var gModule = { 
	registerSelf : function(aCompMgr, aFileSpec, aLocation, aType)
	{
		aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.registerFactoryLocation(
			kCID,
			kNAME,
			kID,
			aFileSpec,
			aLocation,
			aType
		);

		var catMgr = Components.classes['@mozilla.org/categorymanager;1']
					.getService(Components.interfaces.nsICategoryManager);
		catMgr.addCategoryEntry('app-startup', kNAME, kID, true, true);
	},

	getClassObject : function(aCompMgr, aCID, aIID)
	{
		return this.factory;
	},

	factory : {
		QueryInterface : function(aIID)
		{
			if (!aIID.equals(Components.interfaces.nsISupports) &&
				!aIID.equals(Components.interfaces.nsIFactory)) {
				throw Components.results.NS_ERROR_NO_INTERFACE;
			}
			return this;
		},
		createInstance : function(aOuter, aIID)
		{
			return new DisableSyncStartupService();
		}
	},

	canUnload : function(aCompMgr)
	{
		return true;
	}
};

try {
	Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');
	var NSGetFactory = XPCOMUtils.generateNSGetFactory([DisableSyncStartupService]);
}
catch(e) {
	var NSGetModule = function(aCompMgr, aFileSpec) {
			return gModule;
		};
}
 
