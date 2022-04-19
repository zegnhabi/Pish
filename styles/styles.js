const Colors = {
  no: "#ea573d",
  warning: "#fbc063",
  yes: "#64b0bc",
  header: "#446699",
  title: "#555577",
  white: "#ffffff",
  black: "#000000",
};

const Styles = {
  headerTabs: (title) => {
    return {
      title,
      headerStyle: {
        backgroundColor: Colors.header,
      },
      headerTintColor: Colors.white,
      headerTitleStyle: {
        fontWeight: "bold",
      },
    };
  },
  inputs: {
    backgroundColor: Colors.white,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: Colors.title,
    padding: 10,
    margin: 5,
    height: 40,
  },
};

export { Colors, Styles };
