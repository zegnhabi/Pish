import { React, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors, Styles } from "./styles/styles";
import ProductsScreen from "./screens/Products/Products";
import SalesScreen from "./screens/Sales/Sales";
import TicketsScreen from "./screens/Tickets/Tickets";
import * as SQLite from "expo-sqlite";

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
  useEffect(() => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            address TEXT,
            email TEXT UNIQUE NOT NULL,
            rfc TEXT
          );`,
          [],
          (tx, results) => {
            //console.log("Table Customers created successfully");
          },
          (tx, error) => {
            console.log("Error ", error);
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
                image BLOB
            );`,
          [],
          (tx, results) => {
            //console.log("Table Products created successfully");
          },
          (tx, error) => {
            console.log("Error ", error);
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
                date TEXT NOT NULL,
                FOREIGN KEY(product_id) REFERENCES products(id),
                FOREIGN KEY(customer_id) REFERENCES customers(id)
            );`,
          [],
          (tx, results) => {
            //console.log("Table Sales created successfully");
          },
          (tx, error) => {
            console.log("Error ", error);
          }
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sales_id TEXT NOT NULL,
                date TEXT NOT NULL,
                amount REAL NOT NULL,
                FOREIGN KEY(sales_id) REFERENCES sales(sales_id)
            );`,
          [],
          (tx, results) => {
            //console.log("Table Tickets created successfully");
          },
          (tx, error) => {
            console.log("Error ", error);
          }
        );

        tx.executeSql(
          `INSERT INTO customers (name, phone_number, address, email, rfc) VALUES (?,?,?,?,?);`,
          [
            "Publico En General",
            "+5217821063457",
            "5 de Febrero 806,  Centro, 93600 Martínez de la Torre, Ver., México",
            "nazarioromerosalas@gmail.com",
            "XAXX010101000",
          ],
          (tx, results) => {
            //console.log("Table Sales created successfully");
          },
          (tx, error) => {
            console.log("Error ", error);
          }
        );
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

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
