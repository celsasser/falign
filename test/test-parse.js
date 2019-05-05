/**
 * Date: 2019-03-21
 * Time: 21:48
 * @license MIT (see project's LICENSE file)
 */

const assert=require("assert");
const parse=require("../lib").parse;

describe("src.parse", function() {
	it("should throw error (by default) if there are literal mismatches", function() {
		assert.throws(parse.bind(null, "spec", "encoded"),
			error=>error.message==="failed to match \"spec\" to \"encoded\"");
	});

	it("should return empty array if literal mismatches and not throwing errors", function() {
		assert.deepEqual(parse("spec", "encoded", {
			exceptionOnMismatch: false
		}), []);
	});

	[
		["${4l}", "4   ", ["4"]],
		["${-4l}", "4---", ["4"]],
		["${4r}", "   4", ["4"]],
		["${04r}", "0004", ["4"]],
		["${4c}", " 4  ", ["4"]],
		["${04c}", "0040", ["4"]]
	].forEach(([spec, encoding, expected])=>{
		it(`should successfully parse single field spec (w/width) ${spec} for "${encoding}"`, function() {
			assert.deepEqual(parse(spec, encoding), expected);
		});
	});

	[
		["${l}", "4   ", ["4"]],
		["${-l}", "4---", ["4"]],
		["${r}", "   4", ["4"]],
		["${0r}", "0004", ["4"]],
		["${c}", " 4  ", ["4"]],
		["${0c}", "0040", ["4"]]
	].forEach(([spec, encoding, expected])=>{
		it(`should successfully parse single field spec (wo/width) ${spec} for "${encoding}"`, function() {
			assert.deepEqual(parse(spec, encoding), expected);
		});
	});

	[
		["${4li}", "4", [4]],
		["${li}", "4", [4]],
		["${li}", "4.4", [4]],
		["${li+}", "4", [4]],
		["${lf}", "4", [4]],
		["${lf}", "4.4", [4.4]],
		["${lf}", "4.4", [4.4]],
		["${ld}", "2020-01-01T00:00:00.000Z", [new Date("2020-01-01T00:00:00.000Z")]]
	].forEach(([spec, encoding, expected])=>{
		it(`should properly make type conversions for spec ${spec} and "${encoding}"`, function() {
			assert.deepEqual(parse(spec, encoding), expected);
		});
	});

	it("should raise exception if date cannot be parsed", function() {
		assert.throws(parse.bind(null, "${ld}", "fail"),
			error=>error.message==="unknown date encoding \"fail\""
		);
	});

	[
		["${l+}", "4 ", ["4"]],
		["${l+}", " 4 ", [" 4"]],
		["${l+}", "4 5", ["4 5"]],
		["${l+}", "4 5 ", ["4 5"]],
		["${-l+}", "4 ", ["4 "]],
		["${-l+}", "4-", ["4"]],
		["${-l+}", "4-4-", ["4-4"]],
		["${r+}", " 4", ["4"]],
		["${r+}", " 4 5 ", ["4 5 "]],
		["${c+}", " 4 ", ["4"]],
		["${c+}", " 4 5 ", ["4 5"]]
	].forEach(([spec, encoding, expected])=>{
		it(`should successfully parse trailing (+) field spec ${spec} for "${encoding}"`, function() {
			assert.deepEqual(parse(spec, encoding), expected);
		});
	});

	[
		["a${02r}", "b01", "failed to match \"a\" to \"b\""],
		["${02r}a${02r}", "01b02", "failed to match \"a\" to \"b\""],
		["${02r}a${02r}b", "01a02c", "failed to match \"b\" to \"c\""]
	].forEach(([spec, encoding, errorText])=>{
		it(`should catch literal mismatches around field spec ${spec} for ${encoding}`, function() {
			assert.throws(parse.bind(null, spec, encoding),
				error=>error.message===errorText);
		});
	});

	[
		["${3l}${3l}", "4  5  ", ["4", "5"]],
		["${3r}${3r}", "  4  5", ["4", "5"]],
		["${3c}${3c}", " 4  5 ", ["4", "5"]],
		// this one is debatable - the width spec is not fulfilled but it's the last spec. We are going to let it ride.
		["${2l}${2l}", "4 5", ["4", "5"]],
		["${2l}${2l}", "4455", ["44", "55"]],
		["${2r}${2l}", "4455", ["44", "55"]],
		["${-2l}${-2r}", "4--5", ["4", "5"]],
		["${-2l}-${-2r}", "4---5", ["4", "5"]]
	].forEach(([spec, encoding, expected])=>{
		it(`should successfully parse complex field spec (w/width) ${spec} for "${encoding}"`, function() {
			assert.deepEqual(parse(spec, encoding), expected);
		});
	});

	it("should fail if more fields specs than there are encoded fields (with width)", function() {
		assert.throws(parse.bind(null, "${2r}{2r}", "2 "),
			error=>error.message==="failed to match \"{2r}\" to \"\"");
	});

	[
		["${l}${l}", "4  5  ", ["4", "5"]],
		["${r}${r}", "  4  5", ["4", "5"]],
		["${c}${c}", " 4  5 ", ["4", "5"]],
		["${l}|${-r}", "4   |---5", ["4", "5"]],
		[" ${l}${-c} ", " 4 -5- ", ["4", "5"]]
	].forEach(([spec, encoding, expected])=>{
		it(`should successfully parse complex field spec (wo/width) ${spec} for "${encoding}"`, function() {
			assert.deepEqual(parse(spec, encoding), expected);
		});
	});

	[
		["${r}${l}", " 45 ", ["45", ""]],
		["${l}${l}", "44aa", ["44aa", ""]]
	].forEach(([spec, encoding, expected])=>{
		it(`should return wonky results due to ambiguity when no width included: spec ${spec} for "${encoding}"`, function() {
			assert.deepEqual(parse(spec, encoding), expected);
		});
	});

	[
		["${0:2l}", "4 ", ["4"]],
		["${a:2l}", "4 ", {a: "4"}],
		["${0:2l}${a:2l}", "4 c ", {0: "4", a: "c"}],
		["${a.b:2l}${a.c:2l}", "4455", {a: {b: "44", c: "55"}}]
	].forEach(([spec, encoding, expected])=>{
		it(`should properly encode result for specs with path variables: ${spec} for "${encoding}"`, function() {
			assert.deepEqual(parse(spec, encoding), expected);
		});
	});

	it("should be smart about interleaved text and fields without width", function() {
		const encoded="curtis            1481  97  3949620 201:24.66 124:35.77 Google Chrome   ",
			spec="${l} ${ri} ${ri} ${ri} ${r} ${r} ${l+}",
			result=parse(spec, encoded);
		assert.deepEqual(result, [
			"curtis",
			1481,
			97,
			3949620,
			"201:24.66",
			"124:35.77",
			"Google Chrome"
		]);
	});

	describe("examples", function() {
		it('should successfully parse: lrc - padding=" ", width=10, paths=default', function() {
			const result=parse("${10l}|${10c}|${10r}", "left      |  center  |     right");
			assert.deepStrictEqual(result, ["left", "center", "right"]);
		});

		it('should successfully parse: lrc - padding=".", width=15, paths=indexes', function() {
			const result=parse("${0:.15l}|${1:.15c}|${0:.15r}", "element-0......|...element-1...|......element-0");
			assert.deepStrictEqual(result, ["element-0", "element-1"]);
		});

		it('should successfully parse: lrc - padding=".", width=15, paths=indexes', function() {
			const result=parse("${left:.15l}|${center:.15c}|${right:.15r}", "leftie.........|...dead-eye....|........rightie");
			assert.deepStrictEqual(result, {"left": "leftie", "center": "dead-eye", "right": "rightie"});
		});
	});
});
