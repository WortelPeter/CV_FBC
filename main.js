var urlsToFetch = []
	urlsToFetch.push(sUrlBase+"xml2obj.js");
	urlsToFetch.push(sUrlBase+"readItems.js");
	urlsToFetch.push(sUrlBase+"misc.js");

for(var i=0;i<urlsToFetch.length;++i)
	eval(UrlFetchApp.fetch(urlsToFetch[i]).getContentText());

function feedBasedCampaign() {
	this.run = function() {
		/*	
		main function that controls action

		future:
			- 
		returns:
			null
		*/



		var date = new Date;
		if(typeof intRefreshHour == 'undefined')
 			var intRefreshHour = date.getUTCHours()+1;

		var objCampaign	= this.initCampaign(strCampaignName);
		var label 		= this.initLabel(objCampaign);

		if(date.getUTCHours() + 1 == intRefreshHour){
			label.setDescription("0");
			var objCampaign = this.pauseAdGroups(objCampaign);
		}
		
		var listItems = readFeed(strFeedURL,strItemSpecifier,listFilters,
			lUniqueBy,label);

		// create an adGroup for each item
		for(var i=0;i<listItems.length;++i){
			if(!this.checkScriptStatus(label)) return;
			
			try{
				var objAdGroup = this.createAdGroup(objCampaign,listItems[i],
					objAdvKey,flMaxCpc);
				this.createAdvertisement(objAdGroup,listItems[i],objAdvKey,
					flMaxCpc);
				this.createKeyWords(objAdGroup,listItems[i],listKeyWords,
					flMaxCpc);
			}catch(err){
				Logger.log(err)
			}

		}
		Logger.log('Done');
	}

	this.initCampaign = function(campaignName){
		/*  
		Tries to find the campaign given by the parameter campaignName.
 		If the campaign is not found, throws an error.

	 	Future: create campaign when campaign not foud?

		parameters:
	 		@string campaignName 	: campaign Name to search for.
	 	
		returns:
			@obj 	campgain	: the adwords campgain object to use
	 	*/
		var campaignIterator = AdWordsApp.campaigns()
	       .withCondition('Name = "'+campaignName+'"')
	       .get();
	    if (!campaignIterator.hasNext()) {
		    throw "Campain does not exist";       
		} else{
			var campaign = campaignIterator.next();
		}
		return campaign
	}
	
	this.initLabel = function(objCampaign){
		var label = objCampaign.labels().withCondition("Name = 'State "+
			objCampaign.getName()+"'").get();
		
		if(!label.hasNext()){
			AdWordsApp.createLabel("State " + objCampaign.getName());
			objCampaign.applyLabel("State " + objCampaign.getName());
		}
		var label = objCampaign.labels().withCondition("Name = 'State "+
			objCampaign.getName()+"'").get();
		return label.next();
	}
	

	this.pauseAdGroups = function(objCampaign){
		/*		
		Pauses al AdGroups in objCampaign

		Parameters:
			@obj 	objCampaign	: 	the campaign object to clear

		returns:
			@obj 	objCampaign : 	the updated campaign object  
		*/
	 	var adGroupIterator = objCampaign.adGroups().get();
	 	while(adGroupIterator.hasNext()){
	 		adGroup = adGroupIterator.next();
	 		if(!adGroup.isEnabled()){continue;}
	 		adGroup.pause();
	 		adGroup.setName("paused - "+adGroup.getName());
	 	}
	 	return objCampaign;
	}

	
	this.checkScriptStatus = function(label){
		var intRemTime = AdWordsApp.getExecutionInfo().getRemainingTime();
		var intRemCreate = AdWordsApp.getExecutionInfo()
			.getRemainingCreateQuota();
		var intRemGet = AdWordsApp.getExecutionInfo().getRemainingGetQuota();

		if(intRemTime < 30 || intRemCreate < 100 || intRemGet < 100){
			Logger.log("I have reached my limit, see you next hour!");
			label.setDescription(i.toString())
			return false;
		}
		return true;
	}

	this.createAdGroup = function(objCampaign, objItem,objAdSpec,flMaxCpc){
		/* 
		Creates an adGroup based on information given by parameters
	
		future:

		Parameters:
			@obj 	objCampaign	: the campaign to run the changes on
			@obj 	objItem 	: the object that contains the item information 
								  to create the ad from
			@obj 	objAdSpec	: the object that contains the the keys to build 
									the ad with
			@list   listKeyWords: a list of al the keys to create keywords from
			@float  flMaxCpc	: the default maximum cpc

		Returns: 
			null
		*/
		var date = new Date
		var adGroup = objCampaign.newAdGroupBuilder()
			.withName(parseKey(objAdSpec['adTitle'],objItem) + " - " + 
				date.valueOf())
			.withKeywordMaxCpc(flMaxCpc)
			.create();

		return adGroup;
	}

	this.createAdvertisement = function(objAdGroup, objItem,objAdSpec,flMaxCpc){
     	var objAdvertisement = {};

		for (var key in objAdSpec){
			if(objAdSpec.hasOwnProperty(key)){				
				objAdvertisement[key] = parseKey(objAdSpec[key],objItem);
			}
		}


		if(objAdvertisement['adTitle'].length >25){
			return
		} if(objAdvertisement['adDesc1'].length >35){
			return
		} if(objAdvertisement['adDesc2'].length >35){
			return
		} if(objAdvertisement['displayURL'].length >35){
			return
		}

		objAdGroup.createTextAd(capitalise(objAdvertisement['adTitle']),
			objAdvertisement['adDesc1'],objAdvertisement['adDesc2'],
			objAdvertisement['displayURL'].replace(/ /g,''),
			objAdvertisement['adLoc']);
	}

	this.createKeyWords = function(adGroup,objItem,listKeyWords,flMaxCpc){
		for(var i =0; i<listKeyWords.length;++i){
			var strKeyPhrase = parseKey(listKeyWords[i].keywordName,objItem);
			var keyWordType = listKeyWords[i].keywordType;		

			if(keyWordType == "phrase")
				strKeyPhrase = "\"" + strKeyPhrase + "\"";
			else if(keyWordType == "exact")
				strKeyPhrase = "[" + strKeyPhrase + "]";
			else if(keyWordType == "broad")
				strKeyPhrase = "" + strKeyPhrase + "";
			else if(keyWordType == "modified")
				strKeyPhrase = strKeyPhrase.split(" ").join(" +").slice(0,-2);
			else
				continue;
			
			if(strKeyPhrase.length > 80)
				continue;
	
			adGroup.createKeyword(strKeyPhrase,flMaxCpc);
		}

	}
}
var FBC = new feedBasedCampaign();
FBC.run();