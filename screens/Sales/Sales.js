import { React, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Alert,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { Colors, Styles } from "../../styles/styles";
import Ionicons from "react-native-vector-icons/Ionicons";

import { openDatabase } from "../../provider/db/sqlite";

const db = openDatabase();

export default function Sales() {
  const [productsForSales, setProductsForSales] = useState([]);

  function SearchProducts() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    const onAddProduct = (product) => {
      setProductsForSales([...productsForSales, product]);
    };

    const fetchData = () => {
      console.log("Fetching data...", new Date());
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM products",
          [],
          (txObj, { rows: { _array } }) => {
            setProducts(_array);
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
        key={item.id}
        style={{
          height: 40,
          flexDirection: "row",
          borderBottomWidth: 0.1,
        }}
      >
        <View
          style={{
            alignContent: "center",
            marginVertical: 5,
            width: "90%",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "bold",
            }}
          >
            {item.name}
          </Text>
          <View>
            <Text>
              Código:
              {item.barcode} ${item.price}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            margin: 5,
          }}
          onPress={() =>
            onAddProduct({
              id: item.id,
              name: item.name,
              price: item.price,
              barcode: item.barcode,
              quantity: 1,
            })
          }
        >
          <Ionicons name="add-circle" size={32} color="green" />
        </TouchableOpacity>
      </View>
    );

    const onChangeBuscar = (text) => {
      if (text === "") {
        setFilteredProducts([]);
      } else {
        setFilteredProducts(
          products.filter(
            (product) =>
              product.name.toLowerCase().includes(text.toLowerCase()) ||
              product.barcode.toLowerCase().includes(text.toLowerCase())
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
          maxHeight: 250,
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

  function ListSales() {
    const items = ({ item }) => (
      <View
        key={item.id}
        style={{
          height: 60,
          flexDirection: "row",
          borderBottomWidth: 0.1,
        }}
      >
        <View
          style={{
            marginVertical: 5,
            width: "70%",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "bold",
            }}
          >
            {item.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                width: "80%",
                textAlign: "left",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                $
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {item.price} c/u
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                width: "20%",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                }}
              >
                $
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {item.price * item.quantity}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={{
            margin: 5,
          }}
          onPress={() =>
            onAddProduct({
              id: item.id,
              name: item.name,
              price: item.price,
              barcode: item.barcode,
              quantity: 1,
            })
          }
        >
          <Ionicons name="add-circle" size={32} color="green" />
        </TouchableOpacity>
        <TextInput
          style={{
            alignContent: "center",
            textAlign: "center",
            textAlignVertical: "center",
            paddingBottom: 15,
          }}
        >
          {item.quantity}
        </TextInput>
        <TouchableOpacity
          style={{
            margin: 5,
          }}
          onPress={() =>
            onAddProduct({
              id: item.id,
              name: item.name,
              price: item.price,
              barcode: item.barcode,
              quantity: 1,
            })
          }
        >
          <Ionicons name="remove-circle" size={32} color="red" />
        </TouchableOpacity>
      </View>
    );

    const onChangeBuscar = (text) => {
      if (text === "") {
        setFilteredProducts([]);
      } else {
        setFilteredProducts(
          products.filter(
            (product) =>
              product.name.toLowerCase().includes(text.toLowerCase()) ||
              product.barcode.toLowerCase().includes(text.toLowerCase())
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
          maxHeight: 250,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Productos Seleccionados
        </Text>
        <FlatList
          data={productsForSales}
          renderItem={items}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  }
  return (
    <View>
      <SearchProducts />
      <ListSales />
    </View>
  );
}
