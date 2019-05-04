/**
 * Date: 2019-03-20
 * Time: 22:40
 * @license MIT (see project's LICENSE file)
 *
 * parses text formatted by our own i-say spec or any data that is in a columnar format
 */

const _=require("lodash");

/* eslint-disable no-inner-declarations */

/**
 * Disassembles what could have been put together by format. If width is included then we can assure
 * 100% accuracy provided <param>encoded</param> does not fall out of bounds. But if widths are not included then this function
 * does it's best by looking for padded boundaries. But should one field butt up against another it is impossible for this
 * function to know exactly where the division should be made and the results you get probably aren't the ones you are expecting.
 * The format spec is as follows: "${[path:][pad][width][.precision]<l|r|c>[i|f|d][+]}"
 * - path: optional property path of the value in the result. Defaults to field spec index.
 * - pad: optional character field is padded with. It may not be 1-9.
 * - width: optional width of field in characters.
 * - precision: optional floating point precision
 * - l|r|c: aligned left, right or center
 * - i|f|d: optional conversion type for the field: i=integer, f=floating point, d=date. String by default.
 * - +: optional flag which reads to end of the line. Useful for variable length fields at the end of a line.
 * @param {string} format
 * @param {string} encoded
 * @param {boolean} exceptionOnMismatch - can't see value in partial matches but leaving wiggle room.
 * @returns {Array<string>}
 * @throws {Error}
 */
module.exports=function(format, encoded, {
	exceptionOnMismatch=true
}={}) {
	/**
	 * Finds fields specifiers in <param>format</param> and returns them in order of appearance
	 * @returns {Object}
	 */
	function _getFieldSpecifiers() {
		let result=[];
		const matches=[],
			regex=/(\${([^:]+?:)?([^1-9])?(\d+)?(\.\d+)?([lrc])([dfi]?)([+]?)})/g;
		for(let match, index=0; (match=regex.exec(format)); index++) {
			let lastSpecEndIndex=(index>0)
				? matches[index-1].specEndIndex
				: 0,
				parsed={
					fieldPath: (match[2]!==undefined) ? match[2].substr(0, match[2].length-1) : index,
					fieldFill: match[3] || " ",
					fieldWidth: (match[4]!==undefined) ? Number(match[4]) : undefined,
					fieldPrecision: (match[5]!==undefined) ? Number(match[5].substr(1)) : undefined,
					fieldAlign: match[6],
					fieldType: match[7],
					fieldFlag: match[8],
					specEndIndex: regex.lastIndex,
					specStartIndex: match.index,
					specPrefix: format.substr(lastSpecEndIndex, match.index-lastSpecEndIndex)
				};
			matches.push(parsed);
			// here we make adjustments to the result type. If any of the params are non-integers then we assume
			// that they want to resulting type to be an object
			if(/^\d+$/.test(parsed.fieldPath)===false) {
				result={};
			}
		}
		return {
			matches,
			result
		};
	}

	/**
	 * Something failed. Depending on how we are configured we either throw an
	 * exception or returns successful matches.
	 * @param {string} text
	 * @returns {Array<string>}
	 * @throws {Error}
	 */
	function _processFailure(text) {
		if(exceptionOnMismatch) {
			throw new Error(text);
		} else {
			// we've only managed a partial match.
			return matches;
		}
	}

	let lastEncodedEndIndex=0,
		lastSpecEndIndex=0;
	const {matches, result}=_getFieldSpecifiers();
	for(let index=0; index<matches.length; index++) {
		let {
			fieldAlign,
			fieldFill,
			fieldFlag,
			fieldPath,
			fieldWidth,
			fieldType,
			match,
			specPrefix,
			specStartIndex,
			specEndIndex
		}=matches[index];

		/**
		 * Converts the data to the specified type if there is a specified <code>fieldType</code>
		 * @param {string} data
		 * @returns {*}
		 * @throws {Error}
		 * @private
		 */
		function _convert(data) {
			switch(fieldType) {
				case "d": {
					const offset=Date.parse(data);
					if(Number.isNaN(offset)) {
						throw new Error(`unknown date encoding "${data}"`);
					} else {
						return new Date(offset);
					}
				}
				case "f": {
					return Number.parseFloat(data);
				}
				case "i": {
					return Number.parseInt(data);
				}
				default: {
					return data;
				}
			}
		}

		/**
		 * @param {string} data
		 * @return {string|undefined}
		 */
		function _depad(data) {
			switch(fieldAlign) {
				case "l": {
					const regex=new RegExp(`^[^${fieldFill}]*`),
						match=regex.exec(data);
					return _.get(match, "0");
				}
				case "r":
				case "c": {
					const regex=new RegExp(`^${fieldFill}*([^${fieldFill}]*)`),
						match=regex.exec(data);
					return _.get(match, "1");
				}
			}
		}

		/**
		 * This algorithm is for the problem children that don't have widths. It is here that we have potential issues.
		 * And those issues will be caused by encodings that are not padded. Buyer beware.
		 * @returns {({data:string, length:Number}|null)}
		 */
		function _decipher() {
			// all we know is that our data is somewhere between now and the end of time
			const data=encoded.substring(lastEncodedEndIndex);
			switch(fieldAlign) {
				case "l": {
					const suffix=_.get(matches[index+1], "specPrefix", ""),
						regex=new RegExp(`^(([^${fieldFill}]*)${fieldFill}*)${suffix}`),
						match=regex.exec(data);
					return (match===null)
						? null
						: {
							data: match[2],
							length: match[1].length
						};
				}
				case "r": {
					const trailingFill=_.get(matches[index+1], "fieldFill", fieldFill),
						regex=new RegExp(`^${fieldFill}*([^${trailingFill}]*)`),
						match=regex.exec(data);
					return (match===null)
						? null
						: {
							data: match[1],
							length: match[0].length
						};
				}
				case "c": {
					const suffix=_.get(matches[index+1], "specPrefix", ""),
						regex=new RegExp(`^(${fieldFill}*([^${fieldFill}]*)${fieldFill}*)${suffix}`),
						match=regex.exec(data);
					return (match===null)
						? null
						: {
							data: match[2],
							length: match[1].length
						};
				}
			}
		}

		/**
		 * Gets the remaining meaningful bits of a line. We will still strip off padding but only in keeping with <code>fieldAlign</code>.
		 * @returns {string}
		 */
		function _trailing() {
			const result=encoded.substring(lastEncodedEndIndex);
			switch(fieldAlign) {
				case "l": {
					return _.trimEnd(result, fieldFill);
				}
				case "r": {
					return _.trimStart(result);
				}
				case "c": {
					return _.trim(result);
				}
			}
		}

		// 1. make sure the junk between the end of the last field specifier and this field specifier are identical
		let encodedPrefix=encoded.substr(lastEncodedEndIndex, specPrefix.length);
		if(specPrefix!==encodedPrefix) {
			return _processFailure(`failed to match "${specPrefix}" to "${encodedPrefix}"`);
		} else {
			lastEncodedEndIndex+=specStartIndex-lastSpecEndIndex;
		}

		// 2. match the field specifier to the encoded text. The algorithm differs depending on whether:
		// - we are getting the rest of a line
		// - whether there is a width
		// - otherwise it's up to us to "decipher" the field
		if(fieldFlag==="+") {
			_.set(result, fieldPath, _convert(_trailing()));
			lastEncodedEndIndex=encoded.length;
		} else if(fieldWidth!==undefined) {
			let encodedField=encoded.substr(lastEncodedEndIndex, fieldWidth),
				depadded=_depad(encodedField);
			if(depadded===undefined) {
				return _processFailure(`could not parse "${encodedField}" with "${match[0]}"`);
			} else {
				_.set(result, fieldPath, _convert(depadded));
				lastEncodedEndIndex+=fieldWidth;
			}
		} else {
			let deciphered=_decipher();
			if(deciphered===undefined) {
				return _processFailure(`could not match "${match[0]}"`);
			} else {
				_.set(result, fieldPath, _convert(deciphered.data));
				lastEncodedEndIndex+=deciphered.length;
			}
		}
		lastSpecEndIndex=specEndIndex;
	}
	const specTrailing=format.substr(lastSpecEndIndex),
		encodedTrailing=encoded.substr(lastEncodedEndIndex);
	if(specTrailing!==encodedTrailing) {
		return _processFailure(`failed to match "${specTrailing}" to "${encodedTrailing}"`);
	}
	return result;
};
