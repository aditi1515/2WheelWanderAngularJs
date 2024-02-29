var twoWheelWanderApp = angular.module("twoWheelWanderApp", ["ngRoute"]);

twoWheelWanderApp.config([
 "$routeProvider",
 function ($routeProvider) {
  $routeProvider
   .when("/", {
    templateUrl: "home/home.html",
    controller: "homeController",
   })
   .when("/signUp", {
    templateUrl: "signup/signup.html",
    controller: "signupController",
   })
   .when("/signIn", {
    templateUrl: "signin/signin.html",
    controller: "signinController",
   })
   .when("/manageVehicles", {
    templateUrl: "admin/manageVehicles.html",
    controller: "manageVehiclesController",
   })
   .when("/profile", {
    templateUrl: "profile/profile.html",
    controller: "profileController",
   })
   .when("/booking", {
    templateUrl: "BookingPage/bookingPage.html",
    controller: "bookingPageController",
   })
   .when("/orders", {
    templateUrl: "Orders/Orders.html",
    controller: "orderController",
   })
   .when("/analytics", {
    templateUrl: "admin/analytics.html",
    controller: "analyticsController",
   })
   .otherwise({
    redirectTo: "/",
   });
 },
]);

function confirmDialogDirective() {
 return {
  restrict: "E",
  scope: {
   title: "@?",
   message: "@?",
   onConfirm: "&?",
   onCancel: "&?",
  },
  transclude: true,
  templateUrl: "confirmDialog.html",
  link: function (scope, element, attrs) {
   scope.confirm = function () {
    scope.onConfirm();
   };

   scope.cancel = function () {
    console.log(scope.onCancel);
    scope.onCancel();
   };
  },
 };
}

twoWheelWanderApp.directive("confirmDialog", confirmDialogDirective);

twoWheelWanderApp.directive("bookingSearchForm", function () {
 return {
  restrict: "E",
  templateUrl: "bookingSearchForm.html",
  scope: {
   locations: "=",
   getNminsAhead: "&",
   searchBooking: "&",
  },
 };
});

twoWheelWanderApp.directive("snackbar", [
 "SnackbarService",
 function (SnackbarService) {
  return {
   restrict: "E",
   templateUrl: "snackbar.html", // Template URL for the snackbar UI
   link: function (scope) {
    scope.SnackbarService = SnackbarService;
   },
  };
 },
]);
