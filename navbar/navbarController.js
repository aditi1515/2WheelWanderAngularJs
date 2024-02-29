function navbarController($scope, $location, localStorageService) {
  // $scope.isLocationActive = function (viewLocation) {
  //  return viewLocation === $location.path();
  // };
  $scope.isLoggedIn = function () {
    return localStorageService.isLoggedIn();
  };
  $scope.isAdmin = function () {
    return localStorageService.isAdmin();
  };
  $scope.currentUser = function () {
    return localStorageService.getCurrentUSer();
  };

  $scope.logout = function () {
    localStorageService.removeCurrentUser();
    $location.path("/");
  };


  
}

twoWheelWanderApp.controller("navbarController", [
  "$scope",
  "$location",
  "localStorageService",
  navbarController,
]);
