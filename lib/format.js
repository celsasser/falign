/**
 * Date: 2019-03-20
 * Time: 22:40
 * @license MIT (see project's LICENSE file)
 *
 * sprintf like functionality with a different spec
 */

const _=require("lodash");

/* eslint-disable no-inner-declarations */

/**
 * Formats the data in <param>blob<param>. We are using a somewhat hybrid approach to formatting. It's a little
 * sprintf, it's a little es6 template and it's a little custom.
 * The format spec is as follows: "${[path:][pad][width][.precision]<l|r|c>}":
 * - path: optional property path of the data in <param>data</param>. Defaults to field spec index.
 * - pad: optional character to pad with. It may not be 1-9. And width must be included for it to be useful.
 * - width: optional width of field in characters.
 * - precision: optional floating point precision
 * - l|r|c: align left, right or center
 * @param {string} format
 * @param {Array|Object} data
 * @returns {string}
 * @throws {Error}
 */
module.exports=function(format, data) {
	let result=format;
	const regex=/(\$\\{)|(\${([^:]+?:)?([^1-9])?(\d+)?(\.\d+)?([lrc])})/g;
	for(let match, index=0; (match=regex.exec(result)); index++) {
		if(match[1]!==undefined) {
			result=`${result.substr(0, match.index)}$\{${result.substr(regex.lastIndex)}`;
		} else {
			/**
			 * @param {*} data
			 * @returns {string}
			 */
			function _format(data) {
				if(data===undefined) {
					return "undefined";
				} else if(data===null) {
					return "null";
				} else if(precision!==undefined) {
					return _assertType(data, "Number")
						.toFixed(precision);
				}
				return String(data);
			}

			/**
			 * @param {string} formatted
			 * @returns {string}
			 */
			function _pad(formatted) {
				if(width!==undefined) {
					switch(align) {
						case "l": {
							return _.padEnd(formatted, width, fill);
						}
						case "r": {
							return _.padStart(formatted, width, fill);
						}
						case "c": {
							return _.pad(formatted, width, fill);
						}
					}
				}
				return formatted;
			}

			let path=(match[3]!==undefined) ? match[3].substr(0, match[3].length-1) : index,
				fill=match[4] || " ",
				width=(match[5]!==undefined) ? Number(match[5]) : undefined,
				precision=(match[6]!==undefined) ? Number(match[6].substr(1)) : undefined,
				align=match[7],
				format=_.get(data, path);
			if(format===undefined) {
				throw new Error(`data[${path}] cannot be found`);
			} else {
				let formatted=_pad(_format(format));
				result=`${result.substr(0, match.index)}${formatted}${result.substr(regex.lastIndex)}`;
				regex.lastIndex=match.index+formatted.length;
			}
		}
	}
	return result;
};

/**
 * Asserts the type is of the (constructor) type specified by <param>type</param>
 * @param {*} value
 * @param {string} type
 * @returns {*}
 * @throws {Error}
 * @private
 */
function _assertType(value, type) {
	if(value==null || value.constructor.name!==type) {
		throw new Error(`expecting ${type} but found "${value}"`);
	}
	return value;
}

