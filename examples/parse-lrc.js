#!/usr/bin/env node
/**
 * Date: 2019-05-04 19:20
 * @license MIT (see project's LICENSE file)
 */

const run=require("./_run");

run.parse("lrc - padding=' ', width=10, paths=default",
	"${10l}|${10c}|${10r}",
	"left      |  center  |     right"
);

run.parse("lrc - padding='.', width=15, paths=indexes",
	"${0:.15l}|${1:.15c}|${0:.15r}",
	"element-0......|...element-1...|......element-0"
);

run.parse("lrc - padding='.', width=15, paths=object",
	"${left:.15l}|${center:.15c}|${right:.15r}",
	"leftie.........|...dead-eye....|........rightie"
);
