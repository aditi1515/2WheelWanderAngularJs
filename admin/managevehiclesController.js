function manageVehiclesController($scope, IndexedDBService, $route) {
 $scope.showDialogVal = false;
 $scope.showVehicleDeleteDialogVal = false;
 $scope.vehicleEditEnabled = false;
 $scope.vehicleSelectedForDelete = null;
 //to show dialog on clicking add vehicle button
 $scope.showDialog = function () {
  console.log($scope.showDialogVal);

  $scope.addVehicleForm.$setUntouched();
  $scope.addVehicleFormData = angular.copy("");
  $scope.addVehicleForm.$setPristine();
  $scope.showDialogVal = true;

  // set locations in scope
  IndexedDBService.openDatabase()
   .then(function (db) {
    return IndexedDBService.getAllFromObjectStore(db, "locations");
   })
   .then(function (locations) {
    console.log(locations);
    $scope.$apply(function () {
     $scope.locations = locations;
    });
   })
   .catch(function (err) {
    console.log("Error in getting locations", err);
   });
 };

 //to close dialog on clicking close button
 $scope.closeDialog = function () {
  $route.reload();
  $scope.showDialogVal = false;
 };

 $scope.showVehicleEditDialog = function (vehicle) {
  $scope.vehicleEditEnabled = true;
  $scope.vehicleFormData = angular.copy(vehicle);
  $scope.showDialog();
 };

 $scope.showVehicleDeleteDialog = function (vehicle) {
  $scope.vehicleSelectedForDelete = vehicle;
  $scope.showVehicleDeleteDialogVal = true;
 };

 $scope.closeVehicleDeleteDialog = function () {
  $scope.vehicleSelectedForDelete = null;
  $scope.showVehicleDeleteDialogVal = false;
 };

 // handle location select

 //handle fileupload input
 $scope.uploadImage = function (files) {
  var reader = new FileReader();

  reader.onload = function (event) {
   $scope.$apply(function () {
    $scope.vehicleFormData.vimg = event.target.result;
   });
  };

  reader.readAsDataURL(files[0]);
 };

 //add vehicle on submitting form
 $scope.addVehicleFormSubmit = function (form) {
  if (form.$valid) {
   console.log("here");
   var vehicleData = $scope.vehicleFormData;
   console.log(vehicleData);
   IndexedDBService.openDatabase()
    .then(function (db) {
     return IndexedDBService.addToObjectStore(db, "vehicles", vehicleData);
    })
    .then(function () {
     console.log("Added vehicle to database ");
    })
    .then(function () {
     $route.reload();
    })
    .catch(function (error) {
     console.log("Error in adding vehicle from form: " + error);
    });
  } else {
   // If the form is invalid, display an error message or take appropriate action
   console.error("Form is invalid. Please correct the errors.");
  }
 };

 // Function to determine the active status of a vehicle using the cached data
 $scope.isVehicleActive = function (vehicleId) {
  console.log("vehicleStatusMap",$scope.vehicleStatusMap);
  return $scope.vehicleStatusMap[vehicleId] || false; // Return true if active, false otherwise
 };

 //delete vehicle

 $scope.deleteVehicle = function (vehicleId) {
  IndexedDBService.openDatabase()
   .then(function (db) {
    IndexedDBService.deleteObject(db, "vehicles", vehicleId);
   })
   .then(function () {
    console.log("Vehicle deleted successfully");
    $route.reload();
   });
 };

 //display vehicles on page

 var displayVehicles = function () {
  IndexedDBService.openDatabase()
   .then(function (db) {
    return IndexedDBService.getAllFromObjectStore(db, "vehicles");
   })
   .then(function (vehicles) {
    $scope.vehicles = vehicles;
    $scope.$apply();
    console.log($scope.vehicles);
   })

   .catch(function (error) {
    console.log("Error in getting all the vehicles", error);
   });
 };
 displayVehicles();

 function prepareVehicleAvailablityMap() {
  IndexedDBService.openDatabase().then(function (db) {
   return IndexedDBService.getAllFromObjectStore(db, "Bookings").then(function (
    bookings
   ) {
    var vehicleStatusMap = {}; // Map to store active status of each vehicle
    var currentDate = new Date();

    // Iterate through bookings to determine active status of each vehicle
    for (var i = 0; i < bookings.length; i++) {
     var booking_start_date = new Date(
      `${bookings[i].end_date}T${bookings[i].end_time}:00.000Z`
     );

     
     if (booking_start_date > currentDate) {
      // Booking is active
      vehicleStatusMap[bookings[i].vehicle_id] = true;
     } else {
      // Booking is not active
     vehicleStatusMap[bookings[i].vehicle_id] = false;
     }
    }
    $scope.$apply(
      function(){
        $scope.vehicleStatusMap = vehicleStatusMap
      }
    )
   });
  });
 }

 prepareVehicleAvailablityMap();
}

twoWheelWanderApp.controller("manageVehiclesController", [
 "$scope",
 "IndexedDBService",
 "$route",
 manageVehiclesController,
]);
