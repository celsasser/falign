/**
 * Date: 2019-03-21
 * Time: 21:48
 * @license MIT (see project's LICENSE file)
 */

const assert=require("assert");
const format=require("../lib/format");

describe("src.format", function() {
	it("should return spec string if no format specs are in the spec string", function() {
		assert.strictEqual(format(""), "");
		assert.strictEqual(format("input", null), "input");
	});

	[
		["${l}", null, "data[0] cannot be found"],
		["${0:l}", null, "data[0] cannot be found"],
		["${1:l}", [0], "data[1] cannot be found"],
		["${a:l}", null, "data[a] cannot be found"],
		["${a:l}", {}, "data[a] cannot be found"]
	].forEach(([spec, data, text])=>{
		it(`should throw 'cannot be found' exception for spec ${spec} and ${JSON.stringify(data)}`, function() {
			assert.throws(format.bind(null, spec, data),
				error=>error.message===text);
		});
	});

	[
		["${l}", [5], "5"],
		["${0:l}", [5], "5"],
		["${l}", ["five"], "five"],
		["${0:l}", ["five"], "five"],
		["${1:l}", [5, 6], "6"],
		["${a:l}", {a: 5}, "5"],
		["${a:l}", {a: "five"}, "five"],
		["${a.b:l}", {a: {b: 5}}, "5"],
		["${a.b:l}", {a: {b: "five"}}, "five"]
	].forEach(([spec, data, expected])=>{
		it(`should properly make basic single substitutions for spec ${spec} and data=${JSON.stringify(data)}`, function() {
			assert.strictEqual(format(spec, data), expected);
		});
	});

	[
		["${3l}", [5], "5  "],
		["${3c}", [5], " 5 "],
		["${3r}", [5], "  5"],
		["${03l}", [5], "500"],
		["${03c}", [5], "050"],
		["${03r}", [5], "005"],
		["${*3l}", [5], "5**"],
		["${*3c}", [5], "*5*"],
		["${*3r}", [5], "**5"],
		["${6.2l}", [5.1234], "5.12  "],
		["${6.2c}", [5.1234], " 5.12 "],
		["${6.2r}", [5.1234], "  5.12"]
	].forEach(([spec, data, expected])=>{
		it(`should properly apply format options for spec ${spec} and ${JSON.stringify(data)}`, function() {
			assert.strictEqual(format(spec, data), expected);
		});
	});

	[
		["test: ${l}, ${l}, ${l}", [1, 2, 3], "test: 1, 2, 3"],
		["test: ${2:l}, ${1:l}, ${0:l}", [1, 2, 3], "test: 3, 2, 1"],
		["test: ${0:l}, ${0:l}, ${0:l}", [1], "test: 1, 1, 1"],
		["$\\{0:l}=${0:l}", ["one"], "${0:l}=one"]
	].forEach(([spec, data, expected])=>{
		it(`should properly format more complex configuration: spec=${spec} and data=${JSON.stringify(data)}`, function() {
			assert.strictEqual(format(spec, data), expected);
		});
	});
});
