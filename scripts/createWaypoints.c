#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#include <libARSAL/ARSAL.h>
#include <libARController/ARController.h>
#include <libARMavlink/libARMavlink.h>
#include <libARDiscovery/ARDiscovery.h>

int main(int argc, char *argv[])
{
    mavlink_mission_item_t item;
    eARMAVLINK_ERROR error;
    ARMAVLINK_FileGenerator_t *generator = ARMAVLINK_FileGenerator_New(&error);
    
    float latitude;
    float longitude;
    float altitude;
    float yaw = 25.0;
    float pitch;
	float delay;

    char proceed = 'Y';

    while (proceed == 'Y')
    {
        char choice = 'X';

        printf("\n\nEnter MAVLink Option \n\tTakeoff Mission Item - T\n\tAdd Waypoint - W\n\tStart Video Capture - V\n\tStop Video Capture - X\n\tCapture Image - I\n\tAdd Delay at Waypoint (ms) - D\n\tLand Mission Item - L\n");
        scanf(" %c", &choice);

        switch(choice)
        {
        case 'T':
            printf("\nEnter Latitude, Longitude, and Altitude(m) from where to take off: ");
            scanf("%f %f %f", &latitude, &longitude, &altitude);
	    //yaw = atan(
            
            error = ARMAVLINK_MissionItemUtils_CreateMavlinkTakeoffMissionItem(&item, longitude, latitude, altitude, yaw, 0);
            error = ARMAVLINK_FileGenerator_AddMissionItem(generator, &item);
            break;

        case 'W':
            printf("\nEnter Latitude, Longitude, and Altitude(m) to add as a waypoint: ");
            scanf("%f %f %f", &latitude, &longitude, &altitude);
            
            error = ARMAVLINK_MissionItemUtils_CreateMavlinkNavWaypointMissionItem(&item, longitude, latitude, altitude, 0);
            error = ARMAVLINK_FileGenerator_AddMissionItem(generator, &item);
            break;

        case 'L':
            printf("\nEnter Latitude, Longitude, and Altitude(m) on where to land: ");
            scanf("%f %f %f", &latitude, &longitude, &altitude);

            error = ARMAVLINK_MissionItemUtils_CreateMavlinkLandMissionItem(&item, longitude, latitude, altitude, 0);
            error = ARMAVLINK_FileGenerator_AddMissionItem(generator, &item);
            break;

        case 'D':
            printf("\nEnter amount of delay (ms): ");
            scanf("%f", &delay);

            error = ARMAVLINK_MissionItemUtils_CreateMavlinkDelay(&item, delay);
            error = ARMAVLINK_FileGenerator_AddMissionItem(generator, &item);
            break;

        default:
            printf("Invalid choice.");
        }

        printf("Add another mission item? (Y/N) ");
        scanf(" %c", &proceed);

    };


	printf("MAVLink file generated.");    
    char* filePath = "/home/irobot7/Desktop/flightplan.mavlink";
	ARMAVLINK_FileGenerator_CreateMavlinkFile(generator, filePath);

    return 0;
}
