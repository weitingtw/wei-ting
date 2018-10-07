import React from "react";
import ItemButtonContainer from "../containers/itemButtonContainer.js"
class ItemInput extends React.Component{
    constructor(props){
        super(props)
        this.state = {}
        this.handleChange = this.handleChange.bind(this)
    }
    
    handleChange(event){
        this.setState({[event.target.name]:event.target.value});
    }
    
    render(){
        return (<div> 
            <input type="text" name = "name" value={this.state.name} onChange = {this.handleChange}/>
            <input type="text" name = "price" value={this.state.price} onChange = {this.handleChange}/>      
            <ItemButtonContainer name = {this.state.name} price={this.state.price}/>    
        </div>)
        }
}

export default ItemInput;