import { React, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors, Styles } from "./styles/styles";
import ProductsScreen from "./screens/Products/Products";
import SalesScreen from "./screens/Sales/Sales";
import TicketsScreen from "./screens/Tickets/Tickets";
import uuid from "react-native-uuid";
import * as Network from "expo-network";
import * as SecureStore from "expo-secure-store";
import { openDatabase } from "./provider/db/sqlite";
import {
  createDevice,
  getPayments,
  getLocations,
  getCustomers,
  getProducts,
} from "./provider/api/client";

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
