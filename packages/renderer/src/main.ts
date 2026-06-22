import {SceneManager} from "./scene/SceneManager";
import {createCanvasElement} from "three";

const manager = new SceneManager(
  createCanvasElement()
)
manager.render()