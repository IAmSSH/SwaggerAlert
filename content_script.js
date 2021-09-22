let h2 = document.querySelector(".title");
let count = 1;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function init() {
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
}

let getNewServices = (uiServices) => {
  let newServices = [];
  uiServices.forEach((service) => {
    let name = service.textContent;
    if (!res.find(({ title }) => title === name)) {
      newServices.push(service);
    }
  });
  return newServices;
};

let addServicesToDB = (newServices, serviceNamesStore) => {
  newServices.forEach((service) => {
    let oldText = service.innerHTML;
    let req = serviceNamesStore.add({
      title: service.textContent,
    });
    req.onerror = (e) => {
      console.log(e);
    };
    req.onsuccess = (e) => {
      console.log(`service ${e.target.result} added to DB`);
    };
    service.innerHTML = `${oldText} <span style="font-weight:bold; color:red;">NEW!!!</span>`;
  });
};

function createDB() {
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
      if (res.length > 0) {
        let uiServices = document.querySelectorAll(
          ".opblock-summary-path span"
        );
        let newServices = getNewServices(uiServices);
        // uiServices.forEach((service) => {
        //   let name = service.textContent;
        //   if (!res.find(({ title }) => title === name)) {
        //     newServices.push(service);
        //   }
        // });
        if (newServices.length > 0) {
          addServicesToDB(newServices, serviceNamesStore);
        }
        // newServices.forEach((service) => {
        //   let oldText = service.innerHTML;
        //   let req = serviceNamesStore.add({
        //     title: service.textContent,
        //   });
        //   req.onerror = (e) => {
        //     console.log(e);
        //   };
        //   req.onsuccess = (e) => {
        //     console.log(`service ${e.target.result} added to DB`);
        //   };
        //   service.innerHTML = `${oldText} <span style="font-weight:bold; color:red;">NEW!!!</span>`;
        // });
      } else {
        let uiServices = document.querySelectorAll(
          ".opblock-summary-path span"
        );
        uiServices.forEach((service) => {
          let req = serviceNamesStore.add({
            title: service.textContent,
          });
          req.onerror = (e) => {
            console.log(e);
          };
          req.onsuccess = (e) => {
            console.log("data added!");
          };
        });
      }
    };
  };
  //on error
  request.onerror = (e) => {
    console.log(`error: ${e.target.error} was found `);
  };
}

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
