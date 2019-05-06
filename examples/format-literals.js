#!/usr/bin/env node
/**
 * Date: 2019-05-05 20:26
 * @license MIT (see project's LICENSE file)
 */

const run=require("./_run");

run.format("fields and literals - align=left",
	"${l} + ${l} = ${l}",
	[50, 25, 50+25]
);

run.format("fields and literals - align=left",
	"${l} + ${l} = ${l}",
	[50.5, 25.25, 50.5+25.25]
);

run.format("fields and literals w/precision - align=left",
	"${l} + ${l} ~= ${l}",
	[50.5, 25.25, (50.5+25.25).toFixed(1)]
);
