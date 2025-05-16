declare module 'wouter' {
  import { ComponentType, ReactNode } from 'react';

  export type Params = Record<string, string>;
  export type LocationHook = () => [string, (path: string) => void];
  export type RouteComponentProps<P extends Params = Params> = { params: P };

  export interface LinkProps {
    href: string;
    children?: ReactNode;
    className?: string;
    onClick?: (event: MouseEvent) => void;
    [key: string]: any;
  }

  export interface SwitchProps {
    location?: string;
    children?: ReactNode;
    [key: string]: any;
  }

  export interface RouteProps {
    path?: string;
    component?: ComponentType<any>;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Link: ComponentType<LinkProps>;
  export const Route: ComponentType<RouteProps>;
  export const Switch: ComponentType<SwitchProps>;
  export const useLocation: LocationHook;
  export const useParams: <P extends Params = Params>() => P;
  export const useRoute: (pattern: string) => [boolean, Params];
}