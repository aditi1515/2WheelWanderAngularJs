function signinController(
 $scope,
 $location,
 IndexedDBService,
 localStorageService,
 SnackbarService
) {
 // TODO : to change user role to admin

 //  IndexedDBService.openDatabase()
 //   .then((db) => {
 //    console.log("running");
 //    return IndexedDBService.getObjectFromIndex(
 //     db,
 //     "users",
 //     "emailIndex",
 //     "jatin26pandey@gmail.com"
 //    );
 //   })
 //   .then((user) => {
 //    console.log(user);
 //    user.role = "admin";
 //    return IndexedDBService.openDatabase().then((db) =>
 //     updateObjectStore(db, "users", user)
 //    );
 //   })
 //   .catch((err) => {
 //    console.log(err);
 //   });

 //  function updateObjectStore(db, objectStore, user) {
 //   const transaction = db.transaction("users", "readwrite");
 //   const store = transaction.objectStore(objectStore);

 //   var query = store.put(user);

 //   query.onsuccess = function (e) {
 //    console.log(e.target.result);
 //   };
 //  }

 $scope.signIn = function (form) {
  console.log(form.$valid);
  $scope.userExistsError = false;
  $scope.incorrectPasswordError = false;
  if (form.$valid) {
   var userCredentials = $scope.signinformdata;
   console.log(userCredentials);

   IndexedDBService.openDatabase()
    .then(function (db) {
     console.log("Db connection established", db);

     return IndexedDBService.getObjectFromIndex(
      db,
      "users",
      "emailIndex",
      userCredentials.email
     ).then(function (filteredUser) {
      console.log(filteredUser);
      if (filteredUser === undefined) {
       console.log("User doesn't exist");
       $scope.userExistsError = true;
       $scope.$apply();
       console.log($scope.userExistsError);
       throw new Error("User doesn't exist");
      }
      return filteredUser;
     });
    })
    .then(function (filteredUser) {
     console.log(filteredUser.password);
     if (filteredUser.password !== userCredentials.password) {
      console.log("Incorrect password");
      $scope.incorrectPasswordError = true;
      $scope.$apply();
      console.log($scope.incorrectPasswordError);
      throw new Error("Incorrect password");
     }
     return filteredUser;
    })
    .then(function (filteredUser) {
     localStorageService.setCurrentUser(filteredUser);
     $scope.$apply(function () {
      SnackbarService.showMessage("Signin successfully", 2000, "success");
      var redirectUrl = localStorageService.getItem("redirectUrl");
      if (redirectUrl) {
       console.log("Redirecting to", redirectUrl);
       localStorageService.removeItem("redirectUrl");
       $location.url(redirectUrl);
      } else {
       $location.path("/");
      }
     });
    })
    .catch(function (error) {
     console.log("Error in sign in", error);
    });
  } else {
   console.log("Form is invalid");
  }
 };
}

twoWheelWanderApp.controller("signinController", [
 "$scope",
 "$location",
 "IndexedDBService",
 "localStorageService",
 "SnackbarService",
 signinController,
]);
