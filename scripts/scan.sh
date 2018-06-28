#!/bin/bash
fname="ap_data.txt"
 
echo "[x] $(date):" >> data/$fname
 sudo iw dev wlp2s0 scan |\
  egrep "signal|SSID" |\
   sed '/Extended/d' |\
    sed -e "s/\tsignal: //" -e "s/\tSSID: //" |\
     awk '{ORS = (NR % 2 == 0)? "\n" : " "; print}' |\
      sort >> data/$fname
       echo "~" >> data/$fname
        cat data/$fname