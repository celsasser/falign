#!/usr/bin/env node
/**
 * Date: 2019-05-05 20:32
 * @license MIT (see project's LICENSE file)
 */

const run=require("./_run");

run.parse("fields and literals - align=left",
	"${l} + ${l} = ${l}",
	"50 + 25 = 75"
);

run.parse("fields and literals - align=left, type=integer",
	"${li} + ${li} = ${li}",
	"50 + 25 = 75"
);

run.parse("fields and literals - align=left, type=float",
	"${lf} + ${lf} = ${lf}",
	"50.5 + 25.25 = 75.75"
);

run.parse("fields and literals - align=left, type=float",
	"${lf} + ${lf} ~= ${lf}",
	"50.5 + 25.25 ~= 75.8"
);
