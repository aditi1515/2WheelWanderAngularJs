function signupController(
 $scope,
 $location,
 localStorageService,
 IndexedDBService,
 SnackbarService
) {
 $scope.userExistsError = false;
 $scope.signUp = function (form) {
  console.log(form.$valid);
  if (form.$valid) {
   // Prepare the data object to be submitted

   var userData = $scope.signupformdata;
   userData.role = "user";

   // Log the form data for demonstration
   console.log("Form Data:", userData);

   // Here you can proceed with further actions such as making an HTTP request to send the data to the server

   IndexedDBService.openDatabase()
    .then(function (db) {
     console.log("Database opened successfully");
     return IndexedDBService.getObjectFromIndex(
      db,
      "users",
      "emailIndex",
      userData.email
     ).then(function (filteredUser) {
      console.log("Filtered user: ", filteredUser);
      if (filteredUser !== undefined) {
       console.log("User already exists");
       $scope.userExistsError = true;
       $scope.$apply();
       console.log($scope.userExistsError);
       throw new Error("User already exists");
      }

      return db;
     });
    })
    .then(function (db) {
     IndexedDBService.addToObjectStore(db, "users", userData)
      .then(function () {
       console.log("User added successfully");

       $scope.$apply(function () {
        var redirectUrl = localStorageService.getItem("redirectUrl");
        SnackbarService.showMessage("Signup successfully", 2000, "success");
        if (redirectUrl) {
         localStorageService.removeItem("redirectUrl");
         $location.url(redirectUrl);
        } else {
         $location.path("/");
        }
       });
      })
      .catch(function (err) {
       console.log("Error in adding user: " + err);
      });
    })
    .catch(function (error) {
     console.error("Error while signingUp :", error);
    });
  } else {
   // If the form is invalid, display an error message or take appropriate action
   console.error("Form is invalid. Please correct the errors.");
  }
 };

 // Watch for changes in signupformdata.email
 $scope.$watch("signupformdata.email", function (newVal, oldVal) {
  // Check if the email input has changed
  if (newVal !== oldVal) {
   // Reset userExistsError to false
   $scope.userExistsError = false;
  }
 });
}

function passwordValidateDirective() {
 return {
  require: "ngModel",
  link: function (scope, element, attrs, ctrl) {
   ctrl.$validators.passwordValidate = function (modelValue, viewValue) {
    console.log("Password validation ctrl", ctrl);
    if (ctrl.$isEmpty(modelValue)) {
     // consider empty model valid
     return true;
    }
    console.log("Password validation started", element);
    var errors = [];

    // Password must be at least 8 characters long
    if (viewValue.length < 8) {
     errors.push("Password must be at least 8 characters long.");
    }

    // Password must contain at least one number
    if (!/\d/.test(viewValue)) {
     errors.push("Password must contain at least one number.");
    }

    // Password must contain at least one uppercase letter
    if (!/[A-Z]/.test(viewValue)) {
     errors.push("Password must contain at least one uppercase letter.");
    }

    // Password must contain at least one lowercase letter
    if (!/[a-z]/.test(viewValue)) {
     errors.push("Password must contain at least one lowercase letter.");
    }

    // Password must contain at least one special symbol
    if (!/[\W_]/.test(viewValue)) {
     errors.push("Password must contain at least one special symbol.");
    }
    console.log("Password validation errors: ", errors);
    // Return errors if any

    ctrl.$errorList = errors;
    console.log("Password validation completed", ctrl);
    return errors.length === 0;
   };

   // Watch for changes and trigger validation

   scope.$watch(attrs.ngModel, function () {
    ctrl.$validate();
   });
  },
 };
}

function confirmPasswordValidateDirective() {
 return {
  require: "ngModel",
  link: function (scope, element, attrs, ctrl) {
   console.log(ctrl);
   ctrl.$validators.confirmPasswordValidate = function (modelValue, viewValue) {
    console.log(modelValue, scope.$eval(attrs.compareWith).$viewValue);
    if (ctrl.$isEmpty(modelValue)) {
     // Consider empty model valid
     return true;
    }
    if (modelValue === scope.$eval(attrs.compareWith).$viewValue) {
     // Matched, return true (valid)
     return true;
    } else {
     // Not matched, return false (invalid)
     return false;
    }
   };

   scope.$watch(
    function () {
     return [attrs.ngModel, scope.$eval(attrs.compareWith).$viewValue];
    },
    function () {
     ctrl.$validate();
    },
    true
   );
  },
 };
}

twoWheelWanderApp.controller("signupController", [
 "$scope",
 "$location",
 "localStorageService",
 "IndexedDBService",
 "SnackbarService",
 signupController,
]);

// register directives here

twoWheelWanderApp.directive("passwordValidate", passwordValidateDirective);

twoWheelWanderApp.directive(
 "confirmPasswordValidate",
 confirmPasswordValidateDirective
);
