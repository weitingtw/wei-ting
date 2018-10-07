import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from "redux";
import { Provider } from "react-redux";
import './index.css';
import App from './App.js';
import registerServiceWorker from './registerServiceWorker';
import reducer from "./reducers/reducers.js"
import addItem from "./actions/addItem.js"
import addToCart from "./actions/addToCart.js"
import deleteFromCart from "./actions/deleteFromCart.js"

var store = createStore(reducer);

store.subscribe(() => {
  console.log(store.getState());
});

ReactDOM.render(
    <Provider store={store}>
    <App />
    </Provider>, 
    document.getElementById('root'));
registerServiceWorker();
