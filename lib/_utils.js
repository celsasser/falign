/**
 * Date: 2019-05-05 21:32
 * @license MIT (see project's LICENSE file)
 /**


 /**
 * Escapes reserved regex characters.
 * @param {string} text
 * @return {string}
 */
function escapeRegexLiteral(text) {
	let match;
	const regex=/(\^|\$|\.|\*|\?|\+|\(|\[)/g;
	while((match=regex.exec(text))!==null) {
		text=`${text.substr(0, regex.lastIndex-1)}\\${match[0]}${text.substr(regex.lastIndex)}`;
		regex.lastIndex++;
	}
	return text;
}

module.exports={
	escapeRegexLiteral
};
