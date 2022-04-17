import { React, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Alert } from "react-native";
import { Text, TextInput, DataTable } from "react-native-paper";
import * as SQLite from "expo-sqlite";
import { Button } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Separator = () => <View style={styles.separator} />;
const Stack = createNativeStackNavigator();

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
export default function Products({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Productos" component={NewScreen} />
      <Stack.Screen name="Lista de Productos" component={ListScreen} />
    </Stack.Navigator>
  );
}
function ListScreen({ navigation }) {
  const [products, setProducts] = useState([]);

  const fetchData = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM products",
        [],
        (txObj, { rows: { _array } }) => setProducts(_array),
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
          <DataTable.Title>Código</DataTable.Title>
          <DataTable.Title>Descripción</DataTable.Title>
          <DataTable.Title>Piezas</DataTable.Title>
          <DataTable.Title>Precio</DataTable.Title>
        </DataTable.Header>
        {products.map((product) => {
          return (
            <DataTable.Row key={product.id}>
              <DataTable.Cell>{product.name}</DataTable.Cell>
              <DataTable.Cell>{product.barcode}</DataTable.Cell>
              <DataTable.Cell>{product.description}</DataTable.Cell>
              <DataTable.Cell>{product.quantity}</DataTable.Cell>
              <DataTable.Cell>{product.price}</DataTable.Cell>
            </DataTable.Row>
          );
        })}
      </DataTable>
    </ScrollView>
  );
}

export function NewScreen({ navigation }) {
  const [name, onChangeName] = useState("");
  const [barcode, onChangeBarcode] = useState("");
  const [description, onChangeDescription] = useState("");
  const [quantity, onChangeQuantity] = useState("");
  const [price, onChangePrice] = useState("");
  const [image, onChangeImage] = useState(null);
  const [canSave, setCanSave] = useState(false);

  useEffect(() => {
    if (name && barcode /*&& description*/ && quantity && price /*&& image*/) {
      setCanSave(true);
    } else {
      setCanSave(false);
    }
  });
  const clearForm = () => {
    onChangeName("");
    onChangeBarcode("");
    onChangeDescription("");
    onChangeQuantity("");
    onChangePrice("");
    onChangeImage(null);
  };

  const saveNewProduct = () => {
    if (
      name.length === 0 ||
      barcode.length === 0 ||
      quantity.length === 0 ||
      price.length === 0
    ) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO products (name, barcode, description, quantity, price, image) VALUES (?, ?, ?, ?, ?, ?)",
        [name, barcode, description, quantity, price, image],
        (txObj, results) => {
          clearForm();
          Alert.alert("Producto guardado");
        },
        (txObj, error) => console.log("Error ", error)
      );
    });
  };

  const deleteAllProducts = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM products",
        [],
        (txObj, results) => {
          clearForm();
          Alert.alert("Productos Eliminados");
        },
        (txObj, error) => console.log("Error ", error)
      );
    });
  };
  return (
    <ScrollView style={styles.container}>
      <TextInput value={name} onChangeText={onChangeName} label="Nombre" />
      <TextInput
        value={barcode}
        onChangeText={onChangeBarcode}
        label="Codigo de Barras"
        keyboardType="number-pad"
      />
      <TextInput
        value={description}
        onChangeText={onChangeDescription}
        label="Descripción"
      />
      <TextInput
        value={quantity}
        onChangeText={onChangeQuantity}
        label="Número de Piezas"
        keyboardType="number-pad"
      />
      <TextInput
        value={price}
        onChangeText={onChangePrice}
        label="Precio"
        keyboardType="decimal-pad"
      />
      <Separator />
      <Button
        icon="content-save"
        mode="outlined"
        onPress={saveNewProduct}
        disabled={!canSave}
      >
        Guardar
      </Button>
      <Button
        icon="table-arrow-up"
        mode="outlined"
        onPress={() => console.log("Pressed")}
      >
        Cargar Excel
      </Button>
      <Button
        icon="view-headline"
        mode="outlined"
        onPress={() => {
          navigation.navigate("Lista de Productos");
        }}
      >
        Ver Productos
      </Button>
      <Button icon="table-alert" mode="outlined" onPress={deleteAllProducts}>
        Eliminar Todos Los Productos
      </Button>
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
  separator: {
    marginVertical: 8,
    borderBottomColor: "#737373",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
