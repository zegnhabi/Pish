import { React, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors, Styles } from "./styles/styles";
import ProductsScreen from "./screens/Products/Products";
import SalesScreen from "./screens/Sales/Sales";
import TicketsScreen from "./screens/Tickets/Tickets";
import * as SQLite from "expo-sqlite";
import * as Device from "expo-device";
import uuid from "react-native-uuid";
import * as Network from "expo-network";
import * as SecureStore from "expo-secure-store";
import { AppConfig } from "./AppConfig";

const configureDevice = async () => {
  let id = uuid.v4();
  let fetchUUID = await SecureStore.getItemAsync("secure_deviceid");
  if (fetchUUID) {
    id = fetchUUID;
  }
  await SecureStore.setItemAsync("secure_deviceid", id);
  console.log(`Device ID: ${id}`);
  return id;
};

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("Pish.db");
  return db;
}

const db = openDatabase();
const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [deviceID, setDeviceID] = useState("");

  useEffect(() => {
    try {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            config TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`,
            [],
            (tx, results) => {
              //console.log("Table Devices created successfully");
            },
            (tx, err) => {
              console.log(`Error: ${err}`);
            }
          );

          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`,
            [],
            (tx, results) => {
              //console.log("Table Payments created successfully");
            },
            (tx, err) => {
              console.log(`Error: ${err}`);
            }
          );

          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            address TEXT,
            email TEXT UNIQUE NOT NULL,
            rfc TEXT, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`,
            [],
            (tx, results) => {
              //console.log("Table Locations created successfully");
            },
            (tx, err) => {
              console.log(`Error: ${err}`);
            }
          );

          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            address TEXT,
            email TEXT UNIQUE NOT NULL,
            rfc TEXT, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`,
            [],
            (tx, results) => {
              //console.log("Table Customers created successfully");
            },
            (tx, err) => {
              console.log(`Error: ${err}`);
            }
          );

          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                barcode TEXT NOT NULL,
                description TEXT NOT NULL,
                quantity INTEGER,
                price REAL NOT NULL,
                image BLOB, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`,
            [],
            (tx, results) => {
              //console.log("Table Products created successfully");
            },
            (tx, err) => {
              console.log(`Error: ${err}`);
            }
          );

          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sales_id TEXT NOT NULL,
                customer_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                date TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(product_id) REFERENCES products(id),
                FOREIGN KEY(customer_id) REFERENCES customers(id)
            );`,
            [],
            (tx, results) => {
              //console.log("Table Sales created successfully");
            },
            (tx, err) => {
              console.log(`Error: ${err}`);
            }
          );

          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sales_id TEXT NOT NULL,
                date TIMESTAMP NOT NULL,
                amount REAL NOT NULL,
                payments_id INTEGER NOT NULL,
                received_amount REAL NOT NULL,
                delivered_amount REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(sales_id) REFERENCES sales(sales_id),
                FOREIGN KEY(payments_id) REFERENCES payments(id)
            );`,
            [],
            (tx, results) => {
              //console.log("Table Tickets created successfully");
            },
            (tx, err) => {
              console.log(`Error: ${err}`);
            }
          );
        },
        (err) => {
          console.log(`Error: ${err}`);
        },
        () => {
          console.log("Tables created successfully!");
        }
      );

      configureDevice()
        .then((id) => {
          setDeviceID(id);
        })
        .catch((err) => console.log(`Error: ${err}`));
    } catch (err) {
      console.log(`Error: ${err}`);
    }
  }, []);

  useEffect(() => {
    if (deviceID) {
      createDevice(deviceID).catch((err) => console.log(`Error: ${err}`));
      getPayments(deviceID).catch((err) => console.log(`Error: ${err}`));
      getLocations(deviceID).catch((err) => console.log(`Error: ${err}`));
      getCustomers(deviceID).catch((err) => console.log(`Error: ${err}`));
      getProducts(deviceID).catch((err) => console.log(`Error: ${err}`));
    }
  }, [deviceID]);

  const getPayments = async (deviceID) => {
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
  const getLocations = async (deviceID) => {
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

  const getCustomers = async (deviceID) => {
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

  const getProducts = async (deviceID) => {
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

  const createDevice = async (uniqueId) => {
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

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case "tickets":
                iconName = focused ? "ios-documents" : "ios-documents-outline";
                break;

              case "products":
                iconName = focused ? "ios-bandage" : "ios-bandage-outline";
                break;

              case "sales":
                iconName = focused ? "ios-cart" : "ios-cart-outline";
                break;

              case "customers":
                iconName = focused ? "ios-people" : "ios-people-outline";
                break;

              default:
                iconName = focused ? "ios-pulse" : "ios-pulse-outline";
                break;
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: Colors.header,
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen
          name="sales"
          component={SalesScreen}
          options={Styles.headerTabs("Ventas")}
        />
        <Tab.Screen
          name="tickets"
          component={TicketsScreen}
          options={Styles.headerTabs("Tickets")}
        />
        <Tab.Screen
          name="products"
          component={ProductsScreen}
          options={Styles.headerTabs("Productos")}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
