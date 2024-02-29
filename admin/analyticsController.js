function analyticsController($scope, IndexedDBService) {
 $scope.figures = {};
 $scope.topUsers = [];

 $scope.displayFigures = function () {
  Promise.all([
   calculateTotalRevenue(),
   calculateUsers(),
   totalBookings(),
   totalVehicles(),
  ])
   .then(function (results) {
    $scope.figures.revenue = results[0];
    $scope.figures.users = results[1];
    $scope.figures.bookingCount = results[2];
    $scope.figures.vehicleCount = results[3];

    $scope.$apply(); // Apply changes to trigger the digest cycle
   })
   .catch(function (error) {
    console.log("Error:", error);
   });
 };
 $scope.displayFigures();
 function calculateTotalRevenue() {
  return IndexedDBService.openDatabase()
   .then((db) => {
    return IndexedDBService.getAllFromObjectStore(db, "Bookings");
   })
   .then((orders) => {
    orders = orders.filter((order) => isOrderInPast(order));
    var totalAmount = orders.reduce((acc, order) => {
     return acc + parseInt(order.cost);
    }, 0);
    return totalAmount;
   })
   .catch((err) => {
    console.log("Error in calculating total revenue ", err);
   });
 }

 function calculateUsers() {
  return IndexedDBService.openDatabase()
   .then((db) => {
    return IndexedDBService.countNoOfRecords(db, "users");
   })
   .catch((err) => {
    console.log("Error in counting users", err);
   });
 }

 function totalBookings() {
  return IndexedDBService.openDatabase()
   .then((db) => {
    return IndexedDBService.getAllFromObjectStore(db, "Bookings");
   })
   .then((bookings) => {
    var bookingCount = {
     completed: 0,
     pending: 0,
    };
    bookings.reduce((acc, booking) => {
     if (isOrderInPast(booking)) {
      acc.completed += 1;
     } else {
      acc.pending += 1;
     }
     return acc;
    }, bookingCount);

    return bookingCount;
   })
   .catch((err) => {
    console.log("Error in counting bookings", err);
   });
 }

 function totalVehicles() {
  return IndexedDBService.openDatabase()
   .then((db) => {
    return IndexedDBService.countNoOfRecords(db, "vehicles");
   })
   .catch((err) => {
    console.log("Error in counting vehicles", err);
   });
 }

 function isOrderInPast(order) {
  const currentDate = new Date();
  const endDate = new Date(order.end_date + "T" + order.end_time);

  return endDate <= currentDate;
 }

 function calculateBikesScooters() {
  var bikeScooterCount = { bike: 0, scooter: 0 };

  IndexedDBService.openDatabase()
   .then((db) => {
    console.log(db);
    return IndexedDBService.getAllFromObjectStore(db, "Bookings");
   })
   .then((bookings) => {
    console.log(bookings);
    console.log("All bookings", bookings);
    bookings.forEach(function (booking) {
     if (booking.vehicleType === "bike") {
      bikeScooterCount.bike += 1;
     } else {
      bikeScooterCount.scooter += 1;
     }
    });

    return bikeScooterCount;
   })
   .then((bikeScooterCount) => {
    var bikeScooterCanvas = document.getElementById("bike-scooter-canvas");
    var chartLabels = Object.keys(bikeScooterCount);
    var chartData = Object.values(bikeScooterCount);
    var data = {
     labels: chartLabels,
     datasets: [
      {
       label: "Count",
       data: chartData,
       backgroundColor: ["#292950", "#f5738d", "rgb(255, 205, 86)"],
       hoverOffset: 4,
      },
     ],
    };
    const existingChart = Chart.getChart(bikeScooterCanvas);
    if (existingChart) {
     existingChart.destroy();
    }
    new Chart(bikeScooterCanvas, {
     type: "doughnut",
     data: data,
    });
   })
   .catch((err) => {
    console.log("Error in calculating most booked vehicles", err);
   });
 }

 function mostLikedVehicleBrand() {
  var brandsMap = new Map();
  console.log(brandsMap);
  IndexedDBService.openDatabase()
   .then((db) => {
    const vehicles = IndexedDBService.getAllFromObjectStore(db, "vehicles");
    vehicles
     .then((vehiclesArr) => {
      console.log(vehicles);
      vehiclesArr.forEach((vehicle) => {
       brandsMap.set(vehicle.vbrand, 0);
      });
     })
     .then(() => {
      return IndexedDBService.getAllFromObjectStore(db, "Bookings");
     })
     .then((bookings) => {
      bookings.forEach(function (booking) {
       brandsMap.set(
        booking.vehicleBrand,
        brandsMap.get(booking.vehicleBrand) + 1
       );
      });

      return brandsMap;
     })
     .then(() => {
      console.log(brandsMap);

      var likedBrandsCanvas = document.getElementById("liked-brands-canvas");

      const graphLabels = [...brandsMap.keys()];
      const graphData = [...brandsMap.values()];

      const data = {
       labels: graphLabels,
       datasets: [
        {
         label: "Bookings Count",
         data: graphData,
         backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(201, 203, 207, 0.2)",
         ],
         borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(201, 203, 207)",
         ],
         borderWidth: 1,
        },
       ],
      };
      const existingChart = Chart.getChart(likedBrandsCanvas);
      if (existingChart) {
       existingChart.destroy();
      }
      new Chart(likedBrandsCanvas, {
       type: "bar",
       data: data,
      });
     });
   })
   .catch((err) => {
    console.log("Error in calculating most likes brands", err);
   });
 }

 function mostBookingCities() {
  var cityBookingsMap = new Map();

  IndexedDBService.openDatabase().then((db) => {
   const locations = IndexedDBService.getAllFromObjectStore(db, "locations");
   locations
    .then((locationsArr) => {
     locationsArr.forEach((location) => {
      cityBookingsMap.set(location.city, 0);
     });
    })
    .then(() => {
     return IndexedDBService.getAllFromObjectStore(db, "Bookings");
    })
    .then((bookings) => {
     bookings.forEach((booking) => {
      cityBookingsMap.set(
       booking.location,
       cityBookingsMap.get(booking.location) + 1
      );
     });
    })
    .then(() => {
     var citiesComparison = document.getElementById("liked-cities-canvas");
     const graphLabels = [...cityBookingsMap.keys()];
     const graphData = [...cityBookingsMap.values()];

     const data = {
      labels: graphLabels,
      datasets: [
       {
        label: "Bookings Count",
        data: graphData,
        backgroundColor: [
         "rgba(255, 99, 132, 0.2)",
         "rgba(255, 159, 64, 0.2)",
         "rgba(255, 205, 86, 0.2)",
         "rgba(75, 192, 192, 0.2)",
         "rgba(54, 162, 235, 0.2)",
         "rgba(153, 102, 255, 0.2)",
         "rgba(201, 203, 207, 0.2)",
        ],
        borderColor: [
         "rgb(255, 99, 132)",
         "rgb(255, 159, 64)",
         "rgb(255, 205, 86)",
         "rgb(75, 192, 192)",
         "rgb(54, 162, 235)",
         "rgb(153, 102, 255)",
         "rgb(201, 203, 207)",
        ],
        borderWidth: 1,
       },
      ],
     };
     const existingChart = Chart.getChart(citiesComparison);
     if (existingChart) {
      existingChart.destroy();
     }
     new Chart(citiesComparison, {
      type: "bar",
      data: data,
     });
    });
  });
 }

 function userRegisterBookingsRatio() {
  IndexedDBService.openDatabase()
   .then((db) => {
    return IndexedDBService.getAllFromObjectStore(db, "Bookings");
   })
   .then((bookings) => {
    const uniqueOrder = new Set();

    bookings.forEach((order) => {
     uniqueOrder.add(order.userId);
    });
    calculateUsers().then((usersCount) => {
     const percentageForBookingUsers = (uniqueOrder.size / usersCount) * 100;
     const percentageForNonBookingUsers = 100 - percentageForBookingUsers;
     const data = {
      labels: ["HaveBooked", "NeverBooked"],
      datasets: [
       {
        label: "%",
        data: [percentageForBookingUsers, percentageForNonBookingUsers],
        backgroundColor: ["#292950", "#f5738d", "rgb(255, 205, 86)"],
        hoverOffset: 4,
       },
      ],
     };

     var userBookingCanvas = document.getElementById("user-bookings-canvas");

     const existingChart = Chart.getChart(userBookingCanvas);
     if (existingChart) {
      existingChart.destroy();
     }
     new Chart(userBookingCanvas, {
      type: "pie",
      data: data,
     });
    });
   });
 }

 function sortOrders(orders) {
  orders.sort((a, b) => {
   const dateA = new Date(a.start_date);
   const dateB = new Date(b.start_date);
   return dateA - dateB;
  });
  return orders;
 }

 function calculateRevenue() {
  IndexedDBService.openDatabase().then((db) => {
   const orders = IndexedDBService.getAllFromObjectStore(db, "Bookings");
   orders.then((ordersArr) => {
    ordersArr = ordersArr.filter((order) => isOrderInPast(order));
    console.log("Orders in past", ordersArr);
    ordersArr = sortOrders(ordersArr);
    const filterOption = revenueSelect.value;
    const revenue = ordersArr.reduce((stats, order) => {
     const orderDate = new Date(order.start_date);
     // const isWithinTimeRange =
     //   orderDate >= TIME_RANGE.start_date && orderDate <= TIME_RANGE.end_date;
     if (true) {
      var key;
      switch (filterOption) {
       case "day-wise":
        key = orderDate.toISOString().split("T")[0];
        break;
       case "month-wise": {
        const month = orderDate.getMonth() + 1;
        const year = orderDate.getFullYear();
        const formattedMonth = month < 10 ? `0${month}` : month;
        const joinedDate = `${formattedMonth}-${year}`;

        key = joinedDate;
        break;
       }
       case "year-wise":
        key = orderDate.getFullYear().toString();
        break;
       default:
        key = orderDate.toISOString().slice(0, 7);
      }

      if (!stats[key]) {
       stats[key] = 0;
      }
      console.log(key, order.cost);
      stats[key] += parseInt(order.cost);
     }
     return stats;
    }, {});
    var revenueChartCanvas = document.getElementById("revenue-chart-canvas");
    const graphLabels = Object.keys(revenue);
    const graphData = Object.values(revenue);
    console.log(graphLabels, graphData);
    const data = {
     labels: graphLabels,
     datasets: [
      {
       label: "revenue",
       data: graphData,
       fill: false,
       borderColor: "rgb(75, 192, 192)",
       tension: 0.1,
      },
     ],
    };
    const existingChart = Chart.getChart(revenueChartCanvas);
    if (existingChart) {
     existingChart.destroy();
    }
    new Chart(revenueChartCanvas, {
     type: "line",
     data: data,
    });
   });
  });
 }
 const revenueSelect = document.querySelector(".revenue-select");
 revenueSelect.addEventListener("change", () => {
  calculateRevenue();
 });

 function topPerformingUsers() {
  IndexedDBService.openDatabase()
   .then((db) => {
    return IndexedDBService.getAllFromObjectStore(db, "Bookings");
   })
   .then((bookings) => {
    var userBookingsMap = new Map();
    bookings.forEach((booking) => {
     if (userBookingsMap.has(booking.userId)) {
      userBookingsMap.set(booking.userId, {
       user: userBookingsMap.get(booking.userId).user,
       bookingCount:
        parseInt(userBookingsMap.get(booking.userId).bookingCount) + 1,
      });
     } else {
      userBookingsMap.set(booking.userId, {
       user: {
        userId: booking.userId,
        firstname: booking.userFirstName,
        lastname: booking.userLastName,
        email: booking.userEmail,
       },
       bookingCount: 1,
      });
     }
    });
    const sortedUserBookings = new Map(
     [...userBookingsMap.entries()].sort((a, b) => b[1] - a[1])
    );
    const topUsers = Array.from(sortedUserBookings).slice(0, 3);
    console.log(topUsers);
    $scope.topUsers = topUsers;
    $scope.$apply();
   })

   .catch((err) => {
    console.log("Error in calculating top performing users", err);
   });
 }
 topPerformingUsers();

 calculateRevenue();

 userRegisterBookingsRatio();

 mostBookingCities();

 mostLikedVehicleBrand();

 calculateBikesScooters();
}

twoWheelWanderApp.controller("analyticsController", [
 "$scope",
 "IndexedDBService",
 analyticsController,
]);
