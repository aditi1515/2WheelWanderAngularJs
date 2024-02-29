function bookingPageController(
 $scope,
 $routeParams,
 $location,
 SnackbarService,
 IndexedDBService,
 localStorageService
) {
 $scope.bookingSearch = {
  location: $routeParams.location,
  startDateTime: new Date($routeParams.startDateTime),
  endDateTime: new Date($routeParams.endDateTime),
 };

 $scope.startDateTimeMinVal = getNMinutesAhead(15);
 $scope.endDateTimeMinVal = getNMinutesAhead(45);

 if (
  $routeParams.location === undefined ||
  $routeParams.startDateTime === undefined ||
  $routeParams.endDateTime === undefined
 ) {
  $scope.bookingSearch = {
   ...$scope.bookingSearch,
   startDateTime: new Date(getNMinutesAhead(15)),
   endDateTime: new Date(getNMinutesAhead(45)),
  };
 }

 $scope.showbookingFinalDialogVal = false;

 $scope.vehicleToOrder = {};

 $scope.currentUser = localStorageService.getCurrentUSer();

 $scope.showBookingFinalDialog = function (vehicle) {
  if (!$scope.currentUser) {
   console.log($location.url());
   localStorageService.setItem("redirectUrl", $location.url());
   $location.path("/login");
  }
  $scope.vehicleToOrder = vehicle;
  $scope.showbookingFinalDialogVal = true;
 };

 $scope.hideBookingFinalDialog = function () {
  $scope.showbookingFinalDialogVal = false;
  $scope.vehicleToOrder = {};
 };

 $scope.bookVehicle = function () {
  const order = {
   orderGenerateDate: new Date(),
   userId: $scope.currentUser._id,
   userFirstName: $scope.currentUser.firstName,
   userLastName: $scope.currentUser.lastName,
   userEmail: $scope.currentUser.email,
   vehicleId: $scope.vehicleToOrder._id,
   vehicleBrand: $scope.vehicleToOrder.vbrand,
   vehicleModel: $scope.vehicleToOrder.vmodel,
   vehicleType: $scope.vehicleToOrder.vType,
   location: $scope.vehicleToOrder.location,
   cost: $scope.vehicleToOrder.amount,
   start_date: $scope.vehicleToOrder.startDate,
   start_time: $scope.vehicleToOrder.startTime,
   end_date: $scope.vehicleToOrder.endDate,
   end_time: $scope.vehicleToOrder.endTime,
  };

  IndexedDBService.openDatabase().then(function (db) {
   return IndexedDBService.addToObjectStore(db, "Bookings", order).then(
    function () {
     console.log("Order added successfully");
     SnackbarService.showMessage(
      "Vehicle booked successfully",
      2000,
      "success"
     );
     $scope.showbookingFinalDialogVal = false;
     $location.path("/orders");
     $scope.$apply();
    }
   );
  });
 };

 $scope.searchBooking = function () {
  // checl if start end time are 30 mins apart or not
  var startDateTime = new Date($scope.bookingSearch.startDateTime);
  var endDateTime = new Date($scope.bookingSearch.endDateTime);
  if (endDateTime - startDateTime < 30 * 60 * 1000) {
   $scope.bookingSearchTimeDifferenceError = true;
   return;
  }

  $location.path("/booking").search($scope.bookingSearch);
 };

 function getNMinutesAhead(n) {
  // Get the current time
  var currentTime = new Date();

  // Calculate the future time
  var futureTime = new Date(currentTime.getTime() + n * 60000); // Add n minutes
  var timezoneOffset = currentTime.getTimezoneOffset();
  futureTime.setMinutes(futureTime.getMinutes() - timezoneOffset);

  // Format the result
  var formattedTime = futureTime.toISOString().slice(0, 16).replace("T", " "); // Remove seconds

  return formattedTime;
 }

 // set locations in scope
 IndexedDBService.openDatabase()
  .then(function (db) {
   return IndexedDBService.getAllFromObjectStore(db, "locations");
  })
  .then(function (locations) {
   $scope.$apply(function () {
    $scope.locations = locations;
   });
  })
  .catch(function (err) {
   console.log("Error in getting locations", err);
  });

 $scope.availableVehicles = [];

 checkVehicleAvailability(
  $scope.bookingSearch.startDateTime,
  $scope.bookingSearch.endDateTime
 )
  .then(({ finalAvailableVehicles, amountForVehicles }) => {
   $scope.$apply(() => {
    $scope.availableVehicles = finalAvailableVehicles;
    $scope.amountForVehicles = amountForVehicles;
   });
  })
  .catch((error) => {
   console.error("Error in checking vehicle availability:", error);
  });

 // Function to check vehicle availability
 function checkVehicleAvailability(startDateTime, endDateTime) {
  return IndexedDBService.openDatabase().then((db) => {
   // Fetch vehicles from the database
   return IndexedDBService.getAllFromObjectStore(db, "vehicles").then(
    (vehicles) => {
     const vehiclePromises = vehicles.map((vehicle) => {
      // Get orders for each vehicle
      if (vehicle.location !== $scope.bookingSearch.location) {
       return;
      }
      return IndexedDBService.getAllEntriesFromObjectStoreByIndex(
       db,
       "Bookings",
       "vehicleIndex",
       vehicle._id
      ).then((orders) => {
       if (orders.length === 0) {
        return vehicle;
       }
       // Check if the vehicle is available for the given time period
       var isThisVehicleAvailable = orders.every(
        (order) => !isOverlap(startDateTime, endDateTime, order)
       );
       if (isThisVehicleAvailable) {
        return vehicle;
       }
      });
     });
     // Wait for all vehicle promises to resolve
     return Promise.all(vehiclePromises).then((finalAvailableVehicles) => {
      finalAvailableVehicles = finalAvailableVehicles.filter(
       (finalAvailableVehicle) => finalAvailableVehicle !== undefined
      );
      if (finalAvailableVehicles.length === 0) {
       return { finalAvailableVehicles: [], amountForVehicles: 0 };
      }
      const amountForVehicles = calculateRentAmount(
       finalAvailableVehicles,
       startDateTime,
       endDateTime
      );
      return { finalAvailableVehicles, amountForVehicles };
     });
    }
   );
  });
 }

 function calculateRentAmount(
  finalAvailableVehicles,
  startDateTime,
  endDateTime
 ) {
  const hours = calculateHoursBetweenDates(startDateTime, endDateTime);

  for (const vehicle of finalAvailableVehicles) {
   const hourlyDayPrice = vehicle.priceHour;
   const hourlyNightPrice = vehicle.nightPrice;

   const vehicleAmount = calculateEachVehiclePrice(
    hourlyDayPrice,
    hourlyNightPrice,
    hours.morningHours,
    hours.nightHours
   );

   // Split startDateTime into date and time components
   const startDate = formatDate(startDateTime);
   const startTime = formatTime(startDateTime);

   // Split endDateTime into date and time components
   const endDate = formatDate(endDateTime);
   const endTime = formatTime(endDateTime);

   vehicle.amount = vehicleAmount;
   vehicle.startDate = startDate;
   vehicle.startTime = startTime;
   vehicle.endDate = endDate;
   vehicle.endTime = endTime;
  }
 }

 function formatDate(dateTime) {
  const year = dateTime.getFullYear();
  const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
  const day = ("0" + dateTime.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
 }

 function formatTime(dateTime) {
  const hours = ("0" + dateTime.getHours()).slice(-2);
  const minutes = ("0" + dateTime.getMinutes()).slice(-2);
  return `${hours}:${minutes}`;
 }
 //calculate price for each vehicle
 function calculateEachVehiclePrice(
  hourlyDayPrice,
  hourlyNightPrice,
  morningHours,
  nightHours
 ) {
  const totalAmount =
   hourlyDayPrice * morningHours + hourlyNightPrice * nightHours;
  return totalAmount.toFixed(2);
 }

 //hours difference
 function calculateHoursBetweenDates(dateTime1, dateTime2) {
  const date1 = new Date(dateTime1);
  const date2 = new Date(dateTime2);

  const isBetween6AMand10PM = (date) => {
   const hours = date.getHours();
   return hours >= 6 && hours < 22;
  };

  const isBetween10PMand6AM = (date) => {
   const hours = date.getHours();
   return hours >= 22 || hours < 6;
  };

  var hoursInPeriod1 = 0;
  var hoursInPeriod2 = 0;

  // Calculate the difference in minutes
  const minutesDifference = (date2 - date1) / (1000 * 60);

  // Iterate through each minute and calculate hours for each time period
  for (var i = 0; i < minutesDifference; i++) {
   const currentMinute = i;
   const currentHour = new Date(date1.getTime() + currentMinute * 60 * 1000);

   if (isBetween6AMand10PM(currentHour)) {
    hoursInPeriod1 += 1 / 60; // Increment by 1 minute
   } else if (isBetween10PMand6AM(currentHour)) {
    hoursInPeriod2 += 1 / 60; // Increment by 1 minute
   }
  }

  // Round the result to 2 decimal places
  // hoursInPeriod1 = Math.round(hoursInPeriod1 * 100) / 100;
  // hoursInPeriod2 = Math.round(hoursInPeriod2 * 100) / 100;

  return { morningHours: hoursInPeriod1, nightHours: hoursInPeriod2 };
 }

 // Function to check if there is an overlap between the booking time and existing orders
 function isOverlap(startDateTime, endDateTime, order) {
  const filterStart = Date.parse(
   order.start_date + "T" + order.start_time + ":00"
  );
  const filterEnd = Date.parse(order.end_date + "T" + order.end_time + ":00");
  const bookingStart = Date.parse(startDateTime);
  const bookingEnd = Date.parse(endDateTime);

  const overlap = bookingStart < filterEnd && bookingEnd > filterStart;
  return overlap;
 }

 $scope.$watchGroup(
  ["bookingSearch.startDateTime", "bookingSearch.endDateTime"],
  function (newValues, oldValues) {
   if (newValues[0] || newValues[1]) {
    $scope.bookingSearchTimeDifferenceError = false;
   }
  }
 );
}

twoWheelWanderApp.controller("bookingPageController", [
 "$scope",
 "$routeParams",
 "$location",
 "SnackbarService",
 "IndexedDBService",
 "localStorageService",
 bookingPageController,
]);
