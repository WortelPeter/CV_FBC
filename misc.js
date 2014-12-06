function objectDump(objObject){
	/* 
	Dumps al methods of objObject as a string

	Parameters
		@obj 	objObject	: the object to dump

	returns:
		@str 	the string representing the object

	*/
	var str = "";
	for (var key in objObject){
		if (objObject.hasOwnProperty(key)){
			str += key + ":"+objObject[key]+", ";
		}
	}
	return "{"+str+"}";
}

function capitalise(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function makeFloat(strNumber){
	var lastPoint = strNumber.lastIndexOf('.');
	var lastComma = strNumber.lastIndexOf(',');
	if(lastPoint > lastComma)
		strNumber = strNumber.replace(/[^.\d]/g, "");
	else
		strNumber = strNumber.replace(/[^,\d]/g, "");
	return parseFloat(strNumber);
}