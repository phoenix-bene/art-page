import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {Router} from '@angular/router';

@Component({
  selector: 'home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private SCALE = 1.0;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private group!: THREE.Group;
  private light!: THREE.DirectionalLight;
  private camera!: THREE.PerspectiveCamera;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private clickableDots: { mesh: THREE.Mesh, route: string }[] = [];

  private sphereRadius = 5 * this.SCALE;
  private gridPhiSteps = 22;    // vertical divisions (from top to equator)
  private gridThetaSteps = 45;  // horizontal divisions (from front to side)

  private lightVec = new THREE.Vector3(-6,10, 12).normalize();

  constructor(private router: Router) {
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.addLightAndShadow();
    this.addSphereDotsGrid();
    this.animate();
  }

  initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.group.position.set(1.5,0,0);

    this.camera = new THREE.PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    this.camera.position.z = 9 * this.SCALE;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    // Schatten hinzufügen
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  addLightAndShadow() {
    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.light.position.set(this.lightVec.x, this.lightVec.y, this.lightVec.z);
    this.light.castShadow = true;

    // Schattenqualität erhöhen (optional)
    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;
    this.light.shadow.camera.near = 1;
    this.light.shadow.camera.far = 50;

    this.scene.add(this.light);

    // Schattenempfänger
    const planeGeometry = new THREE.PlaneGeometry(150, 150);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.8 });
    const shadowPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -this.sphereRadius - 0.3; // leicht unterhalb der Sphäre
    shadowPlane.receiveShadow = true;

    this.scene.add(shadowPlane);
  }

  addSphereDotsGrid(): void {
    const canvasEl = this.canvasRef.nativeElement;
    const style = getComputedStyle(canvasEl);
    const colorHex = new THREE.Color(style.getPropertyValue('--art-primary-800').trim() || '#3399ff');

    const textureLoader = new THREE.TextureLoader();

    const baseCols = this.gridThetaSteps;

    for (let i = 0; i <= this.gridPhiSteps; i++) {
      const phi = (i / this.gridPhiSteps) * (Math.PI);

      // Kreisbreite als Schritt für theta
      const rowDensity = Math.sin(phi); // [0..1]
      const cols = Math.max(2, Math.floor(baseCols * rowDensity)); // mind. 2 Kreise pro Zeile

      const thetaStep = (Math.PI * 2) / cols;
      // Jede 2. Zeile um halbes Theta versetzen
      const thetaOffset = (i % 2 === 1) ? thetaStep / 2 : 0;

      const BASE_RADIUS = 0.35 * this.SCALE; // Kreis grösse
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
        const dot = Math.pow(normal.dot(this.lightVec) + (Math.PI/2), 2.5);
        const brightness = 0.5 + 0.8 * Math.max(0.2, dot);
        const color = colorHex.clone().multiplyScalar(brightness);
        const opacity = 0.2 + 0.8 * Math.max(0.2, dot);

        const material = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: opacity,
        });

        material.color = color;
        material.opacity = 0;
        material.transparent = true;
        material.wireframe = false;

        // Rand mit Linien simulieren
        const mesh = new THREE.Mesh(geometry, material);
        const edge = new THREE.EdgesGeometry(mesh.geometry);
        const border = new THREE.LineSegments(edge, new THREE.LineBasicMaterial({ color: color , opacity: opacity }));

        mesh.position.set(x, y, z);
        mesh.lookAt(new THREE.Vector3(0, 0, 0));
        border.position.copy(mesh.position);
        border.lookAt(new THREE.Vector3(0, 0, 0));
        border.castShadow = true;

        this.group.add(mesh);
        this.group.add(border);

        // Optional: einige Punkte enthalten ein Bild
        if (Math.random() < 0.15) {
          const texture = textureLoader.load('assets/sample.jpg');
          const imageMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
          });
          const imageMesh = new THREE.Mesh(new THREE.CircleGeometry(0.23, 32), imageMat);
          imageMesh.position.set(x, y, z + 0.01); // Etwas hervorgehoben
          imageMesh.lookAt(new THREE.Vector3(0, 0, 0));
          this.group.add(imageMesh);
        }

        // Angular-Routing-Route speichern
        const route = `/details/${i}-${j}`;
        this.clickableDots.push({ mesh, route });
      }
    }
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());

    const rotationSpeed = 0.003;
    this.group.rotation.y -= rotationSpeed;
    this.light.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotationSpeed);

    this.renderer.render(this.scene, this.camera);
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const canvasBounds = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    this.mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.clickableDots.map(dot => dot.mesh));

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const clicked = this.clickableDots.find(dot => dot.mesh === clickedMesh);
      if (clicked) {
        console.log(clicked.route);
        // this.router.navigate([clicked.route]);
      }
    }
  }
}
