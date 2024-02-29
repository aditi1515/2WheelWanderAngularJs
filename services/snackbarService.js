twoWheelWanderApp.service('SnackbarService', ['$timeout', function($timeout) {
 var service = this;

 service.showMessage = function(message, duration, color) {
     // Show the snackbar
     service.message = message;
     service.color = color || 'default'; // Default color: 'default'
     service.showSnackbar = true;

     // Automatically hide the snackbar after the specified duration
     $timeout(function() {
         service.hideSnackbar();
     }, duration || 3000); // Default duration: 3 seconds

     // Hide the snackbar after clicking on it
     service.hideOnTap = function() {
         service.hideSnackbar();
     };
 };

 service.hideSnackbar = function() {
     service.showSnackbar = false;
 };
}]);
