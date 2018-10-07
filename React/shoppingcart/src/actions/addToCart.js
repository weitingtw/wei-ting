import {ADD_TO_CART} from "../constants/constants.js";

const addToCart = (name, price, id) =>{
    return {
        type: ADD_TO_CART,
        item:{
          name: name,
          price: price,
          id: id,
          number: 1
        }
        
    };
};

export default addToCart;