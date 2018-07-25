package BombSweeper;
import javafx.scene.control.Button;

public class Box extends Button{
	private boolean isMine;
	public int i;
	public int j;
	public String status;
	public int mine_nearby;
	public boolean reveal;

	public Box(){
		super("");
		this.isMine = false;
		this.i = -1;
		this.j = -1;
		this.status = "blank";
		this.mine_nearby = -1;
		this.reveal = false;;

	}

	public static Box newbox(){
		Box box = new Box();
		box.setMinWidth(30);
		box.setMinHeight(30);
		box.setPrefHeight(30);
		box.setPrefWidth(30);


		return box;
	}
}
