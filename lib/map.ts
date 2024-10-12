import { Driver, MarkerData } from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver) => {
    const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005

    return {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      ...driver,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
  const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

/*export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  )
    return;

  try {
    const timesPromises = markers.map(async (marker) => {
      const responseToUser = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${marker.latitude},${marker.longitude}&destination=${userLatitude},${userLongitude}&key=${directionsAPI}`,
      );
      const dataToUser = await responseToUser.json();
      const timeToUser = dataToUser.routes[0].legs[0].duration.value; // Time in seconds

      const responseToDestination = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&key=${directionsAPI}`,
      );
      const dataToDestination = await responseToDestination.json();
      const timeToDestination =
        dataToDestination.routes[0].legs[0].duration.value; // Time in seconds

      const totalTime = (timeToUser + timeToDestination) / 60; // Total time in minutes
      const price = (totalTime * 0.5).toFixed(2); // Calculate price based on time

      return { ...marker, time: totalTime, price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Error calculating driver times:", error);
  }
};  */


export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  )
    return;

  const openRouteServiceAPI = "https://api.openrouteservice.org/v2/directions/";
  const apiKey = "5b3ce3597851110001cf624843a25fd7743e4576a82d992a123a3396";
  const minDistanceThreshold = 0.05; // Distance threshold in km for very short trips

  try {
    const timesPromises = markers.map(async (marker) => {
      const driverLat = marker.latitude;
      const driverLng = marker.longitude;
      const userLat = userLatitude!;
      const userLng = userLongitude!;

      // Calculate the distance between the driver and user (in kilometers)
      const distanceToUser = getDistanceFromLatLonInKm(driverLat, driverLng, userLat, userLng);

      // Fallback for short distances: skip the API call and assume a default small time
      if (distanceToUser < minDistanceThreshold) {
        if (__DEV__) console.log(`Driver is very close to the user: ${distanceToUser} km`);
        return { ...marker, time: 1, price: "1.00" }; // Assume 1 minute and default price
      }

      // Choose "foot-walking" if the distance is less than 1 km, otherwise use "driving-car"
      const travelMode = distanceToUser < 1 ? "foot-walking" : "driving-car";
      const routeAPI = `${openRouteServiceAPI}${travelMode}`;
      
      const startCoordsDriver = `${driverLng},${driverLat}`;
      const endCoordsUser = `${userLng},${userLat}`;

      if (__DEV__) console.log(`Calculating route from driver to user using ${travelMode}: ${startCoordsDriver} -> ${endCoordsUser}`);

      let timeToUser;
      try {
        const responseToUser = await fetch(
          `${routeAPI}?api_key=${apiKey}&start=${startCoordsDriver}&end=${endCoordsUser}`
        );

        if (!responseToUser.ok) throw new Error('No route data'); // Trigger fallback if request fails

        const dataToUser = await responseToUser.json();

        if (!dataToUser.routes || !dataToUser.routes[0].segments) throw new Error('No route data'); // Trigger fallback if no routes found

        timeToUser = dataToUser.routes[0].segments[0].duration / 60; // Time in minutes
      } catch (error) {
        if (__DEV__) console.warn(`No route data found from driver to user: ${startCoordsDriver} -> ${endCoordsUser}`);
        timeToUser = 5; // Fallback time in minutes (e.g., assume 5 minutes for undetermined routes)
      }

      const startCoordsUser = `${userLng},${userLat}`;
      const endCoordsDestination = `${destinationLongitude},${destinationLatitude}`;

      let timeToDestination;
      try {
        const responseToDestination = await fetch(
          `${routeAPI}?api_key=${apiKey}&start=${startCoordsUser}&end=${endCoordsDestination}`
        );

        if (!responseToDestination.ok) throw new Error('No route data'); // Trigger fallback if request fails

        const dataToDestination = await responseToDestination.json();

        if (!dataToDestination.routes || !dataToDestination.routes[0].segments) throw new Error('No route data'); // Trigger fallback if no routes found

        timeToDestination = dataToDestination.routes[0].segments[0].duration / 60; // Time in minutes
      } catch (error) {
        if (__DEV__) console.warn(`No route data found from user to destination: ${startCoordsUser} -> ${endCoordsDestination}`);
        timeToDestination = 10; // Fallback time in minutes (e.g., assume 10 minutes for undetermined routes)
      }

      // Calculate total time and price
      const totalTime = timeToUser + timeToDestination; // Total time in minutes
      const price = (totalTime * 0.5).toFixed(2); // Calculate price based on time

      return { ...marker, time: totalTime, price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    if (__DEV__) console.error("Error calculating driver times:", error);
  }
};

// Helper function to calculate the distance between two latitude/longitude points in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon1 - lon2);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
