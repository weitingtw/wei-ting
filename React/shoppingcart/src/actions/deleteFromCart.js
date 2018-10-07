import {DELETE_FROM_CART} from "../constants/constants.js";

const deleteFromCart = (id) =>{
  return {
      type: DELETE_FROM_CART,
      id: id
  }  
};

export default deleteFromCart;