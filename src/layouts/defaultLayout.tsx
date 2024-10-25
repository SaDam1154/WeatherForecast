import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const DefaultLayout: React.FC<LayoutProps> = ({ children }) => {
    return <div className='min-h-screen h-auto w-full flex flex-col '>{children}</div>;
};

export default DefaultLayout;
