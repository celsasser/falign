/**
 * Date: 2019-05-05 21:34
 * @license MIT (see project's LICENSE file)
 */

const assert=require("assert");
const utils=require("../lib/_utils");

describe("lib._utils", function() {
	describe("escapeRegexLiteral", function() {
		[
			["a"],
			["abc"],
			["1"],
			["123"]
		].forEach(character=>{
			it(`should not escape ${character}`, function() {
				const result=utils.escapeRegexLiteral(character);
				assert.strictEqual(result, character);
			});
		});

		[
			["^", "\\^"],
			["$", "\\$"],
			[".", "\\."],
			["*", "\\*"],
			["?", "\\?"],
			["+", "\\+"],
			["(", "\\("],
			["[", "\\["],
			["a + b", "a \\+ b"],
			["^ .+ $", "\\^ \\.\\+ \\$"],
		].forEach(([character, expected])=>{
			it(`should escape ${character}`, function() {
				const result=utils.escapeRegexLiteral(character);
				assert.strictEqual(result, expected);
			});
		});
	});
});
