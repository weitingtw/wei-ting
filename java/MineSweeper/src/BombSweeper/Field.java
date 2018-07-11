package BombSweeper;
import javafx.application.Application;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.geometry.Insets;
import javafx.scene.Node;
import javafx.scene.control.Label;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.GridPane;
import javafx.stage.Stage;

import java.util.ArrayList;
import java.util.Random;
public class Field{
	public static int mine_count;
	public static int flag_count;

	public static ArrayList<ArrayList<Box>> box_list = new ArrayList<ArrayList<Box>>();

	public static void initialize(){

		mine_count = 0;
		BombSweeper.flowpane.getChildren().add(new Label("Unknown" ));

		BombSweeper.newgamebutton.setOnMouseClicked(new EventHandler<MouseEvent>(){
					@Override
		            public void handle(MouseEvent event) {
						BombSweeper.flowpane.getChildren().remove(BombSweeper.flowpane.getChildren().size()-1);
						if (BombSweeper.flowpane.getChildren().size() == 2){
							BombSweeper.flowpane.getChildren().remove(BombSweeper.flowpane.getChildren().size()-1);
						}
						initialize();
					}
		});;

		box_list = new ArrayList<ArrayList<Box>>();
		BombSweeper.gamepane.getChildren().remove(0,BombSweeper.gamepane.getChildren().size());
		for (int i = 0; i<8; i++){
			box_list.add(new ArrayList<>());
		}
		for (int i = 0; i < 8; i++){
			for (int j = 0; j < 8; j++){
				Box thebox = Box.newbox();
				thebox.i = i;
				thebox.j = j;
				box_list.get(i).add(j, thebox);
				thebox.setOnMouseClicked(new EventHandler<MouseEvent>(){
					@Override
		            public void handle(MouseEvent event) {
						if (event.getButton() == MouseButton.PRIMARY){
							create_mine(thebox.i, thebox.j);

							update_mine_nearby();
							update_label(thebox, thebox.status);

							BombSweeper.flowpane.getChildren().remove(BombSweeper.flowpane.getChildren().size()-1);
							BombSweeper.flowpane.getChildren().add(new Label(Integer.toString(flag_count)));

							set_game_handler();
							check_game();


						}
						/*if (event.getButton() == MouseButton.SECONDARY){
							thebox.status = "flag";

							update_label(thebox, thebox.status);
							flag_handler_2(thebox);
							flag_count -= 1;
							check_game();

						}*/
					}
				});;
				BombSweeper.gamepane.add(thebox, i, j);
			}
		}


	}

	public static void set_game_handler(){
		for (int k = 0; k < BombSweeper.gamepane.getChildren().size(); k++){
			Node thebox = BombSweeper.gamepane.getChildren().get(k);
			Box the_box = (Box) thebox;
			the_box.setOnMouseClicked(new EventHandler<MouseEvent>(){
				@Override
            	public void handle(MouseEvent event) {
					if (event.getButton() == MouseButton.PRIMARY){

						update_label(the_box, the_box.status);

						check_game();
					}
					if (event.getButton() == MouseButton.SECONDARY){

						the_box.status = "flag";
						update_label(the_box, the_box.status);
						flag_handler_2(the_box);
						flag_count -= 1;

						BombSweeper.flowpane.getChildren().remove(BombSweeper.flowpane.getChildren().size()-1);
						BombSweeper.flowpane.getChildren().add(new Label(Integer.toString(flag_count)));

						check_game();
					}
				}
			});
		}
	}

	public static void flag_handler_1(Box thebox){
		thebox.setOnMouseClicked(new EventHandler<MouseEvent>(){
			@Override
			public void handle(MouseEvent event) {
				if (event.getButton() == MouseButton.PRIMARY){
					update_label(thebox, thebox.status);
					check_game();
				}
				if (event.getButton() == MouseButton.SECONDARY){

					thebox.status = "flag";
					update_label(thebox, thebox.status);
					flag_handler_2(thebox);
					flag_count -= 1;
					BombSweeper.flowpane.getChildren().remove(BombSweeper.flowpane.getChildren().size()-1);
					BombSweeper.flowpane.getChildren().add(new Label(Integer.toString(flag_count)));
					check_game();
				}
			}
		});
	}


	public static void flag_handler_2(Box thebox){
		thebox.setOnMouseClicked(new EventHandler<MouseEvent>(){
			@Override
			public void handle(MouseEvent event) {
				if (event.getButton() == MouseButton.PRIMARY){
					update_label(thebox, thebox.status);
					check_game();
				}
				if (event.getButton() == MouseButton.SECONDARY){
					System.out.println("sd");
					thebox.status = "blank";
					thebox.reveal = false;
					thebox.setText("");
					flag_handler_1(thebox);
					flag_count += 1;
					BombSweeper.flowpane.getChildren().remove(BombSweeper.flowpane.getChildren().size()-1);
					BombSweeper.flowpane.getChildren().add(new Label(Integer.toString(flag_count)));
					check_game();
				}
			}
		});
	}

	public static void create_mine(int i, int j){
		mine_count = 0;
		for (int k = 0; k < BombSweeper.gamepane.getChildren().size(); k++){

			Node thebox = BombSweeper.gamepane.getChildren().get(k);
			Box the_box = (Box) thebox;
			if (the_box.i != i && the_box.j != j){
				double rand = Math.random();
				if (rand < 0.15){

					the_box.status = "mine";
					mine_count += 1;

				}

			}

		}
		flag_count = mine_count;



	}

	public static void update_mine_nearby(){

		for (int k = 0; k < BombSweeper.gamepane.getChildren().size(); k++){
			Node thebox = BombSweeper.gamepane.getChildren().get(k);
			Box the_box = (Box) thebox;
			if (the_box.status == "blank"){
				int count = 0;
				int temp_i = the_box.i - 1;
				int max_i = temp_i+3;
				int temp_j = the_box.j - 1;
				int max_j = temp_j+3;

				for (; temp_i < max_i; temp_i++){

					for (; temp_j < max_j; temp_j++){

						if (temp_i >= 0 && temp_i <= 7 && temp_j >=0 && temp_j <= 7){
							Box the_box2 = getBox(temp_i, temp_j);
							if (the_box2.status == "mine"){
								count += 1;
							}
						}

					}
					temp_j -=3;
				}

			the_box.mine_nearby = count;

			}

		}


		/*
		if (box.status == "blank"){
			int count = 0;
			int temp_i = box.i - 1;
			int max_i = temp_i+3;
			int temp_j = box.j - 1;
			int max_j = temp_j+3;

			for (; temp_i < max_i; temp_i++){

				for (; temp_j < max_j; temp_j++){

					if (temp_i >= 0 && temp_i <= 7 && temp_j >=0 && temp_j <= 7){
						Box the_box2 = getBox(temp_i, temp_j);
						if (the_box2.status == "mine"){
							count += 1;
						}
					}

				}
				temp_j -=3;
			}

			box.mine_nearby = count;
		}
		*/
	}

	private static void check_game(){
		boolean flag = true;
		for (int k = 0; k < BombSweeper.gamepane.getChildren().size(); k++){
			Node thebox = BombSweeper.gamepane.getChildren().get(k);
			Box the_box = (Box) thebox;
			if (!the_box.reveal){
				flag = false;
				break;
			}
			if (the_box.status == "mine" && the_box.textProperty().getValue() != "F"){
				flag = false;
				break;
			}

		}

		if (flag){
			Label winlabel = new Label("you win");
			FlowPane.setMargin(winlabel, new Insets(0,0,0, 30));
			BombSweeper.flowpane.getChildren().add(winlabel);
			remove_listener();
		}

	}

	private static void reveal_mine(){
		for (int k = 0; k < BombSweeper.gamepane.getChildren().size(); k++){
			Node thebox = BombSweeper.gamepane.getChildren().get(k);
			Box the_box = (Box) thebox;
			if (the_box.status == "mine"){
				the_box.setText("M");
			}
		}
	}

	private static void remove_listener(){
		for (int k = 0; k < BombSweeper.gamepane.getChildren().size(); k++){
			Node thebox = BombSweeper.gamepane.getChildren().get(k);
			Box the_box = (Box) thebox;
			the_box.setOnMouseClicked(new EventHandler<MouseEvent>(){
				@Override
				public void handle(MouseEvent event) {

				}
			});

		}
	}

	private static Box getBox(int i, int j){


		return box_list.get(i).get(j);
	}
	public static void update_label(Box box, String label){

		if (label == "flag"){
			box.setText("F");
			box.reveal = true;
		}

		if (label == "mine"){
			box.setText("M");
			box.reveal = true;
			Label loselabel = new Label("gameover");
			FlowPane.setMargin(loselabel, new Insets(0,0,0, 30));
			BombSweeper.flowpane.getChildren().add(loselabel);
			reveal_mine();
			remove_listener();

		}

		if (label == "blank"){
			box.setText(Integer.toString(box.mine_nearby));
			box.reveal = true;
			if (box.mine_nearby == 0){

				int temp_i = box.i - 1;
				int max_i = temp_i+3;
				int temp_j = box.j - 1;
				int max_j = temp_j+3;


				for (; temp_i < max_i; temp_i++){

					for (; temp_j < max_j; temp_j++){



						if (temp_i >= 0 && temp_i <= 7 && temp_j >=0 && temp_j <= 7 && !(temp_i == box.i && temp_j == box.j) && box_list.get(temp_i).get(temp_j).reveal == false)
						{
							//update_mine_nearby(box_list.get(temp_i).get(temp_j), box_list.get(temp_i).get(temp_j).i, box_list.get(temp_i).get(temp_j).j);
							update_label(box_list.get(temp_i).get(temp_j),box_list.get(temp_i).get(temp_j).status);

						}

					}
					temp_j -=3;
				}


			}
		}
	}

}
