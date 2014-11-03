function open(url, newTab)
{
	if (newTab === undefined)
		newTab = false;
		
	var win = window.open(url, (newTab ? "_blank" : undefined));
	win.focus();
}

String.prototype.args = function()
{
	var arg = arguments;
	
	var ret = this;
	
	ret = ret.replace(/(%[0-9]+)/g, "($1)"); // for %10 etc
	
	for (var i = 0; i < arg.length; i++)
	{	
		ret = ret.replace(new RegExp("\\(%" + (i + 1) + "\\)", "g"), arg[i].toString());
	}
	
	return ret;
};

function cmp(x1, x2)
{
	if (typeof x1 !== typeof x2)
	{
		return false;
	}
	else if (typeof x1 === "string")
	{
		if (x1.toLowerCase() === x2.toLowerCase())
		{
			return true;
		}
	}
	return x1 === x2;
}

Array.prototype.indexOf = function (item, caseSensitive)
{	
	if (caseSensitive === undefined)
	{
		caseSensitive = false;
	}

	for (var i = 0; i < this.length; i++)
	{
		if ((cmp(this[i], item) && !caseSensitive) || this[i] === item)
		{
			return i;
		}
	}

	return -1;
};

Array.prototype.format = function(fn, num)
{
	var ret = [];
	
	if (!num)
	{
		num = false;
	}
		
	for (var i = 0; i < this.length; i++)
	{
		var formatted = eval('"' + fn.replace(/%i/g, this[i]) + '"'); // quotes or it thinks its a var hahas
		
		if (num)
			formatted = parseFloat(num);
			
		ret.push(formatted);
	}
	
	return ret;
};

Array.prototype.copy = function()
{
	return this.slice(0);
};

Array.prototype.randomItem = function()
{
	if (this.length === 0)
		return undefined;
		
	var r = randomInt(this.length);
	
	return this[r];
};

function randomInt(arg1, arg2)
{
	if (arg2 !== undefined) // randomInt(min, max)
	{
		return Math.floor(Math.random() * (arg2 - arg1)) + arg1;
	}
	else // randomInt(max)
	{
		return Math.floor(Math.random() * arg1);
	}
}

Array.prototype.clean = function(deleteValue)
{
	if (deleteValue)
	{
		var ret = this.copy();
		for (var i = 0; i < ret.length; i++)
		{
			if (ret[i] == deleteValue)
			{         
				ret.splice(i, 1);
				i--;
			}
		}
		
		return ret;
	}
	else
	{
		var ret = this.copy();
		for (var i = 0; i < ret.length; i++)
		{
			if (!ret[i])
			{
				ret.splice(i, 1);
				i--;
			}
		}
		
		return ret;
	}
};

function alphaCompare(a, b)
{
	return a.toLowerCase().localeCompare(b.toLowerCase());
}

Array.prototype.alphabetize = function()
{
	return this.sort(alphaCompare);
};

function sortedIndex(array, value, compare) // from https://github.com/6wunderkinder/sortedindex-compare/blob/master/index.js
{
	var low = 0,
		high = array ? array.length : low;
		
	while (low < high)
	{
		var mid = (low + high) >>> 1;
		(compare(array[mid],value) > 0) ? low = mid + 1 : high = mid;
	}
	
	return low;
}

function valuesOf(obj)
{
	var ret = [];
	
	for (var x in obj)
	{
		if (obj.hasOwnProperty(x))
		{
			ret.push(obj[x]);
		}
	}
	
	return ret;
}

Array.prototype.reverse = function()
{
	var ret = [];
	
	for (var i = this.length - 1; i >= 0; i--)
	{
		ret.push(this[i]);
	}
	
	return ret;
};

String.prototype.indexOf = function(str)
{
	if (str === undefined || str.length === 0 || str.length > this.length)
		return -1;
	if (cmp(str, this))
		return 0;

	for (var i = 0; i < this.length; i++)
	{
		if (cmp(this.substr(i, str.length), str))
		{
			return i;
		}
	}

	return -1;
};

String.prototype.startsWith = function(text, ins)
{
	if (ins === undefined)
		ins = false;
		
	var str = this;
	
	if (text.length > str.length)
		return false;
	
	if (!ins)
		return str.substr(0, text.length) === text;
	else
		return cmp(str.substr(0, text.length), text)
};

String.prototype.startsWithOne = function(arr, ins)
{
	var arg = arr;
	
	for (var i = 1; i < arg.length; i++)
	{
		if (this.startsWith(arg[i], ins))
		{
			cache.startsWithWhich = arg[i];
			return true;
		}
	}
	
	return false;
};

String.prototype.endsWith = function(text, ins)
{
	if (ins === undefined)
		ins = false;
		
	var str = this;
	
	if (text.length > str.length)
		return false;
		
	if (!ins)
		return str.substr(str.length - text.length) === text;
	else
		return cmp(str.substr(str.length - text.length), text);
};

String.prototype.trimString = function(str)
{
	if (str === undefined)
		str = " ";
		
	var ret = this;
	
	while (ret.startsWith(str))
	{
		if (ret.length < str.length)
		{
			return ret;
		}
		
		ret = ret.substr(str.length);
	}
	
	while(ret.endsWith(str))
	{
		if (ret.length < str.length)
		{
			return ret;
		}
		
		ret = ret.substr(0, ret.length - str.length);
	}
	
	return ret;
};

String.prototype.contains = function(str)
{
	return this.indexOf(str) !== -1;
};

Array.prototype.contains = function(item)
{
	return this.indexOf(item) !== -1;
};

Array.prototype.insert = function(index, item)
{
	this.splice(index, 0, item);
};

Array.prototype.remove = function(item)
{
	return this.splice(this.indexOf(item), 1);
};

function get(id)
{
	return $(id).get(0);
}

function escapeHTML(str) // from po
{
	return str.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/([a-zA-Z]+:\/\/|www\.)([^\s]+)/ig, "<a href='$1$2' target='_blank' style='color:blue; text-decoration:underline;'>$1$2</a>")
		.replace(/&amp;(?=[^\s<]*<\/a>)/g, "&"); /* Revert &amp;'s to &'s in URLs */
}

function escapeHTMLQuotes(str) // from po
{
	return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fixPictures(str)
{
	return str;
}

function storeVal(key, val)
{
	localStorage.setItem(key, val);
}

function getVal(key, def)
{
	return localStorage.getItem(key) || def;
}

Element.prototype.delete = function()
{
    this.parentElement.removeChild(this);
};

Element.prototype.toString = function()
{
	var x = document.createElement("div");
	$(x).append(this);
	return x.innerHTML;
};

NodeList.prototype.delete = HTMLCollection.prototype.delete = function()
{
    for (var i = 0, len = this.length; i < len; i++)
	{
        if (this[i] && this[i].parentElement)
		{
            this[i].parentElement.removeChild(this[i]);
        }
    }
};

function timestamp()
{
	var time = new Date();
	var h = time.getHours();
	var m = time.getMinutes();
	var s = time.getSeconds();
	var d = time.getDate();
	var mo = parseInt(time.getMonth() + 1);
	var y = time.getFullYear();
	var date = d + "-" + mo + "-" + y;
	m = (m < 10 ? "0" + m : m);
	s = (s < 10 ? "0" + s : s);
	var timestamp = "(" + (h < 10 ? "0" + h : h) + ":" + m + ":" + s + ")";
	return timestamp;
}

function scrollToBottom(e)
{
	e.scrollTop = e.scrollHeight;
}

function isScrolledToBottom(e, allowance)
{
	var x = $(e);
	var y = x.get(0);
	
	if (allowance === undefined)
		allowance = 1;
		
	//console.log(y.scrollHeight + " - " + x.scrollTop() + " - " + allowance + " = " + (y.scrollHeight - x.scrollTop() - allowance) + " | " + x.innerHeight());
	
	return y.scrollHeight - x.scrollTop() - allowance <= x.innerHeight();
}

function classElement(type, className)
{
	var ret = document.createElement(type);
	ret.className = className;
	
	return ret;
}

function malert(title, text)
{
	var modal = document.createElement("div");
	modal.className = "modal fade";
	modal.tabindex = "-1";
	modal.role = "dialog";
	modal["aria-hidden"] = true;
	
	modal.innerHTML = "<div class='modal-dialog'><div class='modal-content'><div class='modal-header'><h4 class='modal-title'>" + escapeHTMLQuotes(title) + "</h4></div><div class='modal-body'>" + escapeHTMLQuotes(text) + "</div><div class='modal-footer'><button type='button' class='btn btn-primary' data-dismiss='modal'>OK</button></div></div></div>";
	
	$(modal).modal();
}

function utf8_encode(argString) {
	//	discuss at: http://phpjs.org/functions/utf8_encode/
	// original by: Webtoolkit.info (http://www.webtoolkit.info/)
	// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// improved by: sowberry
	// improved by: Jack
	// improved by: Yves Sucaet
	// improved by: kirilloid
	// bugfixed by: Onno Marsman
	// bugfixed by: Onno Marsman
	// bugfixed by: Ulrich
	// bugfixed by: Rafal Kukawski
	// bugfixed by: kirilloid
	//	 example 1: utf8_encode('Kevin van Zonneveld');
	//	 returns 1: 'Kevin van Zonneveld'

	if (argString === null || typeof argString === 'undefined') {
		return '';
	}

	var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	var utftext = '',
		start, end, stringl = 0;

	start = end = 0;
	stringl = string.length;
	for (var n = 0; n < stringl; n++) {
		var c1 = string.charCodeAt(n);
		var enc = null;

		if (c1 < 128) {
			end++;
		} else if (c1 > 127 && c1 < 2048) {
			enc = String.fromCharCode(
				(c1 >> 6) | 192, (c1 & 63) | 128
			);
		} else if ((c1 & 0xF800) != 0xD800) {
			enc = String.fromCharCode(
				(c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
			);
		} else { // surrogate pairs
			if ((c1 & 0xFC00) != 0xD800) {
				throw new RangeError('Unmatched trail surrogate at ' + n);
			}
			var c2 = string.charCodeAt(++n);
			if ((c2 & 0xFC00) != 0xDC00) {
				throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
			}
			c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
			enc = String.fromCharCode(
				(c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
			);
		}
		if (enc !== null) {
			if (end > start) {
				utftext += string.slice(start, end);
			}
			utftext += enc;
			start = end = n + 1;
		}
	}

	if (end > start) {
		utftext += string.slice(start, stringl);
	}

	return utftext;
}

function md5(str) {
	//	discuss at: http://phpjs.org/functions/md5/
	// original by: Webtoolkit.info (http://www.webtoolkit.info/)
	// improved by: Michael White (http://getsprink.com)
	// improved by: Jack
	// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	//		input by: Brett Zamir (http://brett-zamir.me)
	// bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	//	depends on: utf8_encode
	//	 example 1: md5('Kevin van Zonneveld');
	//	 returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'

	var xl;

	var rotateLeft = function(lValue, iShiftBits) {
		return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
	};

	var addUnsigned = function(lX, lY) {
		var lX4, lY4, lX8, lY8, lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
	};

	var _F = function(x, y, z) {
		return (x & y) | ((~x) & z);
	};
	var _G = function(x, y, z) {
		return (x & z) | (y & (~z));
	};
	var _H = function(x, y, z) {
		return (x ^ y ^ z);
	};
	var _I = function(x, y, z) {
		return (y ^ (x | (~z)));
	};

	var _FF = function(a, b, c, d, x, s, ac) {
		a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
		return addUnsigned(rotateLeft(a, s), b);
	};

	var _GG = function(a, b, c, d, x, s, ac) {
		a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
		return addUnsigned(rotateLeft(a, s), b);
	};

	var _HH = function(a, b, c, d, x, s, ac) {
		a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
		return addUnsigned(rotateLeft(a, s), b);
	};

	var _II = function(a, b, c, d, x, s, ac) {
		a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
		return addUnsigned(rotateLeft(a, s), b);
	};

	var convertToWordArray = function(str) {
		var lWordCount;
		var lMessageLength = str.length;
		var lNumberOfWords_temp1 = lMessageLength + 8;
		var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
		var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
		var lWordArray = new Array(lNumberOfWords - 1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while (lByteCount < lMessageLength) {
			lWordCount = (lByteCount - (lByteCount % 4)) / 4;
			lBytePosition = (lByteCount % 4) * 8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount - (lByteCount % 4)) / 4;
		lBytePosition = (lByteCount % 4) * 8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
		lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
		lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
		return lWordArray;
	};

	var wordToHex = function(lValue) {
		var wordToHexValue = '',
			wordToHexValue_temp = '',
			lByte, lCount;
		for (lCount = 0; lCount <= 3; lCount++) {
			lByte = (lValue >>> (lCount * 8)) & 255;
			wordToHexValue_temp = '0' + lByte.toString(16);
			wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
		}
		return wordToHexValue;
	};

	var x = [],
		k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
		S12 = 12,
		S13 = 17,
		S14 = 22,
		S21 = 5,
		S22 = 9,
		S23 = 14,
		S24 = 20,
		S31 = 4,
		S32 = 11,
		S33 = 16,
		S34 = 23,
		S41 = 6,
		S42 = 10,
		S43 = 15,
		S44 = 21;

	str = this.utf8_encode(str);
	x = convertToWordArray(str);
	a = 0x67452301;
	b = 0xEFCDAB89;
	c = 0x98BADCFE;
	d = 0x10325476;

	xl = x.length;
	for (k = 0; k < xl; k += 16) {
		AA = a;
		BB = b;
		CC = c;
		DD = d;
		a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
		d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
		c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
		b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
		a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
		d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
		c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
		b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
		a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
		d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
		c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
		b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
		a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
		d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
		c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
		b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
		a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
		d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
		c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
		b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
		a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
		d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
		c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
		b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
		a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
		d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
		c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
		b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
		a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
		d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
		c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
		b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
		a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
		d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
		c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
		b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
		a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
		d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
		c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
		b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
		a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
		d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
		c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
		b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
		a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
		d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
		c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
		b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
		a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
		d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
		c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
		b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
		a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
		d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
		c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
		b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
		a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
		d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
		c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
		b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
		a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
		d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
		c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
		b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
		a = addUnsigned(a, AA);
		b = addUnsigned(b, BB);
		c = addUnsigned(c, CC);
		d = addUnsigned(d, DD);
	}

	var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

	return temp.toLowerCase();
}