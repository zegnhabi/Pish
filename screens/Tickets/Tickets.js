import { React, useEffect, useCallback } from 'react';
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
export default function Tickets(){
    return(
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Tickets Chingones</Text>
        </View>
    );
}