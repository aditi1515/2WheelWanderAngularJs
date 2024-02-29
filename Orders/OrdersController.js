function OrdersController(
 $scope,
 IndexedDBService,
 localStorageService,
 SnackbarService
) {
 $scope.categorizedOrders = {};

 $scope.tabs = {
  ONGOING_ORDERS: "ONGOING_ORDERS",
  ACTIVE_ORDERS: "ACTIVE_ORDERS",
  PASSIVE_ORDERS: "PASSIVE_ORDERS",
 };
 $scope.activeTab = $scope.tabs.ONGOING_ORDERS;

 $scope.setActiveTab = function (tab) {
  $scope.activeTab = tab;
 };

 function prepareOrderData() {
  // const orders = JSON.parse(localStorage.getItem("orders"));

  const currUser = localStorageService.getCurrentUSer();
  console.log("currUser", currUser);
  IndexedDBService.openDatabase()
   .then((db) => {
    console.log("Database loaded successfully");
    return IndexedDBService.conditionedIndexing(
     db,
     "Bookings",
     "orderIndex",
     currUser._id,
     currUser._id
    );
   })
   .then((userOrders) => {
    //categorize orders on basis of date
    console.log("userOrders", userOrders);
    const categorizedOrders = userOrders.reduce(
     (acc, order) => {
      const currDate = new Date();

      const endDateTime = new Date(order.end_date + "T" + order.end_time);
      const startDateTime = new Date(order.start_date + "T" + order.start_time);

      console.log(currDate);
      if (endDateTime < currDate) {
       //order has ended
       acc.passiveOrders.push(order);
      } else if (startDateTime <= currDate && endDateTime >= currDate) {

       acc.ongoingOrders.push(order);
      } else {
       //future orders
       acc.activeOrders.push(order);
      }
      return acc;
     },

     {
      ongoingOrders: [],
      activeOrders: [],
      passiveOrders: [],
     }
    );
    $scope.categorizedOrders = categorizedOrders;
    $scope.$apply();
    console.log("categorizedOrders", categorizedOrders);
   });
 }
 prepareOrderData();

 $scope.showCancelOrderDialogVal = false;
 $scope.orderToCancel = {};
 $scope.showCancelOrderDialog = function (order) {
  $scope.orderToCancel = order;
  $scope.showCancelOrderDialogVal = true;
 };
 $scope.hideCancelOrderDialog = function () {
  $scope.showCancelOrderDialogVal = false;
  $scope.orderToCancel = {};
 };

 $scope.cancelOrder = function () {
  IndexedDBService.openDatabase().then(function (db) {
   return IndexedDBService.deleteObject(
    db,
    "Bookings",
    $scope.orderToCancel._id
   ).then(function () {
    console.log("Order deleted successfully");
    $scope.showCancelOrderDialogVal = false;
    $scope.orderToCancel = {};
    $scope.$apply();
    SnackbarService.showMessage(
     "Order cancelled successfully",
     2000,
     "success"
    );
    prepareOrderData();
   });
  });
 };
}

twoWheelWanderApp.controller("orderController", [
 "$scope",
 "IndexedDBService",
 "localStorageService",
 "SnackbarService",
 OrdersController,
]);
