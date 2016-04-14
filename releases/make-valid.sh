#!/bin/bash -e

if [ "$#" -ne 2 ]; then
  echo "Make MathJax output valid HTML"
  echo "Usage: ./make-valid.sh invalid.html valid.html"
else
  sed 's/<nobr/<span class="nobr"/;s/<\/nobr>/<\/span>/;s/.MathJax nobr/.MathJax .nobr/' $1 > $2
fi