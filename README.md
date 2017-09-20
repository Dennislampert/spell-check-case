# spell-check-camel package

Simple spellcheck package with support for camelCase and snak_case
Runs when package is saved. Runs on any file type..
Needs to be activated one time on a new atom process, then it spellcheck current tab/pain for miss spelled words.

activate command:
`ctrl-alt-o`

This is using `spellchecker`, and can be found here:
https://www.npmjs.com/package/spellchecker


spell-check-camel package doesn't support
• words like this "doesn't" due to the '
• it has not implemented any suggestion, witch actually is supported in `spellchecker package`.
• is doesn't have support to add new words, but is supported `spellchecker package`

It will show a message if it found any miss spelled word on the current file, on save.
This is to enlighten users that a word might not visible on current scroll height, is miss spelled.


Some inspiration is used from package `highlight-selected` and can be found here: https://github.com/richrace/highlight-selected

Example 1 camelCase and dash
https://s3-eu-west-1.amazonaws.com/infracastle/public/images/Screen+Shot+2017-01-21+at+23.06.55.png

Example 2 snake_case and dash
https://s3-eu-west-1.amazonaws.com/infracastle/public/images/Screen+Shot+2017-01-21+at+23.07.08.png

The bell, showing for 500 milli seconds
https://s3-eu-west-1.amazonaws.com/infracastle/public/images/Screen+Shot+2017-01-21+at+23.11.14.png
