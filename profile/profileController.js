function profileController(localStorageService, IndexedDBService, $scope) {
 $scope.currentUser = localStorageService.getCurrentUSer();
 $scope.showChangePasswordDialogVal = false;

 $scope.showChangePasswordDialog = function () {
  $scope.showChangePasswordDialogVal = true;
 };

 $scope.closeChangePasswordDialog = function () {
  $scope.showChangePasswordDialogVal = false;
 };

 $scope.changePassword = function (passwordChangeForm) {
  if (passwordChangeForm.$valid) {
   IndexedDBService.openDatabase().then(function (db) {
    return IndexedDBService.getObjectFromIndex(
     db,
     "users",
     "emailIndex",
     $scope.currentUser.email
    ).then(function (user) {
     if (user.password !== $scope.changePasswordFormData.oldPassword) {
      $scope.incorrectPasswordError = true;
      $scope.$apply();
      throw new Error("Incorrect password");
     } else {
      $scope.incorrectPasswordError = false;
      user.password = $scope.changePasswordFormData.newPassword;
      return IndexedDBService.addToObjectStore(db, "users", user)
       .then(function () {
        console.log("Password changed successfully");
        $scope.showChangePasswordDialogVal = false;
        $scope.$apply();
       })
       .catch(function (error) {
        console.log("Error in changing password: " + error);
       });
     }
    });
   });
  } else {
   console.log("Form is invalid");
  }
 };
}

twoWheelWanderApp.controller("profileController", [
 "localStorageService",
 "IndexedDBService",
 "$scope",
 profileController,
]);
