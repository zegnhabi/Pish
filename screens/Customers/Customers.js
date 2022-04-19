import { React, useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View, Text } from "react-native";
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

  const items = ({ item }) => {
    return (
      <View>
        <Text>{item.name}</Text>
        <Text>{item.phone_number}</Text>
        <Text>{item.address}</Text>
      </View>
    );
  };

  return (
    <View
      style={{
        paddingTop: 0,
        paddingHorizontal: 10,
        width: "100%",
        height: "100%",
      }}
    >
      <FlatList
        data={customers}
        renderItem={items}
        keyExtractor={(item) => item.id}
      />
    </View>
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
