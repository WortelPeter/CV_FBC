function readFeed(strFeedURL,strItemSpecifier,listFilters,lUniqueBy,label){
	var feedStr = UrlFetchApp.fetch(strFeedURL).getContentText()

  	var feed = xml2obj(feedStr);


  	if(typeof strItemSpecifier !== 'undefined'){
  		itemSpecSplit = strItemSpecifier.split('.');
  		for(var i in itemSpecSplit)
  			feed = feed[itemSpecSplit[i]];
  	}

  	if(typeof listFilters !== 'undefined')
  		feed = filterItems(feed,listFilters);

  	if(typeof lUniqueBy !== 'undefined')
  		feed = itemsUnique(feed,lUniqueBy);

	feed = feed.slice(label.getDescription());
  	return feed;
}

function filterItems(listItems,listFilter){
	/* 
	future: 	- Bigger than, Smaller than etc operators
				- remove special signs with above operators
	
	Parameters:
		@list 	listItems 	:
		@list 	listFilter	:

	Returns:
		@list 	listItems 	: a filterd list of items
	*/
	listItemsFiltered = [];

	for(var i=0;i<listItems.length;++i){
		valid = true;
		for(var j=0;j<listFilter.length;++j){

			var key = parseKey('{'+listFilter[j]['k']+'}',listItems[i]);
			var value = listFilter[j]['v'];
			var operator = listFilter[j]['o'];
			if(operator == '=' || operator == '=='){
				operator = '==';
				key = '"'+key+'"';
				value = '"'+value+'"';
			}else{
				key = makeFloat(key);
				value = makeFloat(value);
			}

			if(!eval(key+operator+value)){
				valid = false;
				break;
			}
		}
		if(valid){
			listItemsFiltered.push(listItems[i]);
		}
	}
	return listItemsFiltered;
}

function itemsUnique(items,uniqueBy){
	var newItems = [];
	for(var i=0;i<items.length;++i){
		var pasAll = true;
		for(var j=0;j<newItems.length;++j){
			var pasOne = false;
			for(var k=0;k<uniqueBy.length;++k){
				if(parseKey(uniqueBy[k],items[i]) != parseKey(uniqueBy[k],newItems[j])){
					pasOne = true;
					break;
				}
			}
			if(!pasOne){
				pasAll = false;
				break;
			}
		}
		if(pasAll)
			newItems.push(items[i]);
	}
	return newItems;
}

function parseKey(key,item){
	var txt = "";
	keySplit = key.split('{');
	for(var i=0;i<keySplit.length;++i){
		if(keySplit[i].indexOf('}') == -1){
			txt += keySplit[i];
			continue;
		}
		subKey = keySplit[i].split('}');
		itemTemp = item;
		var subKeySplit = subKey[0].split('.');
		for(var j=0;j<subKeySplit.length;++j){
			itemTemp = itemTemp[subKeySplit[j]];
			if(typeof itemTemp == 'undefined'){
				Logger.log('Error in Key')
				break;
			}
		}
		if(typeof itemTemp != 'undefined')
			txt += itemTemp;
		if(typeof subKey[1] != 'undefined')
			txt += subKey[1];
	}
	return txt;
}