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

export default function Sales() {
  const [productsForSales, setProductsForSales] = useState([]);
  const onAddProduct = (product) => {
    const existentProduct = productsForSales.find((p) => p.id === product.id);
    if (existentProduct) {
      console.log("Product already added");
      onAddSaleProduct(product.id);
    } else {
      console.log("Product added");
      setProductsForSales([...productsForSales, product]);
    }
  };

  const onAddSaleProduct = (id) => {
    const newProductsForSales = productsForSales.map((product) => {
      if (product.id === id) {
        product.quantity += 1;
      }
      return product;
    });
    setProductsForSales(newProductsForSales);
  };

  const onRemoveSaleProduct = (id) => {
    const newProductsForSales = productsForSales
      .map((product) => {
        if (product.id === id) {
          if (product.quantity > 0) {
            product.quantity -= 1;
          }
        }
        return product;
      })
      .filter((product) => product.quantity > 0);
    setProductsForSales(newProductsForSales);
  };

  function SearchProducts() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

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
          maxHeight: 350,
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
                {item.price.toFixed(2)} c/u
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
                {(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={{
            margin: 5,
          }}
          onPress={() => onAddSaleProduct(item.id)}
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
          keyboardType="numeric"
        >
          {item.quantity}
        </TextInput>
        <TouchableOpacity
          style={{
            margin: 5,
          }}
          onPress={() => onRemoveSaleProduct(item.id)}
        >
          <Ionicons name="remove-circle" size={32} color="red" />
        </TouchableOpacity>
      </View>
    );

    return (
      <View
        style={{
          paddingTop: 0,
          paddingHorizontal: 10,
          width: "100%",
          maxHeight: "90%",
          height: "90%",
        }}
      >
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
            textAlign: "center",
            paddingTop: 10,
          }}
        >
          Productos Agregados Vendidos:
          {productsForSales.reduce(
            (total, product) => total + product.quantity,
            0
          )}
        </Text>
        <FlatList
          data={productsForSales}
          renderItem={items}
          keyExtractor={(item) => item.id}
        />
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
            textAlign: "center",
            paddingTop: 10,
          }}
        >
          Monto Total: $
          {productsForSales
            .reduce(
              (total, product) => total + product.price * product.quantity,
              0
            )
            .toFixed(2)}
        </Text>
        <Button
          title="Cobrar"
          onPress={() => {
            console.log("Cobrar");
          }}
          iconName="save"
        />
        <Button
          title="Cancelar"
          onPress={() => {
            console.log("Cancelar");
          }}
          iconName="save"
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
