#!/bin/bash
fname="a-ap_data2.txt"
wlx7c8bca066ebb
echo "[x] $(date):" >> data/$fname
 sudo iwlist wlx7c8bca0638a9 scanning |\
  egrep "Signal level|ESSID" |\
   sed -e "s/\"ESSID://" |\
    sed 's/^.*Signal/Signal/' |\
     paste -s -d' \n' |\
      sed -e 's/\(Signal\|level=\)//g' |\
       sed -e 's/^[ \tESSID:]*//' |\
        sort >> data/$fname
         echo "~" >> data/$fname
          cat data/$fname

