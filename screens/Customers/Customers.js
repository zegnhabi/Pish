import { React, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { DataTable } from "react-native-paper";

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

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  const fetchData = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM customers",
        [],
        (txObj, { rows: { _array } }) => setCustomers(_array),
        (txObj, error) => console.log("Error ", error)
      );
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Nombre</DataTable.Title>
          <DataTable.Title>Tel.</DataTable.Title>
          <DataTable.Title numeric>Dirección</DataTable.Title>
        </DataTable.Header>
        {customers.map((customer) => {
          return (
            <DataTable.Row key={customer.id}>
              <DataTable.Cell>{customer.name}</DataTable.Cell>
              <DataTable.Cell>{customer.phone_number}</DataTable.Cell>
              <DataTable.Cell numeric>{customer.address}</DataTable.Cell>
            </DataTable.Row>
          );
        })}
      </DataTable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingHorizontal: 10,
    width: "100%",
    height: "100%",
  },
});
