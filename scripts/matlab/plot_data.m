%clear title xlabel ylabel
adapter_data = 0;

if adapter_data == 0
    fname = fullfile('/home/linny/cps/scripts/data','aps.csv');
else
    fname = fullfile('/home/linny/cps/scripts/data','a-aps.csv'); 
end
t = readtable(fname);
t.SSID=categorical(t.SSID);
%t.Time=datetime(t.Time);

figure,hold on
[g,ids]=findgroups(t.SSID);
splitapply(@(x,y) plot(x,y,'o-'),t.Batch,t.RSS,findgroups(t.SSID));
legend(categories(ids), 'location', 'best');
if adapter_data == 0
    title('Received Signal Strengths of nearby APs (Integrated Card)');
    ylabel('Signal Strength (dBm)')
else
    title('Received Signal Strengths of nearby APs (TP-Link Adapter)');
    ylabel('Signal Strength (%)')
end
xlabel('Batch Number');
