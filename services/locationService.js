twoWheelWanderApp
 .service("IndexedDBService", indexedDBService)
 .run(function (IndexedDBService) {
  const locationsIndia = [
   { city: "Mumbai", enabled: true },
   { city: "Delhi", enabled: true },
   { city: "Bangalore", enabled: true },
   { city: "Chennai", enabled: true },
   { city: "Jaipur", enabled: true },
   { city: "Lucknow", enabled: true },
  ];

  IndexedDBService.openDatabase()
   .then((db) => {
    // Check if the 'locations' object store is empty
    return IndexedDBService.countNoOfRecords(db, "locations").then((count) => {
     // If 'locations' store is empty
     if (count === 0) {
      // Using map to create a promise for each location
      var locationPromises = locationsIndia.map((location) => {
       // addToObjectStore for each location returns a promise
       return IndexedDBService.addToObjectStore(db, "locations", location);
      });
      // Wait for all the promises to resolve
      return Promise.all(locationPromises)
       .then(() => {
        console.log("Locations added successfully");
       })
       .catch((error) => {
        console.error("Error adding locations:", error);
       });
     } else {
      console.log("Locations store is not empty. Skipping adding locations.");
     }
    });
   })
   .catch((error) => {
    console.error("Error opening database:", error);
   });
 });
