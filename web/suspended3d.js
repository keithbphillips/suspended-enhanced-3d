// Suspended 3D Visualization System
// Enhanced Ray-Traced Graphics for the 1983 Infocom Game

class Suspended3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentRoom = null;
        this.currentRobot = 'iris';
        this.robots = {};
        this.rooms = {};
        
        // Robot starting locations (from game analysis)
        this.robotLocations = {
            iris: 'weather-banks',
            waldo: 'repair3', 
            sensa: 'cpu-room',
            auda: 'entry-area',
            poet: 'cpu-room',
            whiz: 'periph-3'
        };

        // Room definitions based on game source analysis
        this.roomDefinitions = {
            'cpu-room': {
                name: 'Central Chamber',
                description: 'Spherical room with electrical wiring and central column',
                type: 'sphere',
                color: 0x004466,
                features: ['central-column', 'wiring', 'electrical-flows']
            },
            'weather-banks': {
                name: 'Weather Monitors',
                description: 'Room filled with weather monitoring equipment',
                type: 'rectangular',
                color: 0x334455,
                features: ['monitors', 'weather-displays']
            },
            'rtd-banks': {
                name: 'Transit Monitors',
                description: 'Transit system monitoring room',
                type: 'rectangular',
                color: 0x445533,
                features: ['monitors', 'transit-displays']
            },
            'servo-systems': {
                name: 'Hydroponics Monitors',
                description: 'Hydroponics monitoring systems',
                type: 'rectangular',
                color: 0x335544,
                features: ['monitors', 'hydro-displays']
            },
            'supplies-north': {
                name: 'Main Supply Room',
                description: 'Main supply room with debris and equipment',
                type: 'rectangular',
                color: 0x443322,
                features: ['machine-with-sockets', 'supply-shelves', 'debris']
            },
            'supplies-mid': {
                name: 'Middle Supply Room',
                description: 'L-shaped supply room middle section',
                type: 'rectangular',
                color: 0x433322,
                features: ['debris', 'damaged-shelving']
            },
            'supplies-south': {
                name: 'Sub Supply Room',
                description: 'Sub-station of the supply rooms',
                type: 'rectangular',
                color: 0x423322,
                features: ['debris', 'damaged-shelving']
            },
            'repair1': {
                name: 'Alpha Repair',
                description: 'Robot repair area with conveyor system',
                type: 'industrial',
                color: 0x2244aa, // Distinct blue tint
                features: ['conveyor-belt', 'repair-equipment', 'alpha-indicators']
            },
            'repair2': {
                name: 'Beta Repair',
                description: 'Middle robot repair station',
                type: 'industrial',
                color: 0x22aa44, // Distinct green tint
                features: ['conveyor-belt', 'repair-equipment', 'beta-indicators']
            },
            'repair3': {
                name: 'Gamma Repair',
                description: 'End of robot repair area with wire cage',
                type: 'industrial',
                color: 0xaa2244, // Distinct red tint
                features: ['conveyor-belt', 'repair-equipment', 'wiring', 'wire-cage', 'gamma-indicators']
            },
            'entry-area': {
                name: 'Entry Area',
                description: 'Small square room with exits east and west',
                type: 'rectangular',
                color: 0x223344,
                features: ['doorways', 'simple-walls']
            },
            'periph-1': {
                name: 'Index Peripheral',
                description: 'CLC Index peripheral station',
                type: 'circular',
                color: 0x445566,
                features: ['data-pedestal', 'computer-interface']
            },
            'periph-2': {
                name: 'Technical Peripheral',
                description: 'CLC Technical peripheral station',
                type: 'circular',
                color: 0x445566,
                features: ['data-pedestal', 'computer-interface']
            },
            'periph-3': {
                name: 'Advisory Peripheral',
                description: 'CLC Advisory peripheral station',
                type: 'circular',
                color: 0x445566,
                features: ['data-pedestal', 'computer-interface']
            },
            'periph-4': {
                name: 'Historical Peripheral',
                description: 'CLC Historical peripheral station',
                type: 'circular',
                color: 0x445566,
                features: ['data-pedestal', 'computer-interface']
            },
            'clc-core': {
                name: 'Central Core',
                description: 'Main CLC computer core chamber',
                type: 'circular',
                color: 0x001155,
                features: ['massive-computer', 'electrical-flows', 'central-core']
            },
            'weather': {
                name: 'Weather Control Area',
                description: 'Weather control room with three dials',
                type: 'rectangular',
                color: 0x556644,
                features: ['three-dials', 'small-console']
            },
            'hydro': {
                name: 'Hydroponics Control Area',
                description: 'Hydroponics control room with three levers',
                type: 'rectangular',
                color: 0x446655,
                features: ['three-levers', 'small-console']
            },
            'rtd': {
                name: 'Transit Control Area',
                description: 'Transit control room with switching devices',
                type: 'rectangular',
                color: 0x665544,
                features: ['small-console', 'control-panels']
            },
            'sky1': {
                name: 'Skywalk Alpha',
                description: 'Eastern skywalk section',
                type: 'corridor',
                color: 0x334466,
                features: ['transport-tube', 'elevated-walkway']
            },
            'sky2': {
                name: 'Skywalk Beta',
                description: 'Middle skywalk section',
                type: 'corridor',
                color: 0x334466,
                features: ['transport-tube', 'elevated-walkway']
            },
            'sky3': {
                name: 'Skywalk Gamma',
                description: 'Western skywalk section',
                type: 'corridor',
                color: 0x334466,
                features: ['transport-tube', 'elevated-walkway']
            },
            'fc1': {
                name: 'Alpha FC',
                description: 'Alpha Filtering Computer chamber',
                type: 'massive',
                color: 0x662244,
                features: ['massive-computer', 'filtering-systems']
            },
            'fc2': {
                name: 'Beta FC',
                description: 'Beta Filtering Computer chamber',
                type: 'massive',
                color: 0x662244,
                features: ['massive-computer', 'filtering-systems']
            },
            'fc3': {
                name: 'Gamma FC',
                description: 'Gamma Filtering Computer chamber',
                type: 'massive',
                color: 0x662244,
                features: ['massive-computer', 'filtering-systems']
            },
            'acidmist': {
                name: 'Cavernous Room',
                description: 'Large cavern with acid mist',
                type: 'cavern',
                color: 0x443311,
                features: ['acid-mist', 'hazardous-environment']
            },
            'corridor-1': {
                name: 'Angling Corridor',
                description: 'Long angling corridor',
                type: 'corridor',
                color: 0x445544,
                features: ['simple-corridor']
            },
            'corridor-2': {
                name: 'Bending Corridor',
                description: 'Corridor with a bend',
                type: 'corridor',
                color: 0x445544,
                features: ['simple-corridor']
            },
            'corridor-3': {
                name: 'Southeast Junction',
                description: 'Junction corridor connecting passages',
                type: 'corridor',
                color: 0x554544,
                features: ['simple-corridor']
            },
            'corridor-4': {
                name: 'Short Corridor',
                description: 'Brief connecting passage',
                type: 'corridor',
                color: 0x445455,
                features: ['simple-corridor']
            },
            'hallway-junction': {
                name: 'Hallway Junction',
                description: 'Major hallway intersection',
                type: 'junction',
                color: 0x556655,
                features: ['intersection', 'multiple-exits']
            },
            'corridor-north': {
                name: 'North Passage',
                description: 'Northern corridor passage',
                type: 'corridor',
                color: 0x445544,
                features: ['simple-corridor']
            },
            'corridor-south': {
                name: 'South Passage',
                description: 'Southern corridor passage',
                type: 'corridor',
                color: 0x445544,
                features: ['simple-corridor']
            },
            'corridor-east': {
                name: 'East Passage',
                description: 'Eastern corridor passage',
                type: 'corridor',
                color: 0x445544,
                features: ['simple-corridor']
            },
            'corridor-west': {
                name: 'West Passage',
                description: 'Western corridor passage',
                type: 'corridor',
                color: 0x445544,
                features: ['simple-corridor']
            },
            'corridor-ne': {
                name: 'NorthEast Passage',
                description: 'Northeastern corridor passage',
                type: 'corridor',
                color: 0x445544,
                features: ['simple-corridor']
            },
            'corridor-nw': {
                name: 'NorthWest Passage',
                description: 'Northwestern corridor passage',
                type: 'corridor',
                color: 0x445544,
                features: ['simple-corridor']
            },
            'corridor-sw': {
                name: 'SouthWest Passage',
                description: 'Southwestern corridor passage',
                type: 'corridor',
                color: 0x445544,
                features: ['simple-corridor']
            },
            'weather': {
                name: 'Weather Control Area',
                description: 'Weather control room with dials and controls',
                type: 'rectangular',
                color: 0x556644,
                features: ['control-panels', 'weather-controls']
            },
            'rtd': {
                name: 'Transit Control Area',
                description: 'Transit control room with switches',
                type: 'rectangular',
                color: 0x665544,
                features: ['control-panels', 'transit-controls']
            },
            'hydro': {
                name: 'Hydroponics Control Area',
                description: 'Hydroponics control room with levers',
                type: 'rectangular',
                color: 0x446655,
                features: ['control-panels', 'hydro-controls']
            },
            'decon-chamber': {
                name: 'Decontamination Chamber',
                description: 'Small chamber with sterilization systems',
                type: 'rectangular',
                color: 0x666644,
                features: ['decon-equipment']
            },
            'sterile-area': {
                name: 'Sterilization Chamber',
                description: 'Clean room with UV sterilization',
                type: 'rectangular',
                color: 0x667766,
                features: ['sterile-equipment']
            },
            'tool-area': {
                name: 'Small Supply Room',
                description: 'Compact room with wall-mounted tools',
                type: 'rectangular',
                color: 0x554433,
                features: ['wall-tools']
            },
            'rec-area': {
                name: 'Activities Area',
                description: 'Recreation area with various objects',
                type: 'rectangular',
                color: 0x445566,
                features: ['recreational-items']
            },
            'sleep-chamber': {
                name: 'Sleep Chamber',
                description: 'Rest area with sleeping platforms',
                type: 'rectangular',
                color: 0x334455,
                features: ['sleeping-platforms']
            },
            'robot-passage': {
                name: 'Southeast Passage',
                description: 'Passage leading to robot maintenance areas',
                type: 'corridor',
                color: 0x445555,
                features: ['simple-corridor']
            },
            'robot-z': {
                name: 'Bending Passage',
                description: 'Curved passage toward repair areas',
                type: 'corridor',
                color: 0x455545,
                features: ['simple-corridor']
            },
            'acidmist': {
                name: 'Cavernous Room',
                description: 'Large cavern with acid mist',
                type: 'cavern',
                color: 0x443311,
                features: ['acid-mist', 'hazardous-environment']
            },
            'midmist': {
                name: 'East End',
                description: 'Eastern section of cavernous area',
                type: 'cavern',
                color: 0x443322,
                features: ['acid-mist']
            },
            'hallway': {
                name: 'Hallway',
                description: 'Standard connecting hallway',
                type: 'corridor',
                color: 0x556644,
                features: ['simple-corridor']
            },
            'access-hallway': {
                name: 'Access Hallway',
                description: 'Junction hallway providing access',
                type: 'corridor',
                color: 0x556655,
                features: ['simple-corridor']
            },
            'hallway-corner': {
                name: 'Hallway Corner',
                description: 'Corner turn in hallway system',
                type: 'corridor',
                color: 0x556666,
                features: ['simple-corridor']
            },
            'hallway-branch': {
                name: 'Hallway Branch',
                description: 'T-intersection in hallway',
                type: 'junction',
                color: 0x557766,
                features: ['intersection']
            },
            'hallway-end': {
                name: 'Hallway End',
                description: 'Terminal end of hallway system',
                type: 'corridor',
                color: 0x556677,
                features: ['simple-corridor']
            },
            'human-entry': {
                name: 'Sloping Corridor',
                description: 'Sloped corridor with step',
                type: 'corridor',
                color: 0x667755,
                features: ['sloped-floor']
            },
            'lower-core': {
                name: 'Library Entrance',
                description: 'Entrance to the library core system',
                type: 'circular',
                color: 0x445577,
                features: ['library-entrance']
            },
            'inner-core': {
                name: 'Library Core',
                description: 'Inner core of library system',
                type: 'circular',
                color: 0x445588,
                features: ['library-core']
            },
            'ne-passage1': {
                name: 'Rising Passage',
                description: 'Inclined passage rising to upper level',
                type: 'corridor',
                color: 0x556677,
                features: ['sloped-floor']
            },
            'ne-passage2': {
                name: 'Top Passage',
                description: 'Upper level passage to skywalk',
                type: 'corridor',
                color: 0x556688,
                features: ['elevated-passage']
            },
            'bio-lab': {
                name: 'Biological Laboratory',
                description: 'Research laboratory with biological equipment',
                type: 'rectangular',
                color: 0x446677,
                features: ['lab-equipment']
            },
            'cryounits': {
                name: 'Cryogenic Area',
                description: 'Area with cryogenic storage units',
                type: 'rectangular',
                color: 0x445588,
                features: ['cryogenic-units']
            }
        };

        this.init();
        this.initMinimap();
    }

    init() {
        this.setupScene();
        this.setupLighting();
        this.setupControls();
        this.setupEventListeners();
        this.loadInitialRoom();
        this.animate();
    }

    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x001122);
        this.scene.fog = new THREE.Fog(0x001122, 10, 100);

        // Create camera
        const container = document.getElementById('threejs-container');
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);

        // Create renderer with improved settings for ray-traced look
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        container.appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Main directional light (simulating overhead lighting)
        const mainLight = new THREE.DirectionalLight(0x00ff88, 1.0);
        mainLight.position.set(10, 20, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -20;
        mainLight.shadow.camera.right = 20;
        mainLight.shadow.camera.top = 20;
        mainLight.shadow.camera.bottom = -20;
        this.scene.add(mainLight);

        // Accent lighting for sci-fi atmosphere
        const accentLight1 = new THREE.PointLight(0x0088ff, 0.8, 30);
        accentLight1.position.set(-10, 5, -10);
        this.scene.add(accentLight1);

        const accentLight2 = new THREE.PointLight(0xff4400, 0.6, 25);
        accentLight2.position.set(10, 3, -5);
        this.scene.add(accentLight2);

        // Add subtle rim lighting
        const rimLight = new THREE.DirectionalLight(0x0066ff, 0.5);
        rimLight.position.set(-10, 10, -10);
        this.scene.add(rimLight);
    }

    setupControls() {
        // Orbit controls for camera movement
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    setupEventListeners() {
        // Robot selector
        const robotSelect = document.getElementById('robotSelect');
        if (robotSelect) {
            robotSelect.addEventListener('change', (event) => {
                this.switchRobot(event.target.value);
            });
        }
    }

    createRoom(roomId) {
        const roomDef = this.roomDefinitions[roomId];
        if (!roomDef) return null;

        const roomGroup = new THREE.Group();
        roomGroup.name = roomId;

        // Create basic room geometry based on type
        let roomGeometry, roomMaterial;

        switch (roomDef.type) {
            case 'sphere':
                roomGeometry = new THREE.SphereGeometry(8, 32, 16);
                roomMaterial = new THREE.MeshPhongMaterial({
                    color: roomDef.color,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.BackSide
                });
                break;
            case 'circular':
                roomGeometry = new THREE.CylinderGeometry(6, 6, 6, 16);
                roomMaterial = new THREE.MeshPhongMaterial({
                    color: roomDef.color,
                    transparent: true,
                    opacity: 0.2
                });
                break;
            case 'industrial':
                roomGeometry = new THREE.BoxGeometry(12, 8, 12);
                roomMaterial = new THREE.MeshPhongMaterial({
                    color: roomDef.color,
                    transparent: true,
                    opacity: 0.2
                });
                break;
            case 'corridor':
                // Create a proper corridor with walls, floor, and ceiling
                return this.createCorridorRoom(roomDef);
            case 'junction':
                roomGeometry = new THREE.CylinderGeometry(8, 8, 6, 8);
                roomMaterial = new THREE.MeshPhongMaterial({
                    color: roomDef.color,
                    transparent: true,
                    opacity: 0.2
                });
                break;
            case 'massive':
                roomGeometry = new THREE.BoxGeometry(20, 12, 20);
                roomMaterial = new THREE.MeshPhongMaterial({
                    color: roomDef.color,
                    transparent: true,
                    opacity: 0.25
                });
                break;
            case 'cavern':
                roomGeometry = new THREE.SphereGeometry(15, 16, 12);
                roomMaterial = new THREE.MeshPhongMaterial({
                    color: roomDef.color,
                    transparent: true,
                    opacity: 0.1,
                    side: THREE.BackSide
                });
                break;
            default: // rectangular
                roomGeometry = new THREE.BoxGeometry(10, 6, 10);
                roomMaterial = new THREE.MeshPhongMaterial({
                    color: roomDef.color,
                    transparent: true,
                    opacity: 0.2
                });
        }

        const roomMesh = new THREE.Mesh(roomGeometry, roomMaterial);
        roomMesh.position.y = 0;
        roomGroup.add(roomMesh);

        // Add room-specific features
        this.addRoomFeatures(roomGroup, roomDef);

        // Add floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -3;
        floor.receiveShadow = true;
        roomGroup.add(floor);

        return roomGroup;
    }

    addRoomFeatures(roomGroup, roomDef) {
        console.log(`🔧 Adding features for ${roomDef.name}:`, roomDef.features);
        roomDef.features.forEach(feature => {
            console.log(`  ➤ Adding feature: ${feature}`);
            switch (feature) {
                case 'central-column':
                    this.addCentralColumn(roomGroup);
                    break;
                case 'wiring':
                    this.addElectricalWiring(roomGroup);
                    break;
                case 'monitors':
                    this.addMonitors(roomGroup);
                    break;
                case 'conveyor-belt':
                    this.addConveyorBelt(roomGroup);
                    break;
                case 'data-pedestal':
                    this.addDataPedestal(roomGroup);
                    break;
                case 'electrical-flows':
                    this.addElectricalEffects(roomGroup);
                    break;
                case 'control-panels':
                    this.addControlPanels(roomGroup);
                    break;
                case 'transport-tube':
                    this.addTransportTube(roomGroup);
                    break;
                case 'massive-computer':
                    this.addMassiveComputer(roomGroup);
                    break;
                case 'acid-mist':
                    this.addAcidMist(roomGroup);
                    break;
                case 'debris':
                    this.addDebris(roomGroup);
                    break;
                case 'alpha-indicators':
                    this.addAlphaIndicators(roomGroup);
                    break;
                case 'beta-indicators':
                    this.addBetaIndicators(roomGroup);
                    break;
                case 'gamma-indicators':
                    this.addGammaIndicators(roomGroup);
                    break;
                case 'wire-cage':
                    this.addWireCage(roomGroup);
                    break;
                case 'three-dials':
                    this.addThreeDials(roomGroup);
                    break;
                case 'three-levers':
                    this.addThreeLevers(roomGroup);
                    break;
                case 'machine-with-sockets':
                    this.addMachineWithSockets(roomGroup);
                    break;
                case 'supply-shelves':
                    this.addSupplyShelves(roomGroup);
                    break;
                case 'damaged-shelving':
                    this.addDamagedShelving(roomGroup);
                    break;
                case 'sleeping-platforms':
                    this.addSleepingPlatforms(roomGroup);
                    break;
                case 'small-console':
                    this.addSmallConsole(roomGroup);
                    break;
                case 'cryogenic-units':
                    this.addCryogenicUnits(roomGroup);
                    break;
                case 'library-core':
                    this.addLibraryCore(roomGroup);
                    break;
            }
        });
    }

    addCentralColumn(roomGroup) {
        const columnGeometry = new THREE.CylinderGeometry(1, 1, 8);
        const columnMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            emissive: 0x001144
        });
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.position.y = 1;
        column.castShadow = true;
        roomGroup.add(column);

        // Add door on column
        const doorGeometry = new THREE.BoxGeometry(0.8, 2, 0.1);
        const doorMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            emissive: 0x002200
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(1.1, 0, 0);
        roomGroup.add(door);
    }

    addElectricalWiring(roomGroup) {
        // Create glowing wire paths around the room
        const wirePositions = [
            [-4, 2, -4], [4, 2, -4], [4, 2, 4], [-4, 2, 4], [-4, 2, -4]
        ];
        
        const wireGeometry = new THREE.BufferGeometry().setFromPoints(
            wirePositions.map(pos => new THREE.Vector3(...pos))
        );
        const wireMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            linewidth: 3
        });
        const wires = new THREE.Line(wireGeometry, wireMaterial);
        roomGroup.add(wires);

        // Add glowing particles along wires
        const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff
        });

        for (let i = 0; i < 20; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * 8,
                1 + Math.random() * 4,
                (Math.random() - 0.5) * 8
            );
            roomGroup.add(particle);
        }
    }

    addMonitors(roomGroup) {
        // Create wall-mounted monitors
        for (let i = 0; i < 6; i++) {
            const monitorGeometry = new THREE.BoxGeometry(2, 1.5, 0.2);
            const monitorMaterial = new THREE.MeshPhongMaterial({
                color: 0x222222,
                emissive: 0x004400
            });
            const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
            
            const angle = (i / 6) * Math.PI * 2;
            monitor.position.set(
                Math.cos(angle) * 4.5,
                1.5,
                Math.sin(angle) * 4.5
            );
            monitor.lookAt(0, 1.5, 0);
            roomGroup.add(monitor);

            // Add screen glow
            const screenGeometry = new THREE.PlaneGeometry(1.8, 1.3);
            const screenMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.8
            });
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.copy(monitor.position);
            screen.position.add(monitor.getWorldDirection(new THREE.Vector3()).multiplyScalar(-0.15));
            screen.lookAt(0, 1.5, 0);
            roomGroup.add(screen);
        }
    }

    addConveyorBelt(roomGroup) {
        // Create the main walkway/conveyor belt platform
        const walkwayGeometry = new THREE.BoxGeometry(12, 0.8, 3);
        const walkwayMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            emissive: 0x111111
        });
        const walkway = new THREE.Mesh(walkwayGeometry, walkwayMaterial);
        walkway.position.set(0, -1.5, 0);
        walkway.castShadow = true;
        roomGroup.add(walkway);

        // Add "wheels" along the sides as described in ZIL
        for (let i = 0; i < 8; i++) {
            const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2);
            const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
            
            // Left side wheels
            const leftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            leftWheel.position.set(-5 + i * 1.4, -1.8, -1.2);
            leftWheel.rotation.x = Math.PI / 2;
            roomGroup.add(leftWheel);
            
            // Right side wheels
            const rightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            rightWheel.position.set(-5 + i * 1.4, -1.8, 1.2);
            rightWheel.rotation.x = Math.PI / 2;
            roomGroup.add(rightWheel);
        }

        // Add "odd protuberances" - various mechanical elements
        for (let i = 0; i < 10; i++) {
            const protuberanceTypes = [
                // Cylindrical protuberances
                () => {
                    const geom = new THREE.CylinderGeometry(0.1, 0.15, 0.4);
                    return new THREE.Mesh(geom, new THREE.MeshPhongMaterial({ color: 0x777777 }));
                },
                // Box-like mechanical elements
                () => {
                    const geom = new THREE.BoxGeometry(0.2, 0.3, 0.2);
                    return new THREE.Mesh(geom, new THREE.MeshPhongMaterial({ color: 0x555555 }));
                },
                // Spherical elements
                () => {
                    const geom = new THREE.SphereGeometry(0.1);
                    return new THREE.Mesh(geom, new THREE.MeshPhongMaterial({ color: 0x888888 }));
                }
            ];
            
            const protuberance = protuberanceTypes[Math.floor(Math.random() * 3)]();
            protuberance.position.set(
                (Math.random() - 0.5) * 10,
                -1.0 + Math.random() * 0.3,
                (Math.random() - 0.5) * 2.5
            );
            protuberance.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            roomGroup.add(protuberance);
        }

        // Add the "small step at the base" mentioned in the description
        const stepGeometry = new THREE.BoxGeometry(12.5, 0.3, 0.6);
        const stepMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
        const step = new THREE.Mesh(stepGeometry, stepMaterial);
        step.position.set(0, -2.2, 0);
        roomGroup.add(step);

        // Add support structure underneath
        for (let i = 0; i < 4; i++) {
            const supportGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.5);
            const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const support = new THREE.Mesh(supportGeometry, supportMaterial);
            support.position.set((i - 1.5) * 3, -2.8, 0);
            roomGroup.add(support);
        }

        // Add mechanical gears and cogs (visible complexity)
        for (let i = 0; i < 3; i++) {
            const gearGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1);
            const gearMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x666666,
                emissive: 0x001100
            });
            const gear = new THREE.Mesh(gearGeometry, gearMaterial);
            gear.position.set((i - 1) * 4, -1.4, -1.8);
            gear.rotation.x = Math.PI / 2;
            roomGroup.add(gear);

            // Add gear teeth
            for (let tooth = 0; tooth < 8; tooth++) {
                const toothGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.05);
                const toothMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 });
                const toothMesh = new THREE.Mesh(toothGeometry, toothMaterial);
                const angle = (tooth / 8) * Math.PI * 2;
                toothMesh.position.set(
                    (i - 1) * 4 + Math.cos(angle) * 0.45,
                    -1.4,
                    -1.8 + Math.sin(angle) * 0.45
                );
                roomGroup.add(toothMesh);
            }
        }
    }

    addDataPedestal(roomGroup) {
        const pedestalGeometry = new THREE.CylinderGeometry(0.8, 1.2, 3);
        const pedestalMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            emissive: 0x001144
        });
        const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        pedestal.position.y = -1.5;
        pedestal.castShadow = true;
        roomGroup.add(pedestal);

        // Add holographic display above pedestal
        const holoGeometry = new THREE.RingGeometry(0.5, 1.5, 16);
        const holoMaterial = new THREE.MeshBasicMaterial({
            color: 0x0088ff,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const holo = new THREE.Mesh(holoGeometry, holoMaterial);
        holo.position.y = 1;
        holo.rotation.x = Math.PI / 2;
        roomGroup.add(holo);
    }

    addElectricalEffects(roomGroup) {
        // Add floating energy orbs
        for (let i = 0; i < 8; i++) {
            const orbGeometry = new THREE.SphereGeometry(0.1, 12, 12);
            const orbMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.7
            });
            const orb = new THREE.Mesh(orbGeometry, orbMaterial);
            orb.position.set(
                (Math.random() - 0.5) * 6,
                Math.random() * 4,
                (Math.random() - 0.5) * 6
            );
            
            // Add to animation queue for floating motion
            orb.userData = { 
                originalY: orb.position.y,
                speed: 0.02 + Math.random() * 0.02
            };
            roomGroup.add(orb);
        }
    }

    addControlPanels(roomGroup) {
        // Create control panels on walls
        for (let i = 0; i < 4; i++) {
            const panelGeometry = new THREE.BoxGeometry(3, 2, 0.3);
            const panelMaterial = new THREE.MeshPhongMaterial({
                color: 0x333333,
                emissive: 0x001122
            });
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            
            const angle = (i / 4) * Math.PI * 2;
            panel.position.set(
                Math.cos(angle) * 4,
                0,
                Math.sin(angle) * 4
            );
            panel.lookAt(0, 0, 0);
            roomGroup.add(panel);

            // Add control indicators
            for (let j = 0; j < 6; j++) {
                const indicatorGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const indicatorMaterial = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.5 ? 0x00ff00 : 0xff0000
                });
                const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
                indicator.position.copy(panel.position);
                indicator.position.add(new THREE.Vector3(
                    (j % 3 - 1) * 0.5,
                    (Math.floor(j / 3) - 0.5) * 0.5,
                    -0.2
                ));
                roomGroup.add(indicator);
            }
        }
    }

    addTransportTube(roomGroup) {
        // Create the transport tube
        const tubeGeometry = new THREE.CylinderGeometry(1.5, 1.5, 8, 16);
        const tubeMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.6
        });
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.rotation.z = Math.PI / 2;
        tube.position.y = 2;
        roomGroup.add(tube);

        // Add air flow effects
        for (let i = 0; i < 10; i++) {
            const flowGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const flowMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.7
            });
            const flow = new THREE.Mesh(flowGeometry, flowMaterial);
            flow.position.set(
                (Math.random() - 0.5) * 6,
                2,
                (Math.random() - 0.5) * 2
            );
            flow.userData = {
                originalX: flow.position.x,
                speed: 0.05 + Math.random() * 0.05
            };
            roomGroup.add(flow);
        }
    }

    addMassiveComputer(roomGroup) {
        // Create massive computer structure
        const computerGeometry = new THREE.BoxGeometry(8, 6, 8);
        const computerMaterial = new THREE.MeshPhongMaterial({
            color: 0x222222,
            emissive: 0x001144
        });
        const computer = new THREE.Mesh(computerGeometry, computerMaterial);
        computer.position.y = -1;
        computer.castShadow = true;
        roomGroup.add(computer);

        // Add processing indicators
        for (let i = 0; i < 20; i++) {
            const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({
                color: 0x0088ff
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(
                (Math.random() - 0.5) * 8,
                -1 + (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 8
            );
            light.userData = {
                speed: 0.02 + Math.random() * 0.03
            };
            roomGroup.add(light);
        }
    }

    addAcidMist(roomGroup) {
        // Create mist particles
        const mistGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const mistMaterial = new THREE.MeshBasicMaterial({
            color: 0x88ff44,
            transparent: true,
            opacity: 0.3
        });

        for (let i = 0; i < 30; i++) {
            const mist = new THREE.Mesh(mistGeometry, mistMaterial);
            mist.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 8,
                (Math.random() - 0.5) * 20
            );
            mist.userData = {
                originalY: mist.position.y,
                speed: 0.01 + Math.random() * 0.02
            };
            roomGroup.add(mist);
        }

        // Add hazard warning effect
        const warningLight = new THREE.PointLight(0xff4400, 2, 50);
        warningLight.position.set(0, 5, 0);
        roomGroup.add(warningLight);
    }

    addDebris(roomGroup) {
        // Add scattered debris on the floor
        for (let i = 0; i < 15; i++) {
            const debrisGeometry = new THREE.BoxGeometry(
                0.2 + Math.random() * 0.8,
                0.1 + Math.random() * 0.3,
                0.2 + Math.random() * 0.8
            );
            const debrisMaterial = new THREE.MeshPhongMaterial({
                color: 0x444444
            });
            const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
            debris.position.set(
                (Math.random() - 0.5) * 8,
                -2.8,
                (Math.random() - 0.5) * 8
            );
            debris.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            debris.castShadow = true;
            roomGroup.add(debris);
        }
    }

    addAlphaIndicators(roomGroup) {
        // Add large ALPHA text/sign
        const signGeometry = new THREE.BoxGeometry(4, 1, 0.2);
        const signMaterial = new THREE.MeshBasicMaterial({ color: 0x0066ff });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 2, -5);
        roomGroup.add(sign);

        // Add blue indicator lights
        for (let i = 0; i < 5; i++) {
            const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x0088ff });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set((i - 2) * 1.5, 3, -4.5);
            roomGroup.add(light);
        }
    }

    addBetaIndicators(roomGroup) {
        // Add large BETA text/sign
        const signGeometry = new THREE.BoxGeometry(4, 1, 0.2);
        const signMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 2, -5);
        roomGroup.add(sign);

        // Add green indicator lights
        for (let i = 0; i < 5; i++) {
            const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set((i - 2) * 1.5, 3, -4.5);
            roomGroup.add(light);
        }
    }

    addGammaIndicators(roomGroup) {
        // Add large GAMMA text/sign
        const signGeometry = new THREE.BoxGeometry(4, 1, 0.2);
        const signMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 2, -5);
        roomGroup.add(sign);

        // Add orange/red indicator lights
        for (let i = 0; i < 5; i++) {
            const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xff8800 });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set((i - 2) * 1.5, 3, -4.5);
            roomGroup.add(light);
        }
    }

    createRobot(robotType) {
        const robotGroup = new THREE.Group();
        robotGroup.name = robotType;

        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: this.getRobotColor(robotType),
            emissive: this.getRobotEmissive(robotType),
            shininess: 100
        });
        
        // Create robot-specific body and head shapes
        this.createRobotBody(robotGroup, robotType, bodyMaterial);

        // Add robot-specific features
        this.addRobotFeatures(robotGroup, robotType);

        // Add subtle glow effect
        const glowGeometry = new THREE.SphereGeometry(1, 16, 12);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.getRobotEmissive(robotType),
            transparent: true,
            opacity: 0.1
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.6;
        robotGroup.add(glow);

        return robotGroup;
    }

    createRobotBody(robotGroup, robotType, bodyMaterial) {
        switch (robotType) {
            case 'iris':
                // IRIS - Visual robot: Tall, sleek, camera-like design
                const irisBodyGeometry = new THREE.CylinderGeometry(0.25, 0.3, 1.5);
                const irisBody = new THREE.Mesh(irisBodyGeometry, bodyMaterial);
                irisBody.position.y = 0.75;
                irisBody.castShadow = true;
                robotGroup.add(irisBody);
                
                // Sleek dome head for visual sensors
                const irisHeadGeometry = new THREE.SphereGeometry(0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.7);
                const irisHead = new THREE.Mesh(irisHeadGeometry, bodyMaterial);
                irisHead.position.y = 1.6;
                irisHead.castShadow = true;
                robotGroup.add(irisHead);
                break;

            case 'waldo':
                // WALDO - Builder robot: Boxy, industrial, construction-like
                const waldoBodyGeometry = new THREE.BoxGeometry(0.7, 1.0, 0.6);
                const waldoBody = new THREE.Mesh(waldoBodyGeometry, bodyMaterial);
                waldoBody.position.y = 0.5;
                waldoBody.castShadow = true;
                robotGroup.add(waldoBody);
                
                // Boxy head with tool compartments
                const waldoHeadGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.4);
                const waldoHead = new THREE.Mesh(waldoHeadGeometry, bodyMaterial);
                waldoHead.position.y = 1.15;
                waldoHead.castShadow = true;
                robotGroup.add(waldoHead);
                
                // Add industrial shoulder blocks
                const shoulderGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
                const leftShoulder = new THREE.Mesh(shoulderGeometry, bodyMaterial);
                leftShoulder.position.set(-0.45, 0.9, 0);
                const rightShoulder = new THREE.Mesh(shoulderGeometry, bodyMaterial);
                rightShoulder.position.set(0.45, 0.9, 0);
                robotGroup.add(leftShoulder, rightShoulder);
                break;

            case 'sensa':
                // SENSA - Sensory robot: Multiple sensor pods, angular design
                const sensaBodyGeometry = new THREE.OctahedronGeometry(0.4);
                const sensaBody = new THREE.Mesh(sensaBodyGeometry, bodyMaterial);
                sensaBody.position.y = 0.6;
                sensaBody.scale.set(1, 1.5, 1);
                sensaBody.castShadow = true;
                robotGroup.add(sensaBody);
                
                // Multi-faceted sensor head
                const sensaHeadGeometry = new THREE.IcosahedronGeometry(0.22);
                const sensaHead = new THREE.Mesh(sensaHeadGeometry, bodyMaterial);
                sensaHead.position.y = 1.4;
                sensaHead.castShadow = true;
                robotGroup.add(sensaHead);
                break;

            case 'auda':
                // AUDA - Audio robot: Keep the current cylindrical shape (it works well)
                const audaBodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2);
                const audaBody = new THREE.Mesh(audaBodyGeometry, bodyMaterial);
                audaBody.position.y = 0.6;
                audaBody.castShadow = true;
                robotGroup.add(audaBody);
                
                const audaHeadGeometry = new THREE.SphereGeometry(0.2, 16, 12);
                const audaHead = new THREE.Mesh(audaHeadGeometry, bodyMaterial);
                audaHead.position.y = 1.4;
                audaHead.castShadow = true;
                robotGroup.add(audaHead);
                break;

            case 'poet':
                // POET - Diagnostic robot: Analytical, crystalline structure
                const poetBodyGeometry = new THREE.ConeGeometry(0.35, 1.3, 6);
                const poetBody = new THREE.Mesh(poetBodyGeometry, bodyMaterial);
                poetBody.position.y = 0.65;
                poetBody.castShadow = true;
                robotGroup.add(poetBody);
                
                // Faceted analytical head
                const poetHeadGeometry = new THREE.ConeGeometry(0.2, 0.3, 6);
                const poetHead = new THREE.Mesh(poetHeadGeometry, bodyMaterial);
                poetHead.position.y = 1.45;
                poetHead.castShadow = true;
                robotGroup.add(poetHead);
                break;

            case 'whiz':
                // WHIZ - Interface robot: Compact, tech-heavy, multiple modules
                const whizBodyGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.8);
                const whizBody = new THREE.Mesh(whizBodyGeometry, bodyMaterial);
                whizBody.position.y = 0.4;
                whizBody.castShadow = true;
                robotGroup.add(whizBody);
                
                // Tech module head
                const whizHeadGeometry = new THREE.BoxGeometry(0.3, 0.25, 0.3);
                const whizHead = new THREE.Mesh(whizHeadGeometry, bodyMaterial);
                whizHead.position.y = 0.925;
                whizHead.castShadow = true;
                robotGroup.add(whizHead);
                
                // Add interface modules around the body
                const moduleGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.08);
                for (let i = 0; i < 6; i++) {
                    const module = new THREE.Mesh(moduleGeometry, bodyMaterial);
                    const angle = (i / 6) * Math.PI * 2;
                    module.position.set(
                        Math.cos(angle) * 0.45,
                        0.4 + (Math.random() - 0.5) * 0.2,
                        Math.sin(angle) * 0.45
                    );
                    robotGroup.add(module);
                }
                break;

            default:
                // Fallback to basic cylindrical shape
                const defaultBodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2);
                const defaultBody = new THREE.Mesh(defaultBodyGeometry, bodyMaterial);
                defaultBody.position.y = 0.6;
                defaultBody.castShadow = true;
                robotGroup.add(defaultBody);
                
                const defaultHeadGeometry = new THREE.SphereGeometry(0.2, 16, 12);
                const defaultHead = new THREE.Mesh(defaultHeadGeometry, bodyMaterial);
                defaultHead.position.y = 1.4;
                defaultHead.castShadow = true;
                robotGroup.add(defaultHead);
                break;
        }
    }

    getRobotColor(robotType) {
        const colors = {
            iris: 0x4444ff,    // Blue for visual
            waldo: 0x44ff44,   // Green for builder
            sensa: 0xff4444,   // Red for sensory
            auda: 0xffff44,    // Yellow for audio
            poet: 0xff44ff,    // Magenta for diagnostic
            whiz: 0x44ffff     // Cyan for interface
        };
        return colors[robotType] || 0x888888;
    }

    getRobotEmissive(robotType) {
        const emissive = {
            iris: 0x001144,
            waldo: 0x001100,
            sensa: 0x110000,
            auda: 0x111100,
            poet: 0x110011,
            whiz: 0x001111
        };
        return emissive[robotType] || 0x111111;
    }

    addRobotFeatures(robotGroup, robotType) {
        switch (robotType) {
            case 'iris':
                // Visual sensors - eye-like protrusions
                const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
                const eyeMaterial = new THREE.MeshPhongMaterial({
                    color: 0x0088ff,
                    emissive: 0x0044ff
                });
                const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
                eye1.position.set(-0.1, 1.4, 0.15);
                const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
                eye2.position.set(0.1, 1.4, 0.15);
                robotGroup.add(eye1, eye2);
                break;

            case 'auda':
                // Large dish ears
                const dishGeometry = new THREE.ConeGeometry(0.3, 0.1, 12);
                const dishMaterial = new THREE.MeshPhongMaterial({ color: 0xcccc00 });
                const dish1 = new THREE.Mesh(dishGeometry, dishMaterial);
                dish1.position.set(-0.35, 1.4, 0);
                dish1.rotation.z = Math.PI / 2;
                const dish2 = new THREE.Mesh(dishGeometry, dishMaterial);
                dish2.position.set(0.35, 1.4, 0);
                dish2.rotation.z = -Math.PI / 2;
                robotGroup.add(dish1, dish2);
                break;

            case 'waldo':
                // Builder arms/extensions
                const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8);
                const armMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
                for (let i = 0; i < 4; i++) {
                    const arm = new THREE.Mesh(armGeometry, armMaterial);
                    const angle = (i / 4) * Math.PI * 2;
                    arm.position.set(
                        Math.cos(angle) * 0.5,
                        0.6,
                        Math.sin(angle) * 0.5
                    );
                    arm.rotation.z = angle;
                    robotGroup.add(arm);
                }
                break;
        }
    }

    loadInitialRoom() {
        this.switchRobot('iris');
    }

    switchRobot(robotType) {
        this.currentRobot = robotType;
        const roomId = this.robotLocations[robotType];
        
        console.log(`3D System: Switching to ${robotType.toUpperCase()} in room ${roomId}`);
        
        // Validate room exists
        if (!roomId || !this.roomDefinitions[roomId]) {
            console.warn(`3D System: Unknown room '${roomId}' for robot ${robotType}, using fallback`);
            // Use a fallback room if the tracked location is invalid
            const fallbackRoom = this.getDefaultRoomForRobot(robotType);
            this.robotLocations[robotType] = fallbackRoom;
            return this.switchRobot(robotType); // Retry with fallback
        }

        // Remove current room
        if (this.currentRoom) {
            console.log(`🗑️  Removing current room: ${this.currentRoom.name}`);
            this.scene.remove(this.currentRoom);
        } else {
            console.log(`⚠️  No current room to remove`);
        }

        // Create and add new room based on robot's current location
        console.log(`🏗️  Creating new room: ${roomId}`);
        this.currentRoom = this.createRoom(roomId);
        if (this.currentRoom) {
            this.currentRoom.name = roomId; // Ensure the room has a name for debugging
            this.scene.add(this.currentRoom);
            console.log(`✅ 3D System: Created and added room ${roomId} for ${robotType}`);
            console.log(`📊 Scene now contains ${this.scene.children.length} objects`);
        } else {
            console.error(`❌ Failed to create room ${roomId}!`);
        }

        // Remove all existing robots from scene
        this.removeAllRobots();

        // Add ALL robots that are in this room to the scene
        this.addRobotsInCurrentRoom();
        
        console.log(`📊 Final scene contains ${this.scene.children.length} objects`);

        // Update robot info display with current location
        this.updateRobotInfo(robotType, roomId);

        // Reset camera position for better view
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
        
        // Update minimap to reflect current location
        try {
            if (this.updateMinimap) {
                this.updateMinimap();
            }
        } catch (error) {
            console.warn('⚠️ Error updating minimap:', error);
        }
        
        console.log(`3D System: Successfully switched to ${robotType} in ${this.roomDefinitions[roomId].name}`);
        console.log(`🎨 Room should now be: ${this.roomDefinitions[roomId].name} (${roomId}) with color ${this.roomDefinitions[roomId].color.toString(16)}`);
    }

    getDefaultRoomForRobot(robotType) {
        // Fallback to starting locations if current location is invalid
        const defaultLocations = {
            iris: 'weather-banks',
            waldo: 'repair3', 
            sensa: 'cpu-room',
            auda: 'entry-area',
            poet: 'cpu-room',
            whiz: 'periph-3'
        };
        return defaultLocations[robotType] || 'cpu-room';
    }

    updateRobotInfo(robotType, roomId) {
        const robotInfo = document.getElementById('robotInfo');
        const roomDef = this.roomDefinitions[roomId];
        
        const robotNames = {
            iris: 'IRIS (Visual)',
            waldo: 'WALDO (Builder)', 
            sensa: 'SENSA (Sensory)',
            auda: 'AUDA (Audio)',
            poet: 'POET (Diagnostic)',
            whiz: 'WHIZ (Interface)'
        };

        const robotStatuses = {
            iris: 'Needs Repair - Visual systems offline',
            waldo: 'Operational - Ready for construction tasks',
            sensa: 'Operational - Monitoring energy flows',
            auda: 'Operational - Audio systems active',
            poet: 'Operational - Running diagnostics',
            whiz: 'Operational - CLC interface ready'
        };

        if (robotInfo) {
            robotInfo.innerHTML = `
                <strong>Current Robot:</strong> ${robotNames[robotType]}<br>
                <strong>Location:</strong> ${roomDef ? roomDef.name : 'Unknown'}<br>
                <strong>Status:</strong> ${robotStatuses[robotType]}
            `;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update controls
        this.controls.update();

        // Animate floating orbs and particles
        this.scene.traverse((object) => {
            if (object.userData.speed) {
                object.position.y = object.userData.originalY + 
                    Math.sin(Date.now() * object.userData.speed) * 0.5;
            }
        });

        // Rotate any holographic displays
        this.scene.traverse((object) => {
            if (object.material && object.material.transparent && object.material.opacity < 0.5) {
                if (object.geometry.type === 'RingGeometry') {
                    object.rotation.z += 0.01;
                }
            }
        });

        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const container = document.getElementById('threejs-container');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    initMinimap() {
        this.minimapCanvas = document.getElementById('minimapCanvas');
        if (!this.minimapCanvas) {
            console.warn('⚠️ Minimap canvas not found');
            return;
        }
        
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        if (!this.minimapCtx) {
            console.warn('⚠️ Could not get 2D context for minimap');
            return;
        }
        
        // Set canvas size
        const rect = this.minimapCanvas.getBoundingClientRect();
        this.minimapCanvas.width = rect.width * window.devicePixelRatio;
        this.minimapCanvas.height = rect.height * window.devicePixelRatio;
        this.minimapCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Minimap layout - coordinates for each room (x, y in grid units)
        this.minimapLayout = {
            // Central area
            'cpu-room': { x: 5, y: 5, connections: ['weather-banks', 'servo-systems', 'rtd-banks', 'corridor-1'] },
            'weather-banks': { x: 3, y: 5, connections: ['cpu-room', 'supplies-north', 'supplies-south'] },
            'servo-systems': { x: 7, y: 5, connections: ['cpu-room'] },
            'rtd-banks': { x: 5, y: 7, connections: ['cpu-room'] },
            
            // Supply rooms
            'supplies-north': { x: 1, y: 5, connections: ['weather-banks', 'supplies-mid'] },
            'supplies-mid': { x: 1, y: 6, connections: ['supplies-north', 'supplies-south'] },
            'supplies-south': { x: 2, y: 7, connections: ['supplies-mid', 'weather-banks'] },
            
            // Corridors
            'corridor-1': { x: 6, y: 3, connections: ['cpu-room', 'corridor-2'] },
            'corridor-2': { x: 8, y: 2, connections: ['corridor-1', 'hallway-junction'] },
            'corridor-3': { x: 10, y: 4, connections: ['hallway-junction', 'corridor-4', 'robot-passage'] },
            'corridor-4': { x: 12, y: 4, connections: ['corridor-3', 'ne-passage1', 'acidmist'] },
            
            // Hallway system
            'hallway-junction': { x: 9, y: 3, connections: ['corridor-2', 'corridor-3', 'outside-clc', 'human-entry'] },
            'outside-clc': { x: 9, y: 5, connections: ['hallway-junction', 'periph-1'] },
            'human-entry': { x: 9, y: 1, connections: ['hallway-junction', 'hall-stop3'] },
            
            // Human areas
            'hall-stop1': { x: 7, y: 0, connections: ['north-entry', 'hall-stop2'] },
            'hall-stop2': { x: 8, y: 0, connections: ['hall-stop1', 'hall-stop3'] },
            'hall-stop3': { x: 10, y: 0, connections: ['hall-stop2', 'human-entry', 'hall-stop4'] },
            'hall-stop4': { x: 11, y: 0, connections: ['hall-stop3', 'hall-stop5'] },
            'hall-stop5': { x: 12, y: 0, connections: ['hall-stop4', 'hall-t'] },
            
            // Entry areas
            'north-entry': { x: 6, y: 0, connections: ['hall-stop1', 'sterile-area', 'dead-end-1'] },
            'dead-end-1': { x: 5, y: 0, connections: ['north-entry'] },
            'sterile-area': { x: 6, y: -1, connections: ['north-entry', 'decon-chamber'] },
            'decon-chamber': { x: 7, y: -1, connections: ['sterile-area', 'entry-area'] },
            'entry-area': { x: 8, y: -1, connections: ['decon-chamber', 'tool-area'] },
            'tool-area': { x: 9, y: -1, connections: ['entry-area', 'rec-area'] },
            'rec-area': { x: 10, y: -1, connections: ['tool-area', 'sleep-chamber'] },
            'sleep-chamber': { x: 11, y: -1, connections: ['rec-area'] },
            
            // CLC area
            'periph-1': { x: 9, y: 6, connections: ['outside-clc', 'periph-2', 'periph-4', 'clc-core'] },
            'periph-2': { x: 10, y: 6, connections: ['periph-1', 'periph-3', 'clc-core'] },
            'periph-3': { x: 10, y: 7, connections: ['periph-2', 'periph-4', 'clc-core'] },
            'periph-4': { x: 9, y: 7, connections: ['periph-1', 'periph-3', 'clc-core'] },
            'clc-core': { x: 9.5, y: 6.5, connections: ['periph-1', 'periph-2', 'periph-3', 'periph-4'] },
            
            // Robot repair area
            'robot-passage': { x: 11, y: 5, connections: ['corridor-3', 'robot-z'] },
            'robot-z': { x: 12, y: 6, connections: ['robot-passage', 'repair1'] },
            'repair1': { x: 12, y: 7, connections: ['robot-z', 'repair2'] },
            'repair2': { x: 12, y: 8, connections: ['repair1', 'repair3'] },
            'repair3': { x: 12, y: 9, connections: ['repair2'] },
            
            // Skywalks
            'ne-passage1': { x: 13, y: 3, connections: ['corridor-4', 'ne-passage2'] },
            'ne-passage2': { x: 14, y: 2, connections: ['ne-passage1', 'sky1'] },
            'sky1': { x: 15, y: 2, connections: ['ne-passage2', 'sky2', 'weather'] },
            'sky2': { x: 16, y: 2, connections: ['sky1', 'sky3', 'hydro'] },
            'sky3': { x: 17, y: 2, connections: ['sky2', 'rtd'] },
            
            // Control areas
            'weather': { x: 15, y: 1, connections: ['sky1'] },
            'hydro': { x: 16, y: 1, connections: ['sky2'] },
            'rtd': { x: 17, y: 1, connections: ['sky3'] },
            
            // Eastern areas
            'acidmist': { x: 14, y: 4, connections: ['corridor-4', 'midmist'] },
            'midmist': { x: 15, y: 4, connections: ['acidmist', 'fc1', 'fc2', 'fc3'] },
            'fc1': { x: 15, y: 3, connections: ['midmist', 'tube2'] },
            'fc2': { x: 15, y: 5, connections: ['midmist', 'tube1', 'tube2'] },
            'fc3': { x: 15, y: 6, connections: ['midmist', 'tube1'] },
            'tube1': { x: 14, y: 5.5, connections: ['fc2', 'fc3'] },
            'tube2': { x: 14, y: 3.5, connections: ['fc1', 'fc2'] },
            
            // Biology area
            'bio-int': { x: 13, y: 8, connections: ['cryounits', 'bio-lab', 'car-area'] },
            'cryounits': { x: 13, y: 7, connections: ['bio-int'] },
            'bio-lab': { x: 12, y: 8, connections: ['bio-int'] },
            'car-area': { x: 13, y: 9, connections: ['bio-int'] },
            
            // Library areas
            'hall-t': { x: 13, y: 0, connections: ['hall-stop5', 'fcmaint', 'lower-core'] },
            'fcmaint': { x: 14, y: 0, connections: ['hall-t'] },
            'lower-core': { x: 13, y: 1, connections: ['hall-t', 'inner-core', 'hall-end'] },
            'inner-core': { x: 12, y: 1, connections: ['lower-core'] },
            'hall-end': { x: 13, y: 2, connections: ['lower-core'] }
        };
        
        this.drawMinimap();
    }

    drawMinimap() {
        if (!this.minimapCtx || !this.minimapCanvas || !this.minimapLayout) {
            console.warn('⚠️ Minimap not properly initialized');
            return;
        }
        
        const canvas = this.minimapCanvas;
        const ctx = this.minimapCtx;
        const layout = this.minimapLayout;
        
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
        
        // Calculate scale and offset
        const padding = 20;
        const canvasWidth = canvas.width / window.devicePixelRatio - padding * 2;
        const canvasHeight = canvas.height / window.devicePixelRatio - padding * 2;
        
        // Find bounds of the layout
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const room of Object.values(layout)) {
            minX = Math.min(minX, room.x);
            maxX = Math.max(maxX, room.x);
            minY = Math.min(minY, room.y);
            maxY = Math.max(maxY, room.y);
        }
        
        const scaleX = canvasWidth / (maxX - minX);
        const scaleY = canvasHeight / (maxY - minY);
        const scale = Math.min(scaleX, scaleY) * 0.8; // Leave some margin
        
        const offsetX = padding + (canvasWidth - (maxX - minX) * scale) / 2;
        const offsetY = padding + (canvasHeight - (maxY - minY) * scale) / 2;
        
        // Draw connections first (so they appear behind rooms)
        ctx.strokeStyle = '#003300';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (const [roomId, room] of Object.entries(layout)) {
            const x1 = offsetX + (room.x - minX) * scale;
            const y1 = offsetY + (room.y - minY) * scale;
            
            for (const connectedId of room.connections) {
                if (layout[connectedId] && connectedId > roomId) { // Avoid duplicate lines
                    const connectedRoom = layout[connectedId];
                    const x2 = offsetX + (connectedRoom.x - minX) * scale;
                    const y2 = offsetY + (connectedRoom.y - minY) * scale;
                    
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                }
            }
        }
        ctx.stroke();
        
        // Draw rooms
        for (const [roomId, room] of Object.entries(layout)) {
            const x = offsetX + (room.x - minX) * scale;
            const y = offsetY + (room.y - minY) * scale;
            
            // Room color based on type
            let fillColor = '#333333';
            let strokeColor = '#666666';
            
            if (roomId === this.currentRoom?.name) {
                fillColor = '#ffff00'; // Current room in yellow
                strokeColor = '#ffaa00';
            } else if (roomId.includes('repair')) {
                fillColor = '#4444aa';
                strokeColor = '#6666cc';
            } else if (roomId.includes('supply')) {
                fillColor = '#aa4444';
                strokeColor = '#cc6666';
            } else if (roomId.includes('corridor') || roomId.includes('hallway') || roomId.includes('passage')) {
                fillColor = '#444444';
                strokeColor = '#888888';
            } else if (roomId.includes('periph') || roomId === 'clc-core') {
                fillColor = '#aa44aa';
                strokeColor = '#cc66cc';
            }
            
            // Draw room
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        
        // Draw robot positions
        for (const [robot, locationId] of Object.entries(this.robotLocations)) {
            if (layout[locationId]) {
                const room = layout[locationId];
                const x = offsetX + (room.x - minX) * scale;
                const y = offsetY + (room.y - minY) * scale;
                
                // Robot colors
                const robotColors = {
                    iris: '#00ffff',
                    waldo: '#ffaa00',
                    sensa: '#ff00ff',
                    auda: '#00ff00',
                    poet: '#ffffff',
                    whiz: '#ff0000'
                };
                
                ctx.fillStyle = robotColors[robot] || '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Add robot initial
                ctx.fillStyle = '#000000';
                ctx.font = '8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(robot[0].toUpperCase(), x, y + 2);
            }
        }
        
        // Store scale info for future use
        this.minimapScale = { scale, offsetX, offsetY, minX, minY };
    }

    updateMinimap() {
        // Redraw minimap when robot positions change
        if (this.minimapCtx && this.minimapCanvas) {
            this.drawMinimap();
        }
    }

    createCorridorRoom(roomDef) {
        const corridorGroup = new THREE.Group();
        corridorGroup.name = roomDef.name || 'corridor';

        // Determine corridor orientation and features based on name and features
        const isSloped = roomDef.features?.includes('sloped-floor');
        const isElevated = roomDef.features?.includes('elevated-passage') || roomDef.features?.includes('elevated-walkway');
        const isTransportTube = roomDef.features?.includes('transport-tube');
        const isBending = roomDef.name.toLowerCase().includes('bend');
        const isJunction = roomDef.name.toLowerCase().includes('junction');
        
        // Base dimensions - make corridors longer and more realistic
        let length = 20;
        let width = 4;
        let height = 6;
        
        // Adjust dimensions based on corridor type
        if (isElevated || isTransportTube) {
            width = 3;
            height = 4;
        }
        if (isBending) {
            length = 15; // Shorter for bends
        }

        // Create floor
        const floorGeometry = new THREE.PlaneGeometry(length, width);
        const floorMaterial = new THREE.MeshPhongMaterial({
            color: roomDef.color,
            side: THREE.DoubleSide
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        
        if (isSloped) {
            // Add slope to floor
            floor.rotation.z = Math.PI * 0.05; // 5% grade
        }
        
        corridorGroup.add(floor);

        // Create walls
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(roomDef.color).multiplyScalar(0.8), // Darker walls
        });

        // Left wall (along the length of the corridor)
        const leftWallGeometry = new THREE.PlaneGeometry(length, height);
        const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
        leftWall.position.set(0, height/2, -width/2);
        // No rotation needed - wall faces inward by default
        corridorGroup.add(leftWall);

        // Right wall (along the length of the corridor)
        const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
        rightWall.position.set(0, height/2, width/2);
        rightWall.rotation.y = Math.PI; // Face inward
        corridorGroup.add(rightWall);

        // Create ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(length, width);
        const ceilingMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(roomDef.color).multiplyScalar(0.6), // Even darker ceiling
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.y = height;
        ceiling.rotation.x = Math.PI / 2;
        corridorGroup.add(ceiling);

        // Add end walls for enclosed feeling (these span the width of the corridor)
        // Front end wall (with opening) - facing down the corridor
        const frontEndWall = this.createEndWallWithOpening(width, height, wallMaterial);
        frontEndWall.position.set(-length/2, height/2, 0);
        frontEndWall.rotation.y = Math.PI / 2; // Rotate to face along corridor axis
        corridorGroup.add(frontEndWall);
        
        // Back end wall (with opening) - facing down the corridor
        const backEndWall = this.createEndWallWithOpening(width, height, wallMaterial);
        backEndWall.position.set(length/2, height/2, 0);
        backEndWall.rotation.y = -Math.PI / 2; // Rotate to face along corridor axis
        corridorGroup.add(backEndWall);

        // Add corridor-specific features
        if (isTransportTube) {
            this.addTransportTubeFeatures(corridorGroup, length, width, height);
        } else if (isElevated) {
            this.addElevatedWalkwayFeatures(corridorGroup, length, width);
        } else if (isBending) {
            this.addBendingCorridorFeatures(corridorGroup, length, width, height);
        }

        // Add lighting fixtures along the corridor
        this.addCorridorLighting(corridorGroup, length, height);

        // Add directional indicators based on corridor name
        this.addDirectionalIndicators(corridorGroup, roomDef.name, length, width, height);

        return corridorGroup;
    }

    createEndWallWithOpening(width, height, material) {
        const wallGroup = new THREE.Group();
        
        // Create wall sections around an opening
        const openingWidth = width * 0.6;
        const openingHeight = height * 0.8;
        
        // Top section above opening
        const topGeometry = new THREE.PlaneGeometry(width, height - openingHeight);
        const topWall = new THREE.Mesh(topGeometry, material);
        topWall.position.y = openingHeight/2;
        wallGroup.add(topWall);
        
        // Left section beside opening
        const sideGeometry = new THREE.PlaneGeometry((width - openingWidth)/2, openingHeight);
        const leftWall = new THREE.Mesh(sideGeometry, material);
        leftWall.position.set(-(openingWidth/2 + (width - openingWidth)/4), -(height - openingHeight)/2, 0);
        wallGroup.add(leftWall);
        
        // Right section beside opening
        const rightWall = new THREE.Mesh(sideGeometry, material);
        rightWall.position.set((openingWidth/2 + (width - openingWidth)/4), -(height - openingHeight)/2, 0);
        wallGroup.add(rightWall);
        
        return wallGroup;
    }

    addTransportTubeFeatures(corridorGroup, length, width, height) {
        // Add cylindrical support structure for transport tube
        const tubeGeometry = new THREE.CylinderGeometry(width/2 - 0.2, width/2 - 0.2, length, 16);
        const tubeMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.1
        });
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.rotation.z = Math.PI / 2;
        tube.position.y = height/2;
        corridorGroup.add(tube);

        // Add support rings
        for (let i = -length/2 + 3; i < length/2; i += 6) {
            const ringGeometry = new THREE.TorusGeometry(width/2, 0.1, 8, 16);
            const ringMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(i, height/2, 0);
            ring.rotation.y = Math.PI / 2;
            corridorGroup.add(ring);
        }
    }

    addElevatedWalkwayFeatures(corridorGroup, length, width) {
        // Add support pillars
        const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8);
        const pillarMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
        
        for (let i = -length/2 + 4; i < length/2; i += 8) {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(i, -4, 0);
            corridorGroup.add(pillar);
        }

        // Add railings
        const railingGeometry = new THREE.BoxGeometry(length, 0.1, 0.1);
        const railingMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        
        const leftRailing = new THREE.Mesh(railingGeometry, railingMaterial);
        leftRailing.position.set(0, 1, -width/2);
        corridorGroup.add(leftRailing);
        
        const rightRailing = new THREE.Mesh(railingGeometry, railingMaterial);
        rightRailing.position.set(0, 1, width/2);
        corridorGroup.add(rightRailing);
    }

    addBendingCorridorFeatures(corridorGroup, length, width, height) {
        // Add a subtle curve to the corridor by shifting sections
        const segmentCount = 5;
        const segmentLength = length / segmentCount;
        const bendAmount = 2;
        
        for (let i = 0; i < segmentCount; i++) {
            const offset = Math.sin((i / segmentCount) * Math.PI) * bendAmount;
            
            // Add pipe or conduit along the bend
            const pipeGeometry = new THREE.CylinderGeometry(0.1, 0.1, segmentLength);
            const pipeMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 });
            const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
            pipe.position.set(-length/2 + i * segmentLength + segmentLength/2, height - 0.5, offset);
            pipe.rotation.z = Math.PI / 2;
            corridorGroup.add(pipe);
        }
    }

    addCorridorLighting(corridorGroup, length, height) {
        // Add light fixtures along the corridor
        const lightSpacing = 6;
        const fixtureGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.5);
        const fixtureMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xaaaaaa,
            emissive: 0x222222
        });
        
        for (let i = -length/2 + lightSpacing; i < length/2; i += lightSpacing) {
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.set(i, height - 0.3, 0);
            corridorGroup.add(fixture);
            
            // Add subtle point light
            const light = new THREE.PointLight(0xffffff, 0.3, 8);
            light.position.set(i, height - 0.5, 0);
            corridorGroup.add(light);
        }
    }

    addDirectionalIndicators(corridorGroup, roomName, length, width, height) {
        // Add directional arrows or signs based on corridor name
        const direction = this.getCorridorDirection(roomName);
        if (!direction) return;
        
        // Create arrow indicator
        const arrowGeometry = new THREE.ConeGeometry(0.3, 1, 8);
        const arrowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            emissive: 0x002200
        });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        
        // Position based on direction
        switch (direction) {
            case 'north':
                arrow.position.set(0, 1, -width/3);
                arrow.rotation.z = -Math.PI / 2;
                break;
            case 'south':
                arrow.position.set(0, 1, width/3);
                arrow.rotation.z = Math.PI / 2;
                break;
            case 'east':
                arrow.position.set(length/3, 1, 0);
                break;
            case 'west':
                arrow.position.set(-length/3, 1, 0);
                arrow.rotation.y = Math.PI;
                break;
        }
        
        corridorGroup.add(arrow);
        
        // Add text label
        this.addCorridorLabel(corridorGroup, direction.toUpperCase(), arrow.position);
    }

    getCorridorDirection(roomName) {
        const name = roomName.toLowerCase();
        if (name.includes('north')) return 'north';
        if (name.includes('south')) return 'south';
        if (name.includes('east')) return 'east';
        if (name.includes('west')) return 'west';
        if (name.includes('ne')) return 'north';
        if (name.includes('nw')) return 'north';
        if (name.includes('se')) return 'south';
        if (name.includes('sw')) return 'south';
        return null;
    }

    addCorridorLabel(corridorGroup, text, position) {
        // Create a simple text indicator using geometry
        const labelGeometry = new THREE.PlaneGeometry(1, 0.3);
        const labelMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00aa00,
            transparent: true,
            opacity: 0.8
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(position.x, position.y + 0.8, position.z);
        corridorGroup.add(label);
    }

    // New detailed room feature methods based on ZIL descriptions
    addThreeDials(roomGroup) {
        // Create a small console with three dials (Weather Control)
        const consoleGeometry = new THREE.BoxGeometry(2, 0.8, 1);
        const consoleMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
        const console = new THREE.Mesh(consoleGeometry, consoleMaterial);
        console.position.set(0, -1.5, 2);
        roomGroup.add(console);

        // Add three dials on the console
        for (let i = 0; i < 3; i++) {
            const dialBase = new THREE.CylinderGeometry(0.2, 0.2, 0.05);
            const dialMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const dial = new THREE.Mesh(dialBase, dialMaterial);
            dial.position.set((i - 1) * 0.6, -1.05, 2.4);
            roomGroup.add(dial);

            // Add dial indicator
            const pointerGeometry = new THREE.BoxGeometry(0.02, 0.15, 0.01);
            const pointerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            const pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
            pointer.position.set((i - 1) * 0.6, -0.95, 2.45);
            pointer.rotation.z = (Math.random() - 0.5) * Math.PI;
            roomGroup.add(pointer);
        }
    }

    addThreeLevers(roomGroup) {
        // Create a panel with three levers (Hydroponics Control)
        const panelGeometry = new THREE.BoxGeometry(1.5, 1, 0.2);
        const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(0, 0, 2);
        roomGroup.add(panel);

        // Add three levers
        for (let i = 0; i < 3; i++) {
            const leverBase = new THREE.CylinderGeometry(0.05, 0.05, 0.6);
            const leverMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
            const lever = new THREE.Mesh(leverBase, leverMaterial);
            lever.position.set((i - 1) * 0.4, 0.3, 2.15);
            lever.rotation.z = (Math.random() - 0.5) * 0.8; // Random lever positions
            roomGroup.add(lever);

            // Add lever handle
            const handleGeometry = new THREE.SphereGeometry(0.08);
            const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.position.copy(lever.position);
            handle.position.y += 0.35;
            roomGroup.add(handle);
        }
    }

    addMachineWithSockets(roomGroup) {
        // Create the main machine from Supply Room
        const machineGeometry = new THREE.BoxGeometry(1.5, 1.2, 0.8);
        const machineMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        const machine = new THREE.Mesh(machineGeometry, machineMaterial);
        machine.position.set(-2, -1.5, 0);
        roomGroup.add(machine);

        // Add orange button
        const buttonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05);
        const buttonMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff6600,
            emissive: 0x332200
        });
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.position.set(-1.2, -0.85, 0.45);
        roomGroup.add(button);

        // Add two sockets (red and yellow)
        const socketGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.1);
        
        // Red socket
        const redSocketMaterial = new THREE.MeshPhongMaterial({ color: 0x880000 });
        const redSocket = new THREE.Mesh(socketGeometry, redSocketMaterial);
        redSocket.position.set(-1.5, -0.85, 0.45);
        roomGroup.add(redSocket);

        // Yellow socket
        const yellowSocketMaterial = new THREE.MeshPhongMaterial({ color: 0x888800 });
        const yellowSocket = new THREE.Mesh(socketGeometry, yellowSocketMaterial);
        yellowSocket.position.set(-1.8, -0.85, 0.45);
        roomGroup.add(yellowSocket);

        // Add eight circles on front panel
        for (let i = 0; i < 8; i++) {
            const circleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02);
            const circleMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
            const circle = new THREE.Mesh(circleGeometry, circleMaterial);
            const x = -2.2 + (i % 4) * 0.15;
            const y = -1.2 + Math.floor(i / 4) * 0.15;
            circle.position.set(x, y, 0.45);
            roomGroup.add(circle);
        }
    }

    addSupplyShelves(roomGroup) {
        // Create wall-mounted shelves with supplies
        for (let wall = 0; wall < 4; wall++) {
            const angle = (wall / 4) * Math.PI * 2;
            const x = Math.cos(angle) * 4;
            const z = Math.sin(angle) * 4;
            
            // Create shelves
            for (let shelf = 0; shelf < 3; shelf++) {
                const shelfGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
                const shelfMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
                const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
                shelfMesh.position.set(x, shelf * 1.2 - 1, z);
                shelfMesh.lookAt(0, shelf * 1.2 - 1, 0);
                roomGroup.add(shelfMesh);

                // Add items on shelves
                for (let item = 0; item < 3; item++) {
                    const itemGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.2);
                    const itemMaterial = new THREE.MeshPhongMaterial({ 
                        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
                    });
                    const itemMesh = new THREE.Mesh(itemGeometry, itemMaterial);
                    itemMesh.position.copy(shelfMesh.position);
                    itemMesh.position.y += 0.15;
                    itemMesh.position.x += (item - 1) * 0.4;
                    roomGroup.add(itemMesh);
                }
            }
        }
    }

    addDamagedShelving(roomGroup) {
        // Create broken/fallen shelves with irregular patterns
        for (let i = 0; i < 6; i++) {
            const shelfGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.4);
            const shelfMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            
            // Random positions and rotations for damaged look
            shelf.position.set(
                (Math.random() - 0.5) * 6,
                Math.random() * 0.5 - 2,
                (Math.random() - 0.5) * 6
            );
            shelf.rotation.set(
                (Math.random() - 0.5) * 0.5,
                Math.random() * Math.PI * 2,
                (Math.random() - 0.5) * 1
            );
            roomGroup.add(shelf);
        }
    }

    addSleepingPlatforms(roomGroup) {
        // Create flat extensions jutting from walls (Sleep Chamber)
        for (let i = 0; i < 4; i++) {
            const platformGeometry = new THREE.BoxGeometry(2, 0.2, 0.8);
            const platformMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            
            const angle = (i / 4) * Math.PI * 2;
            platform.position.set(
                Math.cos(angle) * 3.5,
                0,
                Math.sin(angle) * 3.5
            );
            platform.lookAt(0, 0, 0);
            roomGroup.add(platform);

            // Add pillow/mattress
            const mattressGeometry = new THREE.BoxGeometry(1.8, 0.1, 0.6);
            const mattressMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
            mattress.position.copy(platform.position);
            mattress.position.y += 0.2;
            roomGroup.add(mattress);
        }
    }

    addSmallConsole(roomGroup) {
        // Generic small console for various control rooms
        const consoleGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.6);
        const consoleMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const console = new THREE.Mesh(consoleGeometry, consoleMaterial);
        console.position.set(0, -1.5, 1.8);
        roomGroup.add(console);

        // Add control surface
        const surfaceGeometry = new THREE.BoxGeometry(1, 0.05, 0.4);
        const surfaceMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        surface.position.set(0, -1.05, 1.9);
        roomGroup.add(surface);
    }

    addCryogenicUnits(roomGroup) {
        // Create large canisters similar to central column
        for (let i = 0; i < 6; i++) {
            const unitGeometry = new THREE.CylinderGeometry(0.8, 0.8, 4);
            const unitMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x6699cc,
                emissive: 0x001122
            });
            const unit = new THREE.Mesh(unitGeometry, unitMaterial);
            
            const angle = (i / 6) * Math.PI * 2;
            unit.position.set(
                Math.cos(angle) * 3,
                0,
                Math.sin(angle) * 3
            );
            roomGroup.add(unit);

            // Add frost effect
            const frostGeometry = new THREE.SphereGeometry(0.85, 16, 16);
            const frostMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xccffff,
                transparent: true,
                opacity: 0.3
            });
            const frost = new THREE.Mesh(frostGeometry, frostMaterial);
            frost.position.copy(unit.position);
            roomGroup.add(frost);
        }

        // Add control switch on wall
        const switchGeometry = new THREE.BoxGeometry(0.3, 0.6, 0.1);
        const switchMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const switchBox = new THREE.Mesh(switchGeometry, switchMaterial);
        switchBox.position.set(0, 0, 4);
        roomGroup.add(switchBox);
    }

    addLibraryCore(roomGroup) {
        // Create huge cylinder (CLC) extending out of range
        const coreGeometry = new THREE.CylinderGeometry(3, 3, 20);
        const coreMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2244aa,
            emissive: 0x001144
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 0;
        roomGroup.add(core);

        // Add interfacing device
        const interfaceGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
        const interfaceMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x666666,
            emissive: 0x002200
        });
        const interfaceDevice = new THREE.Mesh(interfaceGeometry, interfaceMaterial);
        interfaceDevice.position.set(0, -1.5, 3.5);
        roomGroup.add(interfaceDevice);

        // Add data flow effects around core
        for (let i = 0; i < 20; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.6
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            const angle = (i / 20) * Math.PI * 2;
            particle.position.set(
                Math.cos(angle) * 3.5,
                (Math.random() - 0.5) * 8,
                Math.sin(angle) * 3.5
            );
            particle.userData.speed = 0.002 + Math.random() * 0.002;
            particle.userData.originalY = particle.position.y;
            roomGroup.add(particle);
        }
    }

    addWireCage(roomGroup) {
        // Create a wire cage structure for Gamma Repair room - positioned in corner
        const cageWidth = 4;
        const cageHeight = 5;
        const cageDepth = 3;
        const wireThickness = 0.02;
        
        // Position cage in the back-right corner of the room
        const cageOffsetX = 4;
        const cageOffsetZ = 4;
        
        // Wire material - metallic appearance
        const wireMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x888888,
            emissive: 0x111111,
            shininess: 100
        });

        // Create cage frame - vertical corner posts
        const postGeometry = new THREE.CylinderGeometry(wireThickness * 2, wireThickness * 2, cageHeight);
        const corners = [
            [-cageWidth/2 + cageOffsetX, 0, -cageDepth/2 + cageOffsetZ],
            [cageWidth/2 + cageOffsetX, 0, -cageDepth/2 + cageOffsetZ],
            [-cageWidth/2 + cageOffsetX, 0, cageDepth/2 + cageOffsetZ],
            [cageWidth/2 + cageOffsetX, 0, cageDepth/2 + cageOffsetZ]
        ];
        
        corners.forEach(([x, y, z]) => {
            const post = new THREE.Mesh(postGeometry, wireMaterial);
            post.position.set(x, y + cageHeight/2 - 1, z);
            roomGroup.add(post);
        });

        // Create horizontal wire grid - walls
        const wireGeometry = new THREE.CylinderGeometry(wireThickness, wireThickness, 1);
        
        // Front and back walls
        for (let level = 0; level < 4; level++) {
            const y = level * 1.2 - 1;
            
            // Front wall horizontals
            for (let i = 0; i < 5; i++) {
                const wire = new THREE.Mesh(wireGeometry, wireMaterial);
                wire.position.set(-cageWidth/2 + i * (cageWidth/4) + cageOffsetX, y, -cageDepth/2 + cageOffsetZ);
                wire.rotation.z = Math.PI / 2;
                wire.scale.set(1, cageWidth/4, 1);
                roomGroup.add(wire);
            }
            
            // Back wall horizontals
            for (let i = 0; i < 5; i++) {
                const wire = new THREE.Mesh(wireGeometry, wireMaterial);
                wire.position.set(-cageWidth/2 + i * (cageWidth/4) + cageOffsetX, y, cageDepth/2 + cageOffsetZ);
                wire.rotation.z = Math.PI / 2;
                wire.scale.set(1, cageWidth/4, 1);
                roomGroup.add(wire);
            }
        }
        
        // Side walls
        for (let level = 0; level < 4; level++) {
            const y = level * 1.2 - 1;
            
            // Left wall horizontals
            for (let i = 0; i < 4; i++) {
                const wire = new THREE.Mesh(wireGeometry, wireMaterial);
                wire.position.set(-cageWidth/2 + cageOffsetX, y, -cageDepth/2 + i * (cageDepth/3) + cageOffsetZ);
                wire.rotation.x = Math.PI / 2;
                wire.scale.set(1, cageDepth/3, 1);
                roomGroup.add(wire);
            }
            
            // Right wall horizontals
            for (let i = 0; i < 4; i++) {
                const wire = new THREE.Mesh(wireGeometry, wireMaterial);
                wire.position.set(cageWidth/2 + cageOffsetX, y, -cageDepth/2 + i * (cageDepth/3) + cageOffsetZ);
                wire.rotation.x = Math.PI / 2;
                wire.scale.set(1, cageDepth/3, 1);
                roomGroup.add(wire);
            }
        }

        // Vertical wires
        for (let x = 0; x < 5; x++) {
            for (let z = 0; z < 4; z++) {
                // Skip corner posts (already created)
                if ((x === 0 || x === 4) && (z === 0 || z === 3)) continue;
                
                const wire = new THREE.Mesh(wireGeometry, wireMaterial);
                wire.position.set(
                    -cageWidth/2 + x * (cageWidth/4) + cageOffsetX,
                    cageHeight/2 - 1,
                    -cageDepth/2 + z * (cageDepth/3) + cageOffsetZ
                );
                wire.scale.set(1, cageHeight, 1);
                roomGroup.add(wire);
            }
        }

        // Add cage door frame (slightly ajar)
        const doorFrameGeometry = new THREE.BoxGeometry(wireThickness * 4, cageHeight * 0.8, wireThickness * 4);
        const doorFrame = new THREE.Mesh(doorFrameGeometry, wireMaterial);
        doorFrame.position.set(cageWidth/2 + 0.1 + cageOffsetX, cageHeight/2 - 1.5, 0 + cageOffsetZ);
        doorFrame.rotation.y = Math.PI * 0.15; // Slightly open
        roomGroup.add(doorFrame);

        // Add cage base/floor grid
        for (let x = 0; x < 5; x++) {
            const baseWire = new THREE.Mesh(wireGeometry, wireMaterial);
            baseWire.position.set(-cageWidth/2 + x * (cageWidth/4) + cageOffsetX, -1.8, 0 + cageOffsetZ);
            baseWire.rotation.x = Math.PI / 2;
            baseWire.scale.set(1, cageDepth, 1);
            roomGroup.add(baseWire);
        }
        
        for (let z = 0; z < 4; z++) {
            const baseWire = new THREE.Mesh(wireGeometry, wireMaterial);
            baseWire.position.set(0 + cageOffsetX, -1.8, -cageDepth/2 + z * (cageDepth/3) + cageOffsetZ);
            baseWire.rotation.z = Math.PI / 2;
            baseWire.scale.set(1, cageWidth, 1);
            roomGroup.add(baseWire);
        }

        // Add some electrical components inside the cage
        const componentGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.2);
        const componentMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        
        for (let i = 0; i < 3; i++) {
            const component = new THREE.Mesh(componentGeometry, componentMaterial);
            component.position.set(
                (Math.random() - 0.5) * (cageWidth - 0.5) + cageOffsetX,
                -1.5 + Math.random() * 0.5,
                (Math.random() - 0.5) * (cageDepth - 0.5) + cageOffsetZ
            );
            roomGroup.add(component);
        }

        // Add warning sign on the cage
        const signGeometry = new THREE.PlaneGeometry(0.8, 0.4);
        const signMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffff00,
            emissive: 0x221100
        });
        const warningSign = new THREE.Mesh(signGeometry, signMaterial);
        warningSign.position.set(cageWidth/2 + 0.05 + cageOffsetX, 1, 0 + cageOffsetZ);
        warningSign.rotation.y = -Math.PI / 2;
        roomGroup.add(warningSign);

        console.log('🔌 Added wire cage to Gamma Repair room');
    }

    removeAllRobots() {
        // Remove all robot objects from the scene
        const robotsToRemove = [];
        this.scene.traverse((child) => {
            if (child.name && ['iris', 'waldo', 'sensa', 'auda', 'poet', 'whiz'].includes(child.name)) {
                robotsToRemove.push(child);
            }
        });
        
        robotsToRemove.forEach(robot => {
            console.log(`🗑️  Removing robot: ${robot.name}`);
            this.scene.remove(robot);
        });
        
        console.log(`🧹 Removed ${robotsToRemove.length} robots from scene`);
    }

    addRobotsInCurrentRoom() {
        if (!this.currentRoom) {
            console.warn(`⚠️  No current room set, cannot add robots`);
            return;
        }

        // Find all robots in the current room
        const robotsInRoom = [];
        for (const [robot, location] of Object.entries(this.robotLocations)) {
            if (location === this.currentRoom.name) {
                robotsInRoom.push(robot);
            }
        }
        
        console.log(`🤖 Found ${robotsInRoom.length} robot(s) in ${this.roomDefinitions[this.currentRoom.name]?.name || this.currentRoom.name}:`, robotsInRoom);
        
        if (robotsInRoom.length === 0) {
            console.log(`🚫 No robots in current room`);
            return;
        }
        
        // Position robots without overlapping
        const robotPositions = this.calculateRobotPositions(robotsInRoom.length);
        
        robotsInRoom.forEach((robotType, index) => {
            console.log(`🤖 Adding robot: ${robotType.toUpperCase()} at position ${index + 1}/${robotsInRoom.length}`);
            const robot = this.createRobot(robotType);
            
            // Position robot using calculated positions
            const position = robotPositions[index];
            robot.position.set(position.x, position.y, position.z);
            
            // Add visual highlight for the currently selected robot
            if (robotType === this.currentRobot) {
                this.addRobotHighlight(robot);
                console.log(`✨ Highlighted current robot: ${robotType.toUpperCase()}`);
            }
            
            this.scene.add(robot);
            console.log(`✅ Added robot ${robotType.toUpperCase()} to scene at (${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})`);
        });
        
        // Update robot info to show multiple robots if applicable
        if (robotsInRoom.length > 1) {
            this.updateMultiRobotInfo(robotsInRoom);
        }
    }

    calculateRobotPositions(robotCount) {
        // Calculate positions for multiple robots to avoid overlapping
        // Adjust Y position based on current room type
        const floorY = this.getFloorHeight();
        const positions = [];
        
        if (robotCount === 1) {
            // Single robot in center-forward position
            positions.push({ x: 0, y: floorY, z: 2 });
        } else if (robotCount === 2) {
            // Two robots side by side
            positions.push({ x: -1.5, y: floorY, z: 2 });
            positions.push({ x: 1.5, y: floorY, z: 2 });
        } else if (robotCount === 3) {
            // Three robots in triangle formation
            positions.push({ x: 0, y: floorY, z: 3 });    // Front center
            positions.push({ x: -2, y: floorY, z: 1 });   // Back left
            positions.push({ x: 2, y: floorY, z: 1 });    // Back right
        } else if (robotCount === 4) {
            // Four robots in square formation
            positions.push({ x: -1, y: floorY, z: 2.5 }); // Front left
            positions.push({ x: 1, y: floorY, z: 2.5 });  // Front right
            positions.push({ x: -1, y: floorY, z: 1 });   // Back left
            positions.push({ x: 1, y: floorY, z: 1 });    // Back right
        } else if (robotCount === 5) {
            // Five robots with one in center
            positions.push({ x: 0, y: floorY, z: 2 });    // Center
            positions.push({ x: -2, y: floorY, z: 3 });   // Front left
            positions.push({ x: 2, y: floorY, z: 3 });    // Front right
            positions.push({ x: -2, y: floorY, z: 1 });   // Back left
            positions.push({ x: 2, y: floorY, z: 1 });    // Back right
        } else {
            // Six robots in two rows
            positions.push({ x: -2, y: floorY, z: 3 });   // Front left
            positions.push({ x: 0, y: floorY, z: 3 });    // Front center
            positions.push({ x: 2, y: floorY, z: 3 });    // Front right
            positions.push({ x: -2, y: floorY, z: 1 });   // Back left
            positions.push({ x: 0, y: floorY, z: 1 });    // Back center
            positions.push({ x: 2, y: floorY, z: 1 });    // Back right
        }
        
        return positions;
    }

    getFloorHeight() {
        // Determine the floor height based on current room type
        if (!this.currentRoom || !this.currentRoom.name) {
            return -2; // Default fallback
        }

        const roomDef = this.roomDefinitions[this.currentRoom.name];
        if (!roomDef) {
            return -2; // Default fallback
        }

        // Corridors have floor at y=0, other rooms may have different floor heights
        if (roomDef.type === 'corridor') {
            return 0.5; // Slightly above the floor plane
        }
        
        // For elevated passages, robots should be on the walkway
        if (roomDef.features?.includes('elevated-passage') || roomDef.features?.includes('elevated-walkway')) {
            return 0.5; // On the elevated walkway
        }
        
        // Default for other room types (spheres, rectangles, etc.)
        return -2;
    }

    addRobotHighlight(robotMesh) {
        // Add a subtle glow or outline to highlight the current robot
        const highlightGeometry = new THREE.RingGeometry(1.2, 1.4, 16);
        const highlightMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlight.rotation.x = -Math.PI / 2; // Lay flat on ground
        
        // Position highlight ring based on current floor height
        const floorY = this.getFloorHeight();
        highlight.position.set(0, floorY - 0.3, 0);  // Just below robot's feet
        highlight.name = 'highlight';  // Name for easy identification
        
        robotMesh.add(highlight);
        console.log(`✨ Added highlight ring to current robot at floor level ${floorY}`);
    }

    updateMultiRobotInfo(robotsInRoom) {
        // Update the robot info display to show multiple robots
        const robotNames = {
            iris: 'IRIS (Visual)',
            waldo: 'WALDO (Builder)', 
            sensa: 'SENSA (Sensory)',
            auda: 'AUDA (Audio)',
            poet: 'POET (Diagnostic)',
            whiz: 'WHIZ (Interface)'
        };

        const robotInfoDiv = document.getElementById('robotInfo');
        if (robotInfoDiv && robotsInRoom.length > 1) {
            const currentRobotName = robotNames[this.currentRobot] || this.currentRobot.toUpperCase();
            const otherRobots = robotsInRoom.filter(r => r !== this.currentRobot);
            const otherRobotNames = otherRobots.map(r => robotNames[r] || r.toUpperCase());
            
            robotInfoDiv.innerHTML = `
                <strong>Current Robot:</strong> ${currentRobotName}<br>
                <strong>Also in room:</strong> ${otherRobotNames.join(', ')}<br>
                <strong>Location:</strong> ${this.roomDefinitions[this.currentRoom.name]?.name || this.currentRoom.name}
            `;
            
            console.log(`📝 Updated multi-robot info: ${robotsInRoom.length} robots in room`);
        }
    }
}

// Initialize the 3D system when the page loads
let suspended3D;

document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the DOM to be fully ready
    setTimeout(() => {
        suspended3D = new Suspended3D();
        window.suspended3D = suspended3D; // Make it globally accessible
        console.log('Suspended 3D visualization initialized');
    }, 100);
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Suspended3D;
}