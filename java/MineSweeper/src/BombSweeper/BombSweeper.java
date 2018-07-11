package BombSweeper;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.Pane;
import javafx.stage.Stage;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;

public class BombSweeper extends Application{
	public static GridPane fieldpane = new GridPane();
	public static GridPane gamepane = new GridPane();
	public static FlowPane flowpane = new FlowPane();
	public static Button newgamebutton = new Button("New Game");


	@Override
	public void start(Stage stage1){
		Button startbutton = new Button("start");
		Pane startpane = new Pane();
		startbutton.prefHeight(20);
		startbutton.prefWidth(40);
		startpane.getChildren().add(startbutton);
		startbutton.setLayoutX(50);
		startbutton.setLayoutY(50);
		startbutton.setOnAction(new EventHandler<ActionEvent>() {
            @Override
            public void handle(ActionEvent event) {

                stage1.close();
                Stage stage2 = new Stage();
                fieldpane.add(flowpane, 0, 0);
                flowpane.getChildren().add(new Label("Flags Left: " ));

                fieldpane.add(gamepane, 0, 1);
                fieldpane.add(newgamebutton, 0, 2);
                Scene scene2 = new Scene(fieldpane, 250,350);
                stage2.setScene(scene2);
                stage2.setTitle("MineSweeper");
                stage2.show();
                Field.initialize();
            }
        });

		Scene startscene = new Scene(startpane, 150, 150);
		stage1.setScene(startscene);
		stage1.setTitle("MineSweeper");
		stage1.show();
	}
	public static void main(String[] args){
		Application.launch(args);
	}
}
