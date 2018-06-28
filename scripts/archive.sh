#!/bin/bash
if [ "$#" -ne 1 ]; then
    echo "Usage: ./archive <file-name>"
    exit 1
fi

fname=$1
file_cnt="$(find data/ -type f | wc -l)"
new_file_name=$fname
new_file_name+=$file_cnt
new_file_name+=".txt"
mv data/$fname.txt data/archived_data/$new_file_name