/**
 * Date: 2019-05-04 01:12
 * @license MIT (see project's LICENSE file)
 */

const storage={
	format: null,
	parse: null
};

module.exports={
	/**
	 * @returns {function(format:string, data:(Array<*>|Object)):string}
	 */
	get format() {
		return (storage.format)
			? storage.format
			: (storage.format=require("./format"));
	},

	/**
	 * @returns {function(format:string, encoded:string, {exceptionOnMismatch:boolean}):(Array<*>|string)}
	 */
	get parse() {
		return (storage.parse)
			? storage.parse
			: (storage.parse=require("./parse"));
	}
};
