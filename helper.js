/*Takes a string of bytes and returns an int.
In string of bytes, all bytes expect the last
have bit 7 set.*/
function readVariableLengthInt(dataString){
	res = {decimalResult: 0, hexLength: 0};
	bin = "";
	i = -1;
	do{
		i++;
		charBinary = dataString.charCodeAt(i).toString(2);
		charBinary = "00000000".substring(charBinary.length)+charBinary;
		charBinary = charBinary.substring(1);
		bin = bin + charBinary;
	
	}
	while(dataString.charCodeAt(i)>127&&i<dataString.length-2)
	res["hexLength"] = i+1;
	res["decimalResult"] = parseInt(bin,2);
	return res;
}

/*Converts each ascii character value
to space-separated hex bytes.
Example: "'" evaluates to "20"
because the ASCII value for "'" is 32b10.*/
function asciiToHexString(dataString) {
	res = "";
	for(c in dataString){
		res = res + "00".substring(dataString.charCodeAt(c).toString(16).length)+dataString.charCodeAt(c).toString(16) +" ";
	}
	return res;
}
function sumBits(data)
{
	str = "";
	for(i = 0; i < data.length; i++){
		bin = data.charCodeAt(i).toString(2);
		str = str + "00000000".substring(bin.length) + bin;
	}
	return parseInt(str,2);
}

function stringCharsToHex(str){
	res = "";
	for(i = 0; i < str.length; i++){
		res = res + " " + parseInt(str.charCodeAt(i)).toString(16)
	}
	return res;
}

function stringCharsToBin(str){
	res = "";
	for(i = 0; i < str.length; i++){
		b = parseInt(str.charCodeAt(i)).toString(2);
		res = res + " " + "00000000".substring(b.length) + b;
	}
	return res;
}
