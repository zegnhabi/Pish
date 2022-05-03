const { AppConfig } = require("../../AppConfig");
const { openDatabase } = require("../../provider/db/sqlite");
const db = openDatabase();
import * as Device from "expo-device";

export const getPayments = async (deviceID) => {
  try {
    fetch(`${AppConfig.API_URL}/payments/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        //Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        const payments = response;
        db.transaction(
          (tx) => {
            payments.forEach((payment) => {
              tx.executeSql(
                `INSERT INTO payments (id, name, description) VALUES (?, ?, ?)`,
                [payment.id, payment.name, payment.description],
                (tx, results) => {
                  //console.log("Payment inserted successfully");
                },
                (tx, err) => {
                  console.log(`Error: ${err}`);
                }
              );
            });
          },
          (err) => {
            console.log(`Error: ${err}`);
          },
          () => {
            console.log("Payments inserted successfully!");
          }
        );
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
      });
  } catch (err) {
    console.log(`Error: ${err}`);
  }
};

export const getLocations = async (deviceID) => {
  try {
    fetch(`${AppConfig.API_URL}/locations/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        //Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        const locations = response;
        db.transaction(
          (tx) => {
            locations.forEach((location) => {
              tx.executeSql(
                `INSERT INTO locations (id, name, phone_number, address, email, rfc) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  location.id,
                  location.name,
                  location.phone_number,
                  location.address,
                  location.email,
                  location.rfc,
                ],
                (tx, results) => {
                  //console.log("Payment inserted successfully");
                },
                (tx, err) => {
                  console.log(`Error: ${err}`);
                }
              );
            });
          },
          (err) => {
            console.log(`Error: ${err}`);
          },
          () => {
            console.log("Locations inserted successfully!");
          }
        );
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
      });
  } catch (err) {
    console.log(`Error: ${err}`);
  }
};

export const getCustomers = async (deviceID) => {
  try {
    fetch(`${AppConfig.API_URL}/customers/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        //Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        const customers = response;
        db.transaction(
          (tx) => {
            customers.forEach((customer) => {
              tx.executeSql(
                `INSERT INTO customers (id, name, phone_number, address, email, rfc) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  customer.id,
                  customer.name,
                  customer.phone_number,
                  customer.address,
                  customer.email,
                  customer.rfc,
                ],
                (tx, results) => {
                  //console.log("Payment inserted successfully");
                },
                (tx, err) => {
                  console.log(`Error: ${err}`);
                }
              );
            });
          },
          (err) => {
            console.log(`Error: ${err}`);
          },
          () => {
            console.log("Customers inserted successfully!");
          }
        );
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
      });
  } catch (err) {
    console.log(`Error: ${err}`);
  }
};

export const getProducts = async (deviceID) => {
  try {
    fetch(`${AppConfig.API_URL}/products/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        //Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        const products = response;
        db.transaction(
          (tx) => {
            products.forEach((product) => {
              tx.executeSql(
                `INSERT INTO products (id, name, barcode, description, quantity, price, image) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  product.id,
                  product.name,
                  product.barcode,
                  product.description,
                  product.quantity,
                  product.price,
                  product.image,
                ],
                (tx, results) => {
                  //console.log("Payment inserted successfully");
                },
                (tx, err) => {
                  console.log(`Error: ${err}`);
                }
              );
            });
          },
          (err) => {
            console.log(`Error: ${err}`);
          },
          () => {
            console.log("Customers inserted successfully!");
          }
        );
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
      });
  } catch (err) {
    console.log(`Error: ${err}`);
  }
};

export const createDevice = async (deviceID) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO devices (uuid, name, config) VALUES (?, ?, ?)`,
      [deviceID, Device.deviceName, JSON.stringify(Device)],
      (tx, results) => {
        fetch(`${AppConfig.API_URL}/devices`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            //Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            uuid: uniqueId,
            name: Device.deviceName,
            config: JSON.stringify(Device),
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            console.log(`Device created successfully Uuid: ${response.uuid}`);
          })
          .catch((err) => {
            console.log(`Error: ${err}`);
          });
      },
      (tx, err) => {
        console.log(`Error: ${err}`);
      }
    );
  });
};
