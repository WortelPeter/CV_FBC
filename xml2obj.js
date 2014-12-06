
function xml2obj(feed){
	var feedObj= {};

	feed = processFeed(feed);

	//remove specifications string
	if(feed.substring(0,2) == '<?'){
		var end = feed.indexOf('?>') + 2;
		var specifications = readAttributes(feed.substring(2,end-2));
		feed = feed.substring(end);
		feedObj['specifications'] = specifications;
	}
	feed = removeFirstAndLastSpaces(feed);
	var topName = findFirstName(feed);
	
	feedObj[topName] = xml2objRec(feed);

	return feedObj;
}

function xml2objRec(feed){
	var list = [];
	var name = findFirstName(feed);
	var closed = findClosed(feed);
	var closedIndex = feed.indexOf('>');
	if(closed)
		var attributesString = feed.substring(name.length+2,feed.indexOf('/>'));
	else
		var attributesString = feed.substring(name.length+2,feed.indexOf('>'));
	var attributes = readAttributes(attributesString);
	if(closed)
		return attributes;
	if(Object.size(attributes)!=0)
		list.push(attributes);
	feed = feed.substring(closedIndex+1,feed.length - name.length - 3);
	feed = removeFirstAndLastSpaces(feed);
	if(feed.indexOf('<')==-1 && feed.indexOf('>') == -1){
		return decodeURI(feed);
	}

	while(feed.length != 0){
		var obj = {}
		var childName = findFirstName(feed);
		var childString = findFirstChildString(feed,childName);

		feed = feed.substring(childString.length);
		feed = removeFirstAndLastSpaces(feed);
		
		obj[childName] = xml2objRec(childString);
		list.push(obj);
	}
	
	obj = {};
	obj = joinObjects(list);
	return obj;
}

function findFirstChildString(feed,childname){
	var i = 1;
	var close = 1;
	if(findClosed(feed))
		var childString = feed.substring(0,feed.indexOf('/>')+2);
	else{
		while(i != 0){
			var firstOpen = feed.substring(close).indexOf('<'+childname+'>');
			var firstClose = feed.substring(close).indexOf('</'+childname+'>');

			if(firstOpen == -1 || firstClose < firstOpen){
				i--;
				close += firstClose + childname.length + 3;
			}else{
				i++;
				close += firstOpen + childname.length + 2;
			}  				
		}
		childString = feed.substring(0,close);
	}
	return childString;
}

function removeFirstAndLastSpaces(feed){
	while(feed.charAt(0) == ' ')
		feed = feed.substring(1);
	while(feed.charAt(-1) == ' ')
		feed = feed.substring(0,-2);
	return feed;

}

function joinObjects(listObjects){
	var obj = {}
	for(var i=0;i<listObjects.length;++i){
		for(var key in listObjects[i]){
			if(listObjects[i].hasOwnProperty(key)){
				if(!obj.hasOwnProperty(key)){
					obj[key] = listObjects[i][key];
					continue;
				}
				if(Array.isArray(obj[key])){
					obj[key].push(listObjects[i][key]);
					continue;
				}
				var objTemp = obj[key];
				delete obj[key];
				obj[key] = [];
				obj[key].push(objTemp);
				obj[key].push(listObjects[i][key]);
			}
		}
	}
	return obj;
}
function findFirstName(feed){
	var firstSpace = feed.indexOf(' ');
	var firstArrow = feed.indexOf('>');
	if(firstSpace == -1 || firstSpace > firstArrow)
		var name = feed.split('>');
	else 
		var name = feed.split(' ');
	name = name[0];
	if(name.charAt(0)=='<') name = name.substring(1);
	return name;
}
function findClosed(feed,name){
	var firstArrow = feed.indexOf('>');
	var firstSlashArrow = feed.indexOf('/>');
	if(firstSlashArrow == -1 || firstArrow<firstSlashArrow)
		return false
	return true;
}
function readAttributes(attributesString){
	var attributes = {};
	var endkey;
	while(true){
		var endkey = attributesString.indexOf('=');
		if(endkey == -1) break;
		var key = attributesString.substring(0,endkey);
		var attributestart = endkey+1;
		var attributeend = attributesString.substring(attributestart+1).
			indexOf(attributesString.charAt(attributestart));
		var attribute = attributesString.substring(attributestart+1,
			attributeend+attributestart+1);
		attributes['@'+key] = attribute;
		attributesString = attributesString.substring(attributeend+
			attributestart+3);
	}
	return attributes;
}
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


function processFeed(feed){
	feed = feed.replace(/\n/g,"");
	feed = feed.replace(/ù/g,'\u00F9');
	feed = feed.replace(/’/g,'\u2019');
	feed = feed.r
	eplace(/–/g,'\u2013');
	feed = feed.replace(/é/g,'\u0019');
	feed = feed.replace(/è/g,'\u00E8');
	feed = feed.replace(/à/g,'\u00E0');
	feed = feed.replace(/ô/g,'\u00F4');
	feed = feed.replace(/É/g,'\u00E9');
	feed = feed.replace(/>/g,'\u003E');
	
	feed = feed.replace(/€/g,'\u20AC');

	return feed;
}
