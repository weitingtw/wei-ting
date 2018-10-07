import { combineReducers } from "redux";
import {ADD_ITEM, ADD_TO_CART, DELETE_FROM_CART} from "../constants/constants.js";


var cart_items = {};
var shop_items = {};

const cartItems = (state = cart_items, action) =>{
    switch (action.type){
        case ADD_TO_CART:
            var stateCopy = Object.assign({}, state);
            if (action.item.id in stateCopy){
                stateCopy[action.item.id].number += 1; 
            } else{
                stateCopy[action.item.id] = action.item;
            }
            return stateCopy;
        case DELETE_FROM_CART:
            var stateCopy = Object.assign({}, state);
            delete stateCopy[action.id];
            return stateCopy;
            
        default:
            return state;
            
    }
}

const shopItems = (state = shop_items, action) => {
    switch (action.type){
        case ADD_ITEM:
            var stateCopy = Object.assign({}, state);
            stateCopy[action.item.id] = action.item;
            return stateCopy;
            
        default:
            return state;
    }
}

const reducer = combineReducers({
    cartItems,
    shopItems
});

export default reducer;

