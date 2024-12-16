const socket = io();

// Check if geolocation is supported by the browser
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // Emit the location to the server
      socket.emit("send-location", { latitude, longitude });

      // Update the map view and add a marker
      if (map) {
        map.setView([latitude, longitude], 15); // Center the map on the user's location
        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup("You are here!")
          .openPopup();
      }
    },
    (error) => {
      console.error("Error getting geolocation: ", error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}

// Initialize the map
const map = L.map("map").setView([0, 0], 16); // Default view at zoom level 2

// Add OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Aditya",
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude]);
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

socket.on("user-disconnected", (id) => {
  if (marker[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
