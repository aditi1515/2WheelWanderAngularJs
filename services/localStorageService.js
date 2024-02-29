function localStorageService() {
 var CURRENT_USER = "currentUser";

 this.setCurrentUser = function (user) {
  localStorage.setItem(CURRENT_USER, JSON.stringify(user));
 };

 this.getCurrentUSer = function () {
  return JSON.parse(localStorage.getItem(CURRENT_USER));
 };

 this.removeCurrentUser = function () {
  localStorage.removeItem(CURRENT_USER);
 };

 this.isLoggedIn = function () {
  return this.getCurrentUSer() !== null;
 };

 this.isAdmin = function () {
  return this.getCurrentUSer() && this.getCurrentUSer().role === "admin";
 };

 this.setItem = function (key, value) {
  localStorage.setItem(key, JSON.stringify(value));
 };

 this.getItem = function (key) {
  return JSON.parse(localStorage.getItem(key));
 };

 this.removeItem = function (key) {
  localStorage.removeItem(key);
 };
}

twoWheelWanderApp.service("localStorageService", localStorageService);
