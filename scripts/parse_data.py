import re
import sys
import matplotlib.pyplot as plt
import numpy as np

colours = ['r', 'g', 'b']
markers = ['x', 'x', 'd']
labels = [-1, 0, 1]
valid_aps = ['ir5-hotspot', 'ir2-hotspot', 'ir6-hotspot', 'msg-Latitude-E6420', 'irobot7-ThinkPad-X131e']

class AP(object):
	name = ""
	s_strength = 0.0
	time = ""

	def __init__(self, name, s_strength, time):
		self.name = name
		self.s_strength = s_strength
		self.time = time

def main():
	
	if (len(sys.argv) != 2):
		print("Usage: python parse_data.py <data file>")
		sys.exit(1)

	ap_list = [] # list of all AP objects
	exploded_ap_name = [] # list of ap name with strings from data
	ap_strength = 0.0
	delim_line = []
	access_time = ""
	ea_set = 0
	batch = 0
	is_adapter_data = 0

	fname = sys.argv[1]
	#fname = "a-ap_data.txt"
	fpath = "/home/linny/cps/scripts/data/"+fname
	if (fname == "a-ap_data.txt"):
		is_adapter_data = 1

	if (is_adapter_data == 1):
		csv_file = open("/home/linny/cps/scripts/data/a-aps.csv", 'w+')
	elif(is_adapter_data == 0):
		csv_file = open("/home/linny/cps/scripts/data/aps.csv", 'w+')

	csv_file.write("SSID,RSS,Unit,Time,Batch\n")
	with open(fpath) as f:
		for line in f:
			exploded_ap_name = []
			valid_line = 1
			 #Check if is neither timestamp nor AP data
			if ((line[0] == " ") or (line[0] == "\t")):
				valid_line = 0

			if (valid_line == 1) and (is_adapter_data == 1):
				if (line[1] is "x"): # Timestamp lines conveniently begin with [x]
					ap_list = []# reset with new batch
					
					if len(line) < 48: # valid timestamp checking
						access_date = line[4:] #skip '[x] '
						print("\nDate: " + access_date)
					access_time = line[15:27]
					hts = int(access_time[0:2]) * 86400
					mts = int(access_time[3:5]) * 60
					time_in_s = hts + mts + int(access_time[6:8])
					if (ea_set == 0):
						earliest_access = time_in_s
						ea_set = 1
				elif(line[0] == "\""):
					exploded_ap_name = (re.findall(r'"(.*?)"', line))
					ap_name = " ".join(exploded_ap_name)
					ap_strength = float(re.findall('(\d+)\/(\d+)', line)[0][0])
					if ap_name and len(ap_name) < 32: #ignore nameless or long APs
						if not any(x.name == ap_name for x in ap_list) and (any(y == ap_name for y in valid_aps)):#ignore dupes.. (strongest AP)
							if not (ap_strength == 100):
								new_ap = AP(ap_name, ap_strength, access_date)
								ap_list.append(new_ap)
				
				# End of batch
				elif(line[0] is "~"):
					for ap in ap_list: # print current APs before next batch
						print("%-32s %10s %3s %8s Batch: %3s" % (str(ap.name), str(ap.s_strength),"/ 100", ap.time[11:19], batch))
					csvify(ap_list, batch, csv_file,is_adapter_data)
					batch = batch + 1


			elif (valid_line == 1) and (is_adapter_data == 0):
				if (line[1] is "x"): # Timestamp lines conveniently begin with [x]
					ap_list = []# reset with new batch
					
					if len(line) < 48: # valid timestamp checking
						access_date = line[4:] #skip '[x] '
						print("\nDate: " + access_date)
					access_time = line[15:27]
					hts = int(access_time[0:2]) * 86400
					mts = int(access_time[3:5]) * 60
					time_in_s = hts + mts + int(access_time[6:8])
					if (ea_set == 0):
						earliest_access = time_in_s
						ea_set = 1

				elif (line[0] is "-"): # data line starts with '-xx.xx dBm'
					delim_line = line.split()
					if (len(delim_line[0]) < 8): #ignores "Extended capabilities from some APs"
						ap_strength = float(delim_line[0])
					else:
						break
					for s in delim_line[2:]:
						exploded_ap_name.append(s)
					
				ap_name = " ".join(exploded_ap_name)
				if ap_name and len(ap_name) < 32: #ignore nameless or long APs
					if not any(x.name == ap_name for x in ap_list) and (any(y == ap_name for y in valid_aps)):#ignore dupes.. (strongest AP)
						new_ap = AP(ap_name, ap_strength, access_date)
						ap_list.append(new_ap)
						#all_aps.append(ap_name)

				# End of batch
				elif(line[0] is "~"):
					for ap in ap_list: # print current APs before next batch
						print("%-32s %10s %3s %8s" % (str(ap.name), str(ap.s_strength),"dBm", ap.time[11:19]))
					#plot(ap_list, earliest_access, batch)
					csvify(ap_list, batch, csv_file,is_adapter_data)
					batch = batch + 1


def csvify(APs, batch, csv_file, is_adapter_data):
	for ap in APs:
		#NETGEAR66,-54.00,dBm,14:48:17,1
		access_time = ap.time[11:19]
		if (is_adapter_data == 1):
			csv_file.write("%s,%f,%s,%s,%d\n" % (str(ap.name), ap.s_strength,"%",access_time, batch))
		elif (is_adapter_data == 0):
			csv_file.write("%s,%f,%s,%s,%d\n" % (str(ap.name), ap.s_strength,"dBm",access_time, batch))

#Matplotlib (deprecated)
def plot(APs, start_time, batch):
	fig = plt.figure()
	ax1 = fig.add_subplot(111)
	ax1.set_ylim([-100, 0])
	#ax1.set_xlim([0, 1900])
	ax1.set_xlim([0,6])
	#batch++
	for ap in APs:
		access_time = ap.time[11:19]
		#time_s = ( (int(access_time[0:2]) * 86400) + (int(access_time[3:5]) * 60) + int(access_time[6:8]) )
		hts = int(access_time[0:2]) * 86400
		mts = int(access_time[3:5]) * 60
		time_in_s = hts + mts + int(access_time[6:8])
		dt = time_in_s - start_time
		signal_str = ap.s_strength
		#print("ss: " + str(signal_str) + " dt: " + str(dt))
		#plt.scatter(dt, signal_str, s=10, c=colours[batch % 3], marker=markers[batch % 3], label=labels[batch % 3])
		plt.scatter(batch+1, signal_str, s=10, c=colours[batch % 3], marker=markers[batch % 3], label=labels[batch % 3])

if __name__ == "__main__":
	main()
	
#plt.show(block=True)

