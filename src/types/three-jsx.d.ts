// Three.js JSX element declarations
import 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            // Three.js JSX elements
            mesh: any;
            planeGeometry: any;
            primitive: any;
            group: any;
            ambientLight: any;
            directionalLight: any;
            boxGeometry: any;
            sphereGeometry: any;
            cylinderGeometry: any;
            coneGeometry: any;
            torusGeometry: any;
        }
    }
}