# falign

## A Rose by any other name might smell sweeter
But might not make as much sense. `f` is for "format". `align` is self explanatory. Stay tuned. All will become clear.

## Overview
`falign` is a smart and powerful formatter and parser. Anything (_almost anything_) `format` is capable of formatting may be parsed using the same format specification.  The specification we devised picks and chooses some of our favorite qualities from c's `sprintf` and python's `format` and adds some of our flavor crystals.  We tossed and turned the problem over in our heads and decided to make one big assumption which is that _almost_ everything is formatted (not necessarily parsed) as a string. We do include some basic support for specifiers such as numeric precision..

_"Hey, why do that?"_, you ask. _"I loose my ability to convert and format a number as hexadecimal. I loose my ability to format my dates according to some calendar on some far off planet in some galaxy far far away!"_  Do you? No, you don't. No formatting library will ever be able to present the bits and pieces of your data in all of the various ways you want to format it. `falign`'s concern is formatting the whole. You know how you want to present the bits and pieces of your data. Format your `Date` your `Objects`, your special sauce however you like if `toString` doesn't cut it. 

Are you still feeling gipped? Let's examine what you gain:

* align all types to either the left, right or center of a specified width and pad with character of your choice.
* align columns to the left or right or around a center.
* parse using the very same specification you used to format your data (which is heavily dependent on alignment).

Feeling better? No. Well, checkout the specification. Check out the API. Check out the examples and if you are still not happy then `sprintf` will be there for you.

## Examples
The following are all results from our [examples](./examples/.). To run the examples _NodeJS_ must be installed.

### Format alignment examples - `./examples/format-lrc.js`
**description**: _lrc - padding=" ", width=10, paths=default_
```
request: format("${10l}|${10c}|${10r}", ["left", "center", "right"])
result: "left      |  center  |     right"
```

**description**: _lrc - padding=".", width=15, paths=indexes_
```
request: format("${0:.15l}|${1:.15c}|${0:.15r}", ["element-0","element-1"])
result: "element-0......|...element-1...|......element-0"
```

**description**: _lrc - padding=".", width=15, paths=object_
```
request: format("${left:.15l}|${center:.15c}|${right:.15r}", 
   {"center": "dead-eye", "left": "leftie", "right": "rightie"})
result: "leftie.........|...dead-eye....|........rightie"
```

### Parse alignment examples - `./examples/parse-lrc.js`
**description**: _lrc - padding=" ", width=10, paths=default_
```
request: parse("${10l}|${10c}|${10r}", "left      |  center  |     right")
result: ["left", "center", "right"]
```

**description**: _lrc - padding=".", width=15, paths=indexes_
```
request: parse("${0:.15l}|${1:.15c}|${0:.15r}", "element-0......|...element-1...|......element-0")
result: ["element-0", "element-1"]
```

**description**: _lrc - padding=".", width=15, paths=object_
```
request: parse("${left:.15l}|${center:.15c}|${right:.15r}", 
   "leftie.........|...dead-eye....|........rightie")
result: {"left": "leftie", "center": "dead-eye", "right": "rightie"}
```

## Specification

### format
The format specification is a `string`. It may be composed of literals and optional _fields_. 
 The _field_ specification is as follows: `"${[path:][pad][width][.precision]<l|r|c>}"`
 * `path`: optional property path of the data in `format`'s `data` param. Defaults to the _field_ spec's index.
 * `pad`: optional character to pad with. It may not be 1-9. And `width` must be included for it to be useful. Defaults to a space.
 * `width`: optional width of field in characters.
 * `precision`: optional floating point precision. In this case the value will be treated as a `number`.
 * `l|r|c`: align left, right or center

### parse
The parse specification is a superset of the _format_ specification. Its motivations for being an extension of the _format_ specification is that we offer an optional _type_ directive. These allow us to know how to parse some simple _field_ types such as _numbers_ and _dates_. The _field_ specification is as follows: `"${[path:][pad][width][.precision]<l|r|c>[i|f|d][+]}"`
 * `path`: optional property path of the parsed value in the result object. Defaults to the _field_ spec's index.
 * `pad`: optional character the field is padded with. It may not be 1-9.
 * `width`: optional width of field in characters.
 * `precision`: optional floating point precision. _Not used at the moment. Can't see that it will ever have value._
 * `l|r|c`: aligned left, right or center.
 * `i|f|d`: optional conversion type for the field: `i`=integer, `f`=floating point, `d`=date. `string` by default.
 * `+`: optional flag which reads to end of the line. Useful for variable length fields at the end of a line.

## API

```
format(spec:string, data:(Array|Object)) -> string
```

#### Arguments
_spec (string)_: the specification string to which the formatter will format

_data (Array|Object)_: the source of data referenced in the spec. 

#### Returns
_(string)_: formatted data

```
parse(spec:string, encoded:string, {
   exceptionOnMismatch:boolean=true
}) -> (Array|Object)
```
#### Arguments
_spec (string)_: the specification string that describes the data encoded in _encoded_

_encoded (string)_: the data as (but not necessarily) formatted by `format`

_exceptionOnMismatch (boolean)_: whether to throw an exception when _encoded_ does not match the _spec_. If you set this to `false` then it will return the match up to the point at which the mismatch failed.

#### Returns
_(Array|Object)_: the result. The type depends on the paths that you use in your `spec`.

