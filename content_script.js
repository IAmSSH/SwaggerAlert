let h2 = document.querySelector(".title");
let count = 1;

let sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let init = async () => {
  while (h2 === null && count <= 5) {
    h2 = document.querySelector(".title");
    count++;
    await sleep(1000);
  }
  return new Promise((resolve, reject) => {
    if (h2 === null)
      reject({
        status: "error",
        errorMessage: "Could not load page",
        errorCode: "001",
      });
    else resolve({ status: "success" });
  });
};

let getNewServices = (uiServices, res) => {
  let newServices = [];
  uiServices.forEach((service) => {
    let name = service.textContent;
    if (!res.find(({ title }) => title === name)) {
      newServices.push(service);
    }
  });
  return newServices;
};

let addServicesToDB = (newServices, serviceNamesStore, modifyHTML) => {
  newServices.forEach((service) => {
    let req = serviceNamesStore.add({
      title: service.textContent,
    });
    req.onerror = (e) => {
      console.log(e);
    };
    req.onsuccess = (e) => {
      console.log(`service ${e.target.result} added to DB`);
    };

    if (modifyHTML) {
      let oldText = service.innerHTML;
      service.innerHTML = `${oldText} <span style="font-weight:bold; color:red;">NEW!!!</span>`;
    }
  });
};

let createDB = () => {
  const dbName = "Services";
  const objectStore = "Service_Names";
  const request = indexedDB.open(dbName);

  //on upgrade needed
  request.onupgradeneeded = (e) => {
    db = e.target.result;
    const serviceNamesStore = db.createObjectStore(objectStore, {
      keyPath: "title",
    });
    console.log(
      `upgrade is called. DB name: ${db.name}; Version : ${db.version}`
    );
  };
  //on success
  request.onsuccess = (e) => {
    db = e.target.result;
    console.log(
      `success is called. DB name: ${db.name}; Version : ${db.version}`
    );

    const tx = db.transaction([objectStore], "readwrite");
    const serviceNamesStore = tx.objectStore(objectStore);

    serviceNamesStore.getAll().onsuccess = function (event) {
      let res = event.target.result;
      let uiServices = document.querySelectorAll(".opblock-summary-path span");
      // check if old data exists
      if (res.length > 0) {
        let newServices = getNewServices(uiServices, res);
        // check for new services
        if (newServices.length > 0) {
          addServicesToDB(newServices, serviceNamesStore, true);
        }
      }
      // no old data exists, add all services to DB
      else {
        addServicesToDB(uiServices, serviceNamesStore, false);
      }
    };
  };
  //on error
  request.onerror = (e) => {
    console.log(`error: ${e.target.error} was found `);
  };
};

init()
  .then((status) => {
    console.log(status);
    if (status["status"] === "success") {
      createDB();
    }
  })
  .catch((e) => {
    console.error(e);
  });
