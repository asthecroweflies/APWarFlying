%clear title xlabel ylabel

fname = fullfile('E:\summa\APWarFlyer\APWarFlying\aps-data','aps.csv'); 

t = readtable(fname);
t.SSID=categorical(t.SSID);
%t.Time=datetime(t.Time);

figure,hold on
[g,ids]=findgroups(t.SSID);

%plot(x, y, 'o')

splitapply(@(x,y) plot(x,y,'o-'),t.Batch,t.RSS,findgroups(t.SSID));

legend(categories(ids), 'location', 'best');
title('Received Signal Strengths of nearby APs');
ylabel('Signal Strength (dBm)')
xlabel('Batch');
