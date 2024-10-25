import Home from '../pages/Home';
import VerifyEmail from '../pages/VerifyEmail';

interface RouteType {
    path: string;
    component: React.FC;
    layout?: React.FC | null;
    props?: Record<string, unknown>;
}

export const publicRoutes: RouteType[] = [
    {
        path: '/',
        component: Home,
    },
    {
        path: '/VerifyEmail',
        component: VerifyEmail,
    },
];
