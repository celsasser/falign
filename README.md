# falign

## A Rose by any other name might smell sweeter
But might not make as much sense. `f` for "format". `align` is self explanatory. Stay tuned. All will become clear.

## Overview
`falign` is a smart and powerful formatter and parser. Anything (_almost anything_) `format` is capable of formatting may be parsed using the same format specification.  The specification we devised picks and chooses some of our favorite qualities from `sprintf`, from python's `format` and adds some of our flavor crystals.  We tossed and turned the problem over in our heads and decided to make one big assumption which is that everything be formatted (not necessarily parsed) as a string. 

"Hey, why do that?", you ask. "I loose my ability to convert and format a number in hexadecimal. I loose my ability to format my dates according to some calendar on some far off planet in some galaxy far far away!"  Do you? No, you don't. No formatting library will ever be able to present the bits and pieces of your data in all of the various ways you want to format it. `falign`'s concern is formatting the whole. You know how you want to present the bits and pieces of your data. Format your `Date`s your `Number`s, your special sauce however you like. 

Are you still feeling gipped? Let's examine what you loose with most format libraries. You loose the ability:

* align all types to either the left, right or center of a specified width.
* align columns to the left or right or around a center.
* parse using the very same specification you used to format your data (which is heavily dependent on alignment).

Feeling better? No. Well, checkout the specification. Check out the API. Check out the examples and if you are still not happy then `sprintf` will be there for you.

## Examples

## Specification

### format
 * The format spec is as follows: "${[path:][pad][width][.precision]<l|r|c>}":
 * - path: optional property path of the data in <param>data</param>. Defaults to field spec index.
 * - pad: optional character to pad with. It may not be 1-9. And width must be included for it to be useful.
 * - width: optional width of field in characters.
 * - precision: optional floating point precision
 * - l|r|c: align left, right or center

### parse
 * The format spec is as follows: "${[path:][pad][width][.precision]<l|r|c>[i|f|d][+]}"
 * - path: optional property path of the value in the result. Defaults to field spec index.
 * - pad: optional character field is padded with. It may not be 1-9.
 * - width: optional width of field in characters.
 * - precision: optional floating point precision
 * - l|r|c: aligned left, right or center
 * - i|f|d: optional conversion type for the field: i=integer, f=floating point, d=date. String by default.
 * - +: optional flag which reads to end of the line. Useful for variable length fields at the end of a line.

## API

```
format(spec:string, data:(Array|Object)) -> string
```

#### Arguments
_spec (string)_: the specification string to which the formatter will format

_data (Array|Object)_: the source of data referenced in the spec. 

#### Returns
_(string)_: formatted data

&nbsp;
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

