import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {distinctUntilChanged, from, fromEvent, map} from 'rxjs';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'sphere',
  standalone: false,
  templateUrl: './sphere.component.html',
  styleUrls: ['sphere.component.scss']
})
export class SphereComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private group!: THREE.Group;
  private light!: THREE.DirectionalLight;
  private camera!: THREE.PerspectiveCamera;
  private borderLines: {border: THREE.LineSegments, mat: THREE.LineBasicMaterial}[] = [];

  private sphereRadius = 5;
  private gridPhiSteps = 22;    // vertical divisions (from top to equator)
  private gridThetaSteps = 45;  // horizontal divisions (from front to side)

  private baseColor;

  private onWindowResize = (): void => {
    const canvas = this.canvasRef.nativeElement;
    const sphereWidth = document.getElementById('sphere')?.clientWidth;
    const sphereHeight = document.getElementById('sphere')?.clientHeight;
    const width = sphereWidth ? sphereWidth : canvas.clientWidth;
    const height = sphereHeight ? sphereHeight : canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    console.log('Resize triggered: w/h', width, height);
  }

  constructor(@Inject(DOCUMENT) document: Document) {
    this.baseColor = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--art-primary-800').trim() || '#3399ff');
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.addLightAndShadow();
    this.addSphereDotsGrid();
    this.animate();

    window.addEventListener('resize', this.onWindowResize);
  }

  initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.group.position.set(1.6,0,0);

    this.camera = new THREE.PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    this.camera.position.z = 9;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.renderer.setSize(canvas.clientWidth * 0.99, canvas.clientHeight * 0.99);
    // Schatten hinzufügen
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  addLightAndShadow() {
    this.light = new THREE.DirectionalLight(0xffffff, 2);
    this.light.position.set(-8, 10, 12);
    this.light.castShadow = true;

    // Schattenqualität erhöhen (optional)
    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;
    this.light.shadow.camera.near = 5;
    this.light.shadow.camera.far = 40;
    this.light.shadow.camera.right = 8;
    // this.scene.add( new THREE.CameraHelper( this.light.shadow.camera ) ); // can be used to display camera edges
    this.scene.add(this.light);

    // Schattenempfänger
    const planeGeometry = new THREE.PlaneGeometry(500, 500);

    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.8, side: THREE.DoubleSide });
    const shadowPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -this.sphereRadius - 0.3; // leicht unterhalb der Sphäre
    shadowPlane.receiveShadow = true;
    // shadowPlane.material.color = new THREE.Color("white"); // can be used to change or display shadow more profound

    this.scene.add(shadowPlane);
  }

  addSphereDotsGrid(): void {
    const baseCols = this.gridThetaSteps;
    const lightDir = this.light.position.clone().normalize();

    for (let i = 0; i <= this.gridPhiSteps; i++) {
      const phi = (i / this.gridPhiSteps) * (Math.PI);

      // Kreisbreite als Schritt für theta
      const rowDensity = Math.sin(phi); // [0..1]
      const cols = Math.max(2, Math.floor(baseCols * rowDensity)); // mind. 2 Kreise pro Zeile

      const thetaStep = (Math.PI * 2) / cols;
      // Jede 2. Zeile um halbes Theta versetzen
      const thetaOffset = (i % 2 === 1) ? thetaStep / 2 : 0;

      const BASE_RADIUS = 0.35; // Kreis grösse
      const scale = Math.max(Math.pow(Math.sin(phi), 0.2), 0.9); // Polar Nähe kleinere Kreise
      const radius = BASE_RADIUS * scale;
      const geometry = new THREE.CircleGeometry(radius, 32);

      for (let j = 0; j <= cols; j++) {
        const theta = j * thetaStep + thetaOffset;

        const x = this.sphereRadius * Math.sin(phi) * Math.cos(theta);
        const y = this.sphereRadius * Math.cos(phi);
        const z = this.sphereRadius * Math.sin(phi) * Math.sin(theta);
        const normal = new THREE.Vector3(x,y,z).normalize();

        // Farbverlauf
        const dot = Math.pow(normal.dot(lightDir) + (Math.PI/2), 2.5);
        const brightness = 0.5 + 0.8 * Math.max(0.2, dot);
        const color = this.baseColor.clone().multiplyScalar(brightness);
        const opacity = 0.2 + 0.8 * Math.max(0.2, dot);

        // Rand mit Linien simulieren
        const edge = new THREE.EdgesGeometry(geometry);
        const borderMat = new THREE.LineBasicMaterial({ color: color , opacity: opacity });
        const border = new THREE.LineSegments(edge, borderMat);

        border.position.set(x, y, z);
        border.lookAt(new THREE.Vector3(0, 0, 0));
        border.castShadow = true;

        this.group.add(border);
        this.borderLines.push({border: border, mat: borderMat});
      }
    }
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());

    const rotationSpeed = 0.002;
    this.group.rotation.y -= rotationSpeed;
    this.light.lookAt(0,0,0);

    // Farbverlauf anpassen
    const lightDir = this.light.position.clone().normalize();

    this.borderLines.forEach(({border, mat}) => {
      const worldPos = new THREE.Vector3();
      border.getWorldPosition(worldPos);

      const normal = worldPos.clone().normalize();
      const dot = Math.pow(normal.dot(lightDir) + (Math.PI / 2), 2.5);
      const brightness = 0.5 + 0.8 * Math.max(0.2, dot);
      const opacity = 0.2 + 0.8 * Math.max(0.2, dot);

      mat.color = this.baseColor.clone().multiplyScalar(brightness);
      mat.opacity = opacity;
      border.material = mat;
    });

    this.renderer.render(this.scene, this.camera);
  }
}
