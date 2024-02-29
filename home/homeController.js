function homeController($scope, $location, $timeout, IndexedDBService) {
 $scope.bookingSearch = {};

 IndexedDBService.openDatabase()
  .then(function (db) {
   return IndexedDBService.getAllFromObjectStore(db, "locations");
  })
  .then(function (locations) {
   console.log("locations in home controller: ", locations);

   $scope.$apply(function () {
    $scope.locations = locations;
    $scope.bookingSearch = {
     location: $scope.locations[0]?.city,
     startDateTime: new Date(getNMinutesAhead(15)),
     endDateTime: new Date(getNMinutesAhead(45)),
    };

    $scope.startDateTimeMinVal = getNMinutesAhead(15);
    $scope.endDateTimeMinVal = getNMinutesAhead(45);
   });
  })
  .catch(function (err) {
   console.log("Error in getting locations", err);
  });

 function getNMinutesAhead(n) {
  // Get the current time
  var currentTime = new Date();

  // Calculate the future time
  var futureTime = new Date(currentTime.getTime() + n * 60000); // Add n minutes
  var timezoneOffset = currentTime.getTimezoneOffset();
  futureTime.setMinutes(futureTime.getMinutes() - timezoneOffset);

  // Format the result
  var formattedTime = futureTime.toISOString().slice(0, 16).replace("T", " "); // Remove seconds

  console.log(
   "currentTime:",
   currentTime.toISOString().slice(0, 19).replace("T", " ")
  );
  console.log(
   "futureTime:",
   futureTime.toISOString().slice(0, 19).replace("T", " ")
  );

  return formattedTime;
 }
 // Call the function to set the endDateTime initially or in response to some event

 $scope.searchBooking = function () {
  // checl if start end time are 30 mins apart or not
  var startDateTime = new Date($scope.bookingSearch.startDateTime);
  var endDateTime = new Date($scope.bookingSearch.endDateTime);
  console.log("startDateTime", startDateTime);
  console.log("endDateTime", endDateTime);
  if (endDateTime - startDateTime < 30 * 60 * 1000) {
   $scope.bookingSearchTimeDifferenceError = true;
   return;
  }

  $location.path("/booking").search($scope.bookingSearch);
 };

 $scope.$watchGroup(
  ["bookingSearch.startDateTime", "bookingSearch.endDateTime"],
  function (newValues, oldValues) {
   if (newValues[0] || newValues[1]) {
    $scope.bookingSearchTimeDifferenceError = false;
   }
  }
 );




}

twoWheelWanderApp.controller("homeController", [
 "$scope",
 "$location",

 "$timeout",
 "IndexedDBService",
 homeController,
]);
