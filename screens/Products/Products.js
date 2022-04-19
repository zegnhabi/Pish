import { React, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Alert,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Colors, Styles } from "../../styles/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import ExcelJS from "exceljs";
import { Buffer } from "buffer";
//import Barcode from "@kichiyaki/react-native-barcode-generator";

const Separator = () => <View style={styles.separator} />;
const Stack = createNativeStackNavigator();

const Button = ({ title, onPress, iconName }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: Colors.yes,
      padding: 5,
      margin: 5,
      borderRadius: 5,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        height: 40,
      }}
    >
      <Ionicons
        name={iconName}
        style={{
          margin: 5,
          padding: 5,
          fontSize: 20,
          color: Colors.white,
        }}
      />
      <Text
        style={{
          margin: 5,
          padding: 5,
          fontSize: 15,
          color: Colors.white,
          fontWeight: "bold",
        }}
      >
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);

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
      <Stack.Screen
        name="newScreen"
        component={NewScreen}
        options={{
          title: "Nuevo",
        }}
      />
      <Stack.Screen
        name="listScreen"
        component={ListScreen}
        options={{
          headerTitle: "Productos",
        }}
      />
    </Stack.Navigator>
  );
}
function ListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const fetchData = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM products",
        [],
        (txObj, { rows: { _array } }) => {
          setProducts(_array);
          setFilteredProducts(_array);
        },
        (txObj, error) => console.log("Error ", error)
      );
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const items = ({ item }) => (
    <View
      style={{
        flex: 1,
        borderColor: Colors.title,
        borderWidth: 0.5,
        padding: 5,
        backgroundColor: Colors.white,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        {item.name}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {/* <Barcode
          style={{
            fontSize: 5,
          }}
          format="CODE128B"
          value={item.barcode}
          text={item.barcode}
          width={1.25}
          height={25}
        /> */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            {" "}
            Código:
          </Text>
          <Text>{item.barcode}</Text>
          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            {" "}
            Piezas:
          </Text>
          <Text>{item.quantity}</Text>
          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            {" "}
            Precio:
          </Text>
          <Text>${item.price}</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
          }}
        >
          {" "}
          Descripción:
        </Text>
        <Text>{item.description}</Text>
      </View>
    </View>
  );
  const onChangeBuscar = (text) => {
    if (text === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((product) =>
          product.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
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
      <TextInput
        style={Styles.inputs}
        placeholder="Buscar"
        onChangeText={onChangeBuscar}
      />
      <FlatList
        data={filteredProducts}
        renderItem={items}
        keyExtractor={(item) => item.id}
      />
    </View>
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
    Alert.alert("Eliminar Todos los Productos", "¿Esta seguro?", [
      {
        text: "OK",
        onPress: () => {
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
        },
      },
      {
        text: "Cancelar",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
    ]);
  };
  const loadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();
      if (result.type === "success") {
        const file = await FileSystem.readAsStringAsync(result.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        console.log(result.size);
        const buffer = Buffer.from(file, "base64");
        const workbook = new ExcelJS.Workbook();
        workbook.xlsx
          .load(buffer)
          .then((workbook) => {
            const worksheet = workbook.getWorksheet(1);
            worksheet.eachRow((row, rowNumber) => {
              console.log(row);
              if (rowNumber > 1) {
                db.transaction((tx) => {
                  tx.executeSql(
                    "INSERT INTO products (name, barcode, description, quantity, price, image) VALUES (?, ?, ?, ?, ?, ?)",
                    [
                      row.getCell(1).value,
                      row.getCell(2).value,
                      row.getCell(3).value,
                      row.getCell(4).value,
                      row.getCell(5).value,
                      row.getCell(6).value,
                    ],
                    (txObj, results) =>
                      console.log(`Inserted Product: ${row.getCell(1).value}`),
                    (txObj, error) => console.log("Error ", error)
                  );
                });
              }
            });
          })
          .then(() => {
            Alert.alert("Productos Cargados");
            clearForm();
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        console.log(result.type);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View>
      <TextInput
        style={Styles.inputs}
        value={name}
        onChangeText={onChangeName}
        placeholder="Nombre"
      />
      <TextInput
        style={Styles.inputs}
        value={barcode}
        onChangeText={onChangeBarcode}
        placeholder="Codigo de Barras"
        keyboardType="number-pad"
      />
      <TextInput
        style={Styles.inputs}
        value={description}
        onChangeText={onChangeDescription}
        placeholder="Descripción"
      />
      <TextInput
        style={Styles.inputs}
        value={quantity}
        onChangeText={onChangeQuantity}
        placeholder="Número de Piezas"
        keyboardType="number-pad"
      />
      <TextInput
        style={Styles.inputs}
        value={price}
        onChangeText={onChangePrice}
        placeholder="Precio"
        keyboardType="decimal-pad"
      />
      <Separator />
      <Button title="Guardar" onPress={saveNewProduct} iconName="save" />
      <Button title="Cargar Excel" onPress={loadFile} iconName="cloud-upload" />
      <Button
        title="Eliminar Todos Los Productos"
        onPress={deleteAllProducts}
        iconName="trash"
      />
      <Button
        title="Ver Productos"
        onPress={() => {
          navigation.navigate("listScreen");
        }}
        iconName="reader-outline"
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
  separator: {
    marginVertical: 8,
    borderBottomColor: "#737373",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
