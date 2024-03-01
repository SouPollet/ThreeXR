import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
//XR
import {VRButton} from 'three/addons/webxr/VRButton.js';
import {ARButton} from 'three/addons/webxr/ARButton.js';
import {XRControllerModelFactory} from 'three/addons/webxr/XRControllerModelFactory.js';
import {XRHandModelFactory} from 'three/addons/webxr/XRHandModelFactory.js';

/*tslint:disabled*/

//#region DECLARATION VARIABLES
let canvas, stats;
let camera, scene, renderer, controls;
let torusMesh, socleMesh;
let exrCubeRenderTarget, exrBackground;

//XR
let hand1, hand2, characterGroup, headCharacter;
let controller1, controller2;
let controllerGrip1, controllerGrip2;

let posCameraZ = 10; 

//#endregion

init();
animate();

function init(){
//#region CONFIGURATION CAMERA
canvas = document.querySelector("#app");
scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer({ antialias: true,alpha:true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
//renderer.toneMapping = THREE.ACESFilmicToneMapping;

camera = new THREE.PerspectiveCamera(50,window.innerWidth / window.innerHeight,
  0.1, 160000,
); 

// XR
renderer.xr.enabled = true;
renderer.setClearColor(0x000000);
//renderer.setClearAlpha(0x000000);
document.body.appendChild(ARButton.createButton(renderer));
//document.body.appendChild(VRButton.createButton(renderer));

//#region XR

controller1 = renderer.xr.getController(0); //Main Gauche
//scene.add(controller1);

controller2 = renderer.xr.getController(1); //Main Droite
//scene.add(controller2);

const controllerModelFactory = new XRControllerModelFactory();
const handModelFactory = new XRHandModelFactory();

// XR-Hand 1
controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
scene.add(controllerGrip1);

hand1 = renderer.xr.getHand(0);
hand1.add(handModelFactory.createHandModel(hand1));
scene.add(hand1);
//-----------

// XR-Hand 2
controllerGrip2 = renderer.xr.getControllerGrip(1);
controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2))
scene.add(controllerGrip2);

hand2 = renderer.xr.getHand(1);
hand2.add(handModelFactory.createHandModel(hand2));
scene.add(hand2);
//------------

// XR-HelperRaycastHand
const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
const line = new THREE.Line(geometry);
line.name = 'line';
line.scale.z = 5;

hand1.name = "main gauche";

controller1.add(line.clone());
controller2.add(line.clone());
//-------------

// XR-Groupe personnage a placer
characterGroup = new THREE.Group();
characterGroup.add(controller1);
characterGroup.add(controller2);
characterGroup.add(hand1);
characterGroup.add(hand2);
characterGroup.add(controllerGrip1);
characterGroup.add(controllerGrip2);
characterGroup.add(camera);

characterGroup.position.z = posCameraZ; //Déplacer cam pour voir les modeles
scene.add(characterGroup);

console.log(camera.position.z);
//camera.position.z = posCameraZ;
console.log(camera.position.z);



//#endregion

//#endregion  

document.body.appendChild(renderer.domElement);


function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

onWindowResize();
window.addEventListener("resize", onWindowResize);

//Ajout des controles
/*
controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 20;
controls.maxDistance = 200;
controls.enableDamping = true;
controls.dampingFactor = 0.1;
*/

//#endregion

//#region 3D
//PBR
let reflectiveSilver = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness:0.1,
  metalness: 1,
  envMapIntensity: 6,
  side : THREE.DoubleSide,
});

let reflectiveGold = new THREE.MeshStandardMaterial({
  color: 0xdfaf2c,
  roughness:0,
  metalness: 1,
  roughness: 0.1,
  envMapIntensity: 6,
});

//FORMES GEOMETRIQUES
let knot = new THREE.TorusKnotGeometry(5, 2, 128, 24); //knot -> radius, tubeSize, resolution x, resolution y, nb tours, nb noeuds
let cube = new THREE.BoxGeometry(10,10,10);            //cube -> width, height, depth, nb subd w, nb subd h, nb subd d
let sphere = new THREE.SphereGeometry(5,64,64);        //sphere -> radius, nb subd x, nb subd y, posLigneCoupeX = 0, pacmanEffect, posLigneCoupeY=0, print3DEffect
let plane = new THREE.PlaneGeometry(10,10,10);         //plane -> width, height, nb subd x, nb subd y
let tetrahedron = new THREE.TetrahedronGeometry(5);   //thetahedron -> 

//Create a new material for code for gold
let bronzeMaterial = reflectiveSilver.clone();
  bronzeMaterial.color.set('#ff9051'); // couleur du material


torusMesh = new THREE.Mesh(knot, reflectiveGold);
let cubeMesh = new THREE.Mesh(cube,reflectiveSilver);
let sphereMesh = new THREE.Mesh(sphere,reflectiveGold);
let planeMesh = new THREE.Mesh(plane,reflectiveSilver);
let tetrahedronMesh = new THREE.Mesh(tetrahedron,reflectiveGold);

cubeMesh.position.x = 15;
sphereMesh.position.x = 30;
planeMesh.position.x = -15;
tetrahedronMesh.position.x = -30;
torusMesh.position.z = -30;

scene.add(torusMesh);
scene.add(cubeMesh);
scene.add(sphereMesh);
scene.add(planeMesh);
scene.add(tetrahedronMesh);

let sphere1 = new THREE.SphereGeometry(3,4,2)
headCharacter = new THREE.Mesh(sphere1,reflectiveGold);
headCharacter.name = "head";
scene.add(headCharacter);
characterGroup.add(headCharacter);
headCharacter.position.set(characterGroup.position.x, characterGroup.position.y, characterGroup.position.z);
//#endregion

//#region LUMIERES

//EXR
//Permet un LOD des textures d'envmap en fonction de la roughness du modele -> Rugueux texture plus floue, meilleures perfs
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
THREE.DefaultLoadingManager.onLoad = function () {
  pmremGenerator.dispose();
};
//Charge la texture au format exr
new EXRLoader().load("EXR/piz_compressed.exr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
  exrBackground = texture;
});

//Ambient light pour plus de realisme
// const light = new THREE.AmbientLight(0x404040, 200); // couleur de la lumière ambiante et intensité
// scene.add(light);
//#endregion

//#region Stats
//Performances
stats = new Stats();
canvas.parentElement.appendChild(stats.dom);

//#endregion

}

function animate() {
  renderer.render(scene, camera);
  renderer.setAnimationLoop(animate);

  
  //requestAnimationFrame(animate);
  stats.begin();
  camera.updateMatrixWorld();
  //controls.update();

  //#region TESTS
  //Pour animer le torus
  torusMesh.rotation.x += 0.01;
  torusMesh.rotation.y += 0.03;

  /*
  console.log("Head x : "+headCharacter.position.x + " y : "+headCharacter.position.y + " z : "+ headCharacter.position.z);
  console.log("XR_Chara x : "+characterGroup.position.x + " y : "+characterGroup.position.y + " z : "+ characterGroup.position.z);
  */
  console.log("Camera x : "+camera.position.x + " y : "+camera.position.y + " z : "+ camera.position.z);
    

  //#endregion

  let newEnvMap = torusMesh.material.envMap;
  let background = scene.background;

  newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
  background = exrBackground;

  if (newEnvMap !== torusMesh.material.envMap) {
    torusMesh.material.envMap = newEnvMap;
    torusMesh.material.needUpdate = true;
  }

  scene.environment = background;
  stats.end();

}