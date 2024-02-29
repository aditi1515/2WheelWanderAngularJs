function indexedDBService() {
 const dbName = "2WW";
 const dbVersion = 8;
 var db;

 this.openDatabase = function () {
  return new Promise((resolve, reject) => {
   const request = indexedDB.open(dbName, dbVersion);

   request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("users")) {
     const usersStore = db.createObjectStore("users", {
      keyPath: "_id",
      autoIncrement: false,
     });
     usersStore.createIndex("emailIndex", "email", { unique: true });
    }

    if (!db.objectStoreNames.contains("locations")) {
     const locations = db.createObjectStore("locations", {
      autoIncrement: true,
     });
    }

    if (!db.objectStoreNames.contains("vehicles")) {
     const vehicles = db.createObjectStore("vehicles", {
      keyPath: "_id",
      autoIncrement: false,
     });
     vehicles.createIndex("vehicleLocationIndex", "location", {
      unique: false,
     });
    }

    if (!db.objectStoreNames.contains("Bookings")) {
     const bookings = db.createObjectStore("Bookings", {
      keyPath: "_id",
      autoIncrement: false,
     });

     console.log("Bookings object store created");
     bookings.createIndex("orderIndex", "userId", {
      unique: false,
     });

     bookings.createIndex("vehicleIndex", "vehicleId", {
      unique: false,
     });
    }
   };

   request.onerror = function (event) {
    reject(new Error("Error opening the database: " + event.target.error));
   };

   request.onsuccess = function (event) {
    db = event.target.result;
    console.log("Database opened successfully.");
    resolve(db);
   };

   request.onblocked = function (event) {
    console.warn(
     "Database connection blocked. Please close other instances of the application."
    );
   };
  });
 };

 this.addToObjectStore = function (db, objectStoreName, data) {
  return new Promise((resolve, reject) => {
   const transaction = db.transaction(objectStoreName, "readwrite");
   const objectStore = transaction.objectStore(objectStoreName);
   if (data._id === undefined) data._id = this.generateUniqueID();
   console.log("Data to be added:", data);
   console.log("Object store Name:", objectStoreName);
   console.log("objectStore :", objectStore);
   const query = objectStore.put(data);

   query.onsuccess = function (event) {
    console.log("Data added successfully:", event.target.result);
    resolve(event.target.result);
   };

   query.onerror = function (event) {
    console.error("Error adding data:", event.target.error);
    reject(new Error("Error adding data: " + event.target.error));
   };
  });
 };

 this.generateUniqueID = function () {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36).substring(2);
  return dateString + randomness;
 };

 this.getObjectFromIndex = function (db, objectStore, indexName, indexKey) {
  return new Promise((resolve, reject) => {
   const transaction = db.transaction(objectStore, "readonly");
   const store = transaction.objectStore(objectStore);
   const index = store.index(indexName);

   var query = index.get(indexKey);
   query.onsuccess = function (event) {
    console.log("Data retrieved successfully:", event.target.result);
    resolve(event.target.result);
   };

   query.onerror = function (event) {
    console.log("Error retrieving data:", event.target.error);
    reject(new Error("Error retrieving data") + event.target.error);
   };
  });
 };

 this.getAllEntriesFromObjectStoreByIndex = function (
  db,
  objectStoreName,
  indexName,
  indexValue
 ) {
  return new Promise((resolve, reject) => {
   const transaction = db.transaction(objectStoreName, "readonly");
   const objectStore = transaction.objectStore(objectStoreName);
   const index = objectStore.index(indexName);
   const entries = [];

   index.openCursor(IDBKeyRange.only(indexValue)).onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
     entries.push(cursor.value);
     cursor.continue();
    } else {
     resolve(entries);
    }
   };

   transaction.onerror = function (event) {
    console.error(
     "Error retrieving entries from object store by index:",
     event.target.error
    );
    reject(
     new Error(
      "Error retrieving entries from object store by index: " +
       event.target.error
     )
    );
   };
  });
 };

 this.conditionedIndexing = function (
  db,
  objectStore,
  indexName,
  condition1,
  condition2
 ) {
  return new Promise((resolve, reject) => {
   const transaction = db.transaction(objectStore, "readonly");
   const store = transaction.objectStore(objectStore);
   const index = store.index(indexName);

   const range = IDBKeyRange.bound(condition1, condition2);

   var query = index.openCursor(range);

   const resultArr = [];

   query.onsuccess = (event) => {
    var cursor = event.target.result;

    if (cursor) {
     resultArr.push(cursor.value);
     cursor.continue();
    } else {
     resolve(resultArr);
    }
   };
   query.onerror = (event) => {
    console.log(event.target.error);
    reject(
     new Error("Error on conditioned based indexing") + event.target.error
    );
   };
  });
 };

 this.getObjectById = function (db, objectStore, key) {
  return new Promise((resolve, reject) => {
   const transaction = db.transaction(objectStore, "readonly");
   const store = transaction.objectStore(objectStore);

   var query = store.get(key);

   query.onsuccess = (event) => {
    resolve(event.target.result);
   };

   query.onerror = (event) => {
    reject(new Error("Error getting object by key") + event.target.error);
   };
  });
 };

 this.getAllFromObjectStore = function (db, objectStore) {
  return new Promise((resolve, reject) => {
   const transaction = db.transaction(objectStore, "readonly");
   const store = transaction.objectStore(objectStore);

   var query = store.openCursor();
   const getAllArr = [];

   query.onsuccess = (event) => {
    var cursor = event.target.result;

    if (cursor) {
     getAllArr.push(cursor.value);
     cursor.continue();
    } else {
     resolve(getAllArr);
    }
   };
   query.onerror = (event) => {
    reject(new Error("Error retrieving data") + event.target.error);
   };
  });
 };

 this.deleteObject = function (db, objectStore, objectId) {
  return new Promise((resolve, reject) => {
   const transaction = db.transaction(objectStore, "readwrite");
   const store = transaction.objectStore(objectStore);

   var query = store.delete(objectId);

   query.onsuccess = (event) => {
    resolve(event.target.result);
   };
   query.onerror = (event) => {
    reject(new Error("Error in deleting object") + event.target.error);
   };
  });
 };

 this.clearObjectStore = function (db, objectStore) {
  return new Promise((resolve, reject) => {
   const transaction = db.transaction(objectStore, "readwrite");
   const store = transaction.objectStore(objectStore);

   var query = store.clear();

   query.onsuccess = (event) => {
    resolve(event.target.result);
   };
   query.onerror = (event) => {
    reject(new Error("Error in clearing object store") + event.target.error);
   };
  });
 };

 this.countNoOfRecords = function (db, objectStore) {
  return new Promise((resolve, reject) => {
   const transaction = db.transaction(objectStore, "readonly");
   const store = transaction.objectStore(objectStore);
   var query = store.count();

   query.onsuccess = (event) => {
    resolve(event.target.result);
   };
   query.onerror = (event) => {
    reject(new Error("Error in counting no. of records") + event.target.error);
   };
  });
 };
}

// to backup vehicles and orders , make sure to clear their object stores first


twoWheelWanderApp.service("IndexedDBService", indexedDBService);
