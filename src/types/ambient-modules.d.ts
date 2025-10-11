// Minimal ambient type declarations used to reduce TypeScript noise in the editor
// These are intentionally permissive. For a robust dev setup, install proper
// @types packages (e.g., @types/react) and remove or shrink these declarations.

// Minimal React types
declare module 'react' {
    export type ReactNode = any
    export type ReactElement<P = any> = any
    export type FC<P = object> = (props: P & { children?: ReactNode }) => ReactElement
    export type ComponentType<P = object> = FC<P>
    export type CSSProperties = { [key: string]: string | number }

    export function useState<S = any>(initialState?: S | (() => S)): [S, (s: S | ((prev: S) => S)) => void]
    export function useRef<T = any>(initial?: T | null): { current: T | null }
    export function useCallback<T extends (...args: any[]) => any>(fn: T, deps?: any[]): T
    export function useEffect(fn: () => void | (() => void), deps?: any[]): void
    export function useContext<T = any>(context: any): T
    export function createContext<T = any>(defaultValue: T): { Provider: any; Consumer: any }
    export function useMemo<T = any>(fn: () => T, deps?: any[]): T
    export function useId(): string
    export function forwardRef<T = any, P = any>(render: (props: P, ref: any) => ReactElement): any

    // Common utility types
    export type ComponentProps<T> = any
    export type ComponentPropsWithoutRef<T> = any
    export type ComponentPropsWithRef<T> = any
    export type ElementRef<T> = any
    export type RefAttributes<T> = any

    export interface HTMLAttributes<T> {
        [key: string]: any
    }

    export type DragEvent<T = any> = any
    export type KeyboardEvent<T = any> = any

    export function createElement(tag: any, props?: any, ...children: any[]): any
    const React: any
    export default React
}

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any
    }
}

// Node.js Email library
declare module 'nodemailer' {
    export interface TransportOptions {
        host?: string;
        port?: number;
        secure?: boolean;
        auth?: {
            user: string;
            pass: string;
        };
        [key: string]: any;
    }

    export interface MailOptions {
        from?: string;
        to?: string | string[];
        cc?: string | string[];
        bcc?: string | string[];
        subject?: string;
        text?: string;
        html?: string;
        attachments?: any[];
        [key: string]: any;
    }

    export interface Transporter {
        sendMail(mailOptions: MailOptions): Promise<any>;
        verify(): Promise<boolean>;
        close(): void;
    }

    export function createTransport(options: TransportOptions): Transporter;
    const nodemailer: { createTransport: typeof createTransport };
    export default nodemailer;
}

declare module 'nodemailer/lib/smtp-transport' {
    export interface SMTPTransport {
        [key: string]: any;
    }
    export default SMTPTransport;
}

// React Native ecosystem
declare module 'react-native' {
    export interface ViewStyle {
        [key: string]: any;
    }

    export interface TextStyle {
        [key: string]: any;
    }

    export interface ImageStyle {
        [key: string]: any;
    }

    export interface StyleSheet {
        create<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(styles: T): T;
    }

    export const StyleSheet: StyleSheet;
    export const View: any;
    export const Text: any;
    export const Image: any;
    export const TouchableOpacity: any;
    export const ScrollView: any;
    export const SafeAreaView: any;
    export const StatusBar: any;
    export const Switch: any;
    export const Alert: any;
    export const Platform: any;
    export const Dimensions: any;
    export const Animated: any;
    export const MediaStream: any;
}

declare module 'react-native-safe-area-context' {
    export function useSafeAreaInsets(): { top: number; bottom: number; left: number; right: number };
    export const SafeAreaProvider: any;
}

declare module 'react-native-vector-icons/MaterialIcons' {
    const Icon: any;
    export default Icon;
}

declare module 'react-native-linear-gradient' {
    const LinearGradient: any;
    export default LinearGradient;
}

declare module '@react-native-async-storage/async-storage' {
    const AsyncStorage: {
        getItem(key: string): Promise<string | null>;
        setItem(key: string, value: string): Promise<void>;
        removeItem(key: string): Promise<void>;
        clear(): Promise<void>;
    };
    export default AsyncStorage;
}

declare module '@react-native-firebase/messaging' {
    export interface RemoteMessage {
        data?: { [key: string]: string };
        notification?: {
            title?: string;
            body?: string;
            [key: string]: any;
        };
        [key: string]: any;
    }

    export interface FirebaseMessaging {
        requestPermission(): Promise<any>;
        getToken(): Promise<string>;
        deleteToken(): Promise<void>;
        onMessage(handler: (message: RemoteMessage) => void): () => void;
        setBackgroundMessageHandler(handler: (message: RemoteMessage) => Promise<void>): void;
        onNotificationOpenedApp(handler: (message: RemoteMessage) => void): () => void;
        getInitialNotification(): Promise<RemoteMessage | null>;
        AuthorizationStatus: {
            AUTHORIZED: number;
            PROVISIONAL: number;
            DENIED: number;
        };
    }

    export default function messaging(): FirebaseMessaging;
}

declare module '@notifee/react-native' {
    export interface Notification {
        id?: string;
        title?: string;
        body?: string;
        data?: any;
        android?: any;
        ios?: any;
    }

    export enum AndroidImportance {
        HIGH = 4,
        DEFAULT = 3,
        LOW = 2,
        MIN = 1,
        NONE = 0
    }
    export const AndroidStyle: any;
    export const EventType: any;

    const notifee: {
        displayNotification(notification: Notification): Promise<void>;
        createChannel(channel: any): Promise<void>;
        cancelNotification(id: string): Promise<void>;
        cancelAllNotifications(): Promise<void>;
        createTriggerNotification(notification: Notification, trigger: any): Promise<void>;
        setBadgeCount(count: number): Promise<void>;
        getBadgeCount(): Promise<number>;
        onForegroundEvent(handler: (event: any) => void): () => void;
    };
    export default notifee;
}

// Mobile screen modules
declare module './src/store/store' {
    export const store: any;
    export const persistor: any;
}

declare module './src/i18n/i18n' {
    // Side-effect import
}

declare module './src/screens/SplashScreen' {
    const SplashScreen: React.ComponentType<any>;
    export default SplashScreen;
}

declare module './src/screens/LoginScreen' {
    const LoginScreen: React.ComponentType<any>;
    export default LoginScreen;
}

declare module './src/screens/HomeScreen' {
    const HomeScreen: React.ComponentType<any>;
    export default HomeScreen;
}

declare module './src/screens/ChatScreen' {
    const ChatScreen: React.ComponentType<any>;
    export default ChatScreen;
}

declare module './src/screens/ContactsScreen' {
    const ContactsScreen: React.ComponentType<any>;
    export default ContactsScreen;
}

declare module './src/screens/SettingsScreen' {
    const SettingsScreen: React.ComponentType<any>;
    export default SettingsScreen;
}

declare module './src/screens/ProfileScreen' {
    const ProfileScreen: React.ComponentType<any>;
    export default ProfileScreen;
}

declare module './src/screens/NotificationsScreen' {
    const NotificationsScreen: React.ComponentType<any>;
    export default NotificationsScreen;
}

declare module './src/screens/HistoryScreen' {
    const HistoryScreen: React.ComponentType<any>;
    export default HistoryScreen;
}

declare module './src/screens/AppointmentsScreen' {
    const AppointmentsScreen: React.ComponentType<any>;
    export default AppointmentsScreen;
}

declare module './src/screens/SupportScreen' {
    const SupportScreen: React.ComponentType<any>;
    export default SupportScreen;
}

declare module './src/screens/LanguageScreen' {
    const LanguageScreen: React.ComponentType<any>;
    export default LanguageScreen;
}

declare module './src/screens/PrivacyScreen' {
    const PrivacyScreen: React.ComponentType<any>;
    export default PrivacyScreen;
}

declare module './src/screens/AboutScreen' {
    const AboutScreen: React.ComponentType<any>;
    export default AboutScreen;
}

declare module '@react-navigation/native' {
    export const NavigationContainer: any;
}

declare module '@react-navigation/stack' {
    export function createStackNavigator<T = any>(): any;
}

declare module '@react-navigation/bottom-tabs' {
    export function createBottomTabNavigator<T = any>(): any;
}

declare module 'react-redux' {
    export const Provider: any;
    export function useSelector(selector: any): any;
    export function useDispatch(): any;
}

declare module 'redux-persist/integration/react' {
    export const PersistGate: any;
}

// TensorFlow.js
declare module '@tensorflow/tfjs' {
    export interface Tensor {
        dispose(): void;
        data(): Promise<Float32Array>;
    }

    export interface LayersModel {
        predict(input: Tensor): Tensor;
        getWeights(): Promise<any[]>;
        compile(config: any): void;
    }

    export function ready(): Promise<void>;
    export function tensor2d(data: number[][]): Tensor;
    export function loadLayersModel(url: string): Promise<LayersModel>;
    export function sequential(config: any): LayersModel;

    export const layers: any;
}

declare module '@tensorflow/tfjs-react-native' {
    // Side-effect import module
}

// Web3 and Blockchain
declare module 'web3' {
    class Web3 {
        constructor(provider: any);
        eth: {
            getBalance(address: string): Promise<string>;
            net: {
                getId(): Promise<number>;
            };
            getTransactionReceipt(hash: string): Promise<any>;
            getBlockNumber(): Promise<number>;
            Contract: new (abi: any[], address: string) => any;
        };
        utils: {
            fromWei(value: string, unit: string): string;
            toWei(value: string, unit: string): string;
        };
    }

    export default Web3;
}

declare module 'ethers' {
    export namespace providers {
        export class Provider {
            // Base provider class
        }

        export class Web3Provider extends Provider {
            constructor(provider: any);
        }
    }

    export const ethers: {
        providers: typeof providers;
        Contract: any;
        utils: any;
    };
}

// reactflow minimal typings
declare module 'reactflow' {
    import * as React from 'react'

    export type Node<T = any> = {
        id: string
        type?: string
        position?: { x: number; y: number }
        data?: T
    }

    export type Edge = {
        id: string
        source: string
        target: string
        sourceHandle?: string
        targetHandle?: string
        type?: string
    }

    export type Connection = {
        source?: string
        target?: string
        sourceHandle?: string
        targetHandle?: string
    }

    export type NodeProps<T = any> = { id: string; data: T; selected?: boolean }

    export type ReactFlowInstance = any

    export const addEdge: (...args: any[]) => any
    export const applyNodeChanges: (...args: any[]) => any
    export const applyEdgeChanges: (...args: any[]) => any
    export function useNodesState(initial?: any): [any, any, any]
    export function useEdgesState(initial?: any): [any, any, any]
    export type NodeChange = any
    export type EdgeChange = any
    export const Handle: any
    export const Position: any
    export const Controls: React.FC<any>
    export const MiniMap: React.FC<any>
    export const Background: React.FC<any>

    const ReactFlow: React.FC<any>
    export default ReactFlow
}

// Radix UI primitives placeholders
declare module '@radix-ui/react-collapsible' { const content: any; export = content }
declare module '@radix-ui/react-dialog' { const content: any; export = content }
declare module '@radix-ui/react-dropdown-menu' { const content: any; export = content }
declare module '@radix-ui/react-popover' { const content: any; export = content }
declare module '@radix-ui/react-avatar' { const content: any; export = content }
declare module '@radix-ui/react-accordion' { const content: any; export = content }
declare module '@radix-ui/react-toast' { const content: any; export = content }
declare module '@radix-ui/react-slot' {
    export const Slot: any
    const content: any; export = content
}
declare module '@radix-ui/react-scroll-area' { const content: any; export = content }
declare module '@radix-ui/react-tabs' { const content: any; export = content }
declare module '@radix-ui/react-progress' { const content: any; export = content }
declare module '@radix-ui/react-separator' { const content: any; export = content }
declare module '@radix-ui/react-select' { const content: any; export = content }
declare module '@radix-ui/react-switch' { const content: any; export = content }
declare module '@radix-ui/react-label' { const content: any; export = content }
declare module '@radix-ui/react-alert-dialog' { const content: any; export = content }
declare module '@radix-ui/react-checkbox' { const content: any; export = content }
declare module '@radix-ui/react-context-menu' { const content: any; export = content }
declare module '@radix-ui/react-hover-card' { const content: any; export = content }
declare module '@radix-ui/react-menubar' { const content: any; export = content }
declare module '@radix-ui/react-navigation-menu' { const content: any; export = content }
declare module '@radix-ui/react-radio-group' { const content: any; export = content }
declare module '@radix-ui/react-slider' { const content: any; export = content }
declare module '@radix-ui/react-tooltip' { const content: any; export = content }
declare module '@radix-ui/react-toggle' { const content: any; export = content }
declare module '@radix-ui/react-toggle-group' { const content: any; export = content }
declare module '@radix-ui/react-aspect-ratio' { const content: any; export = content }

// Utility packages used in the repo
declare module 'clsx' { export function clsx(...args: any[]): string; export type ClassValue = any }
declare module 'tailwind-merge' { export function twMerge(...args: any[]): string }
declare module 'class-variance-authority' { export function cva(...args: any[]): any; export type VariantProps<T> = any }

// Resizable panels
declare module 'react-resizable-panels' { const content: any; export = content }

// next-themes
declare module 'next-themes' { export function useTheme(): { theme?: string } }

// Expose NextResponse as a value in addition to the type so JSON helpers work
declare module 'next/server' {
    export type NextRequest = any
    export const NextResponse: {
        json: (body: any, init?: any) => any
        redirect: (url: string, status?: number) => any
    }
}

// sonner minimal typings
declare module 'sonner' {
    import * as React from 'react'

    export interface ToasterProps {
        theme?: 'light' | 'dark' | 'system' | string
        className?: string
        style?: React.CSSProperties
        [key: string]: any
    }

    export const Toaster: React.FC<ToasterProps>
    export default Toaster
    export function toast(...args: any[]): void
}

// lucide-react - comprehensive icon exports as any
declare module 'lucide-react' {
    // Core icons
    export const AlertCircle: any
    export const Bot: any
    export const Mic: any
    export const Volume2: any
    export const GitBranch: any
    export const Database: any
    export const Zap: any
    export const Settings: any
    export const Play: any
    export const Save: any
    export const Trash2: any
    export const Mail: any
    export const MessageSquare: any
    export const Clock: any
    export const BarChart3: any
    export const FileText: any
    export const RotateCcw: any
    export const Copy: any
    export const Download: any
    export const Upload: any
    export const Eye: any
    export const EyeOff: any
    export const Maximize2: any
    export const Minimize2: any
    export const Grid3X3: any
    export const Layers: any
    export const Search: any
    export const Filter: any
    export const ChevronDown: any
    export const Check: any
    export const X: any
    export const AlertTriangle: any
    export const Info: any
    export const Plus: any
    export const Trash: any
    export const XCircle: any
    export const CheckCircle: any

    // Additional icons used in the codebase
    export const Phone: any
    export const Users: any
    export const Activity: any
    export const MicOff: any
    export const PhoneCall: any
    export const PhoneOff: any
    export const Globe: any
    export const Car: any
    export const TrendingUp: any
    export const PieChart: any
    export const LineChart: any
    export const Shield: any
    export const Brain: any
    export const Target: any
    export const RefreshCw: any
    export const MapPin: any
    export const Star: any
    export const User: any
    export const Navigation: any
    export const ChevronRight: any
    export const MoreHorizontal: any
    export const ArrowLeft: any
    export const ArrowRight: any

    // Icon variants (some UI components use *Icon suffix)
    export const ChevronDownIcon: any
    export const ChevronLeftIcon: any
    export const ChevronRightIcon: any
    export const CheckIcon: any
    export const SearchIcon: any
    export const CircleIcon: any
    export const XIcon: any
    export const MinusIcon: any
    export const ChevronUpIcon: any
    export const PanelLeftIcon: any
    export const GripVerticalIcon: any
    export const MoreHorizontalIcon: any

    const _default: any
    export default _default
}

// Allow CSS imports used for libraries like reactflow
declare module '*.css'
declare module '*.module.css'
declare module 'reactflow/dist/style.css'

// embla carousel
declare module 'embla-carousel-react' {
    export type UseEmblaCarouselType = any
    const content: any
    export default content
}

// react-slick/slick-carousel placeholders
declare module 'react-slick' { const content: any; export = content }
declare module 'slick-carousel' { const content: any; export = content }

// chart libs
declare module 'chart.js' { const content: any; export = content }
declare module 'react-chartjs-2' { const content: any; export = content }

// next/server minimal
declare module 'next/server' {
    export type NextRequest = any
    export type NextResponse = any
}

declare module 'next' {
    export type NextConfig = any
    export type Metadata = any
}

// prisma
declare module '@prisma/client' {
    export type PrismaClient = any
    export const PrismaClient: any
}

// socket.io
declare module 'socket.io' { export type Server = any }
declare module 'socket.io-client' {
    export const io: any
    const content: any
    export = content
}

// Recharts global namespace
declare namespace RechartsPrimitive {
    export type LegendProps = any
}

// Additional missing modules
declare module 'recharts' {
    const content: any; export = content;
}

declare module 'zod' {
    export const z: any;
    const content: any; export = content;
}

declare module 'tailwindcss' {
    export type Config = any;
    const content: any; export = content;
}

declare module 'tailwindcss-animate' { const content: any; export = content }
declare module 'z-ai-web-dev-sdk' { const content: any; export = content }

declare module 'react-day-picker' {
    export const DayButton: any
    export const DayPicker: any
    export const getDefaultClassNames: any
    const content: any; export = content
}

declare module 'cmdk' {
    export const Command: any
    const content: any; export = content
}

declare module 'vaul' {
    export const Drawer: any
    const content: any; export = content
}

declare module 'react-hook-form' {
    export const Controller: any;
    export const FormProvider: any;
    export const useFormContext: any;
    export const useFormState: any;
    export type ControllerProps<T = any, U = any> = any;
    export type FieldPath<T = any> = any;
    export type FieldValues = any;
    const content: any; export = content;
} declare module 'input-otp' {
    export const OTPInput: any
    export const OTPInputContext: any
    const content: any; export = content
}

// Next.js modules
declare module 'next/font/google' {
    export const Geist: any
    export const Geist_Mono: any
    const content: any; export = content
}
