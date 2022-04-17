import { React, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
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
export default function Sales(){
    return(
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Ventas Chingonas</Text>
        </View>
    );
}