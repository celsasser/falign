/**
 * Date: 2019-05-04 19:00
 * @license MIT (see project's LICENSE file)
 */

const falign=require("../lib");

/* eslint-disable no-console */

/**
 * @param {string} desc
 * @param {string} spec
 * @param {Array|Object} data
 * @returns {string}
 * @throws {Error}
 */
function format(desc, spec, data) {
	console.log(`\ndescription: ${desc}`);
	console.log(`request: format("${spec}", ${JSON.stringify(data)})`);
	try {
		const result=falign.format(spec, data);
		console.log(`result: "${result}"`);
	} catch(error) {
		console.error(`failed: ${error.message}`);
	}
}

/**
 * @param {string} desc
 * @param {string} spec
 * @param  {string} encoded
 * @param {boolean} exceptionOnMismatch
 * @returns {Array<*>|Object}
 * @throws {Error}
 */
function parse(desc, spec, encoded, {
	exceptionOnMismatch=true
}={}) {
	console.log(`\ndescription: ${desc}`);
	console.log(`request: parse("${spec}", "${encoded}")`);
	try {
		const result=falign.parse(spec, encoded, {
			exceptionOnMismatch
		});
		console.log(`result: ${JSON.stringify(result)}`);
	} catch(error) {
		console.error(`failed: ${error.message}`);
	}
}

module.exports={
	format,
	parse
};

