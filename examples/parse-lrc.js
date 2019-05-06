#!/usr/bin/env node
/**
 * Date: 2019-05-04 19:20
 * @license MIT (see project's LICENSE file)
 */

const run=require("./_run");

run.parse('left/right/center - padding=" ", width=10',
	"${10l}|${10c}|${10r}",
	"left      |  center  |     right"
);

run.parse('left/right/center - padding=".", paths=indexes, width=15',
	"${0:.15l}|${1:.15c}|${0:.15r}",
	"element-0......|...element-1...|......element-0"
);

run.parse('left/right/center - padding=".", paths=object, width=15',
	"${left:.15l}|${center:.15c}|${right:.15r}",
	"leftie.........|...dead-eye....|........rightie"
);
