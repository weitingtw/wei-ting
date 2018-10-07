import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ItemInput from './components/itemInput.jsx'
import reducer from "./reducers/reducers.js"
import ItemslistContainer from './containers/ItemslistContainer.js'
import CartContainer from './containers/CartContainer.js'
import { createStore } from "redux";
import { Provider } from "react-redux";

var store = createStore(reducer);
class App extends Component {
  render() {
    return (
        <div>
        <ItemInput/>
        <h4>ItemsList</h4>
        <ItemslistContainer/>
        <h4>Cart</h4>
        <CartContainer/>
        </div>
    );
  }
}

export default App;
