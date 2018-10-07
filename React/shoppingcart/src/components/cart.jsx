import React from "react";





const Cart = props => {
   
    
    if (Object.keys(props.cartItems).length == 0){
        return null;
    }
    return <div>
        {Object.keys(props.cartItems).map((items)=>{
            return (
                <div>
                    <button onClick = {() => props.onDelete(props.cartItems[items].id)}> delete </button>
                    
                    &nbsp;{props.cartItems[items].name} -- price: ${props.cartItems[items].price} -- number: {props.cartItems[items].number}
                </div>
            )
        })}
    </div>
}

export default Cart;


